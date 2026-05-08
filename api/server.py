from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# 🔥 FIX FOR AZURE IMPORT PATH (IMPORTANT)
import sys
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# ✅ now imports will work
from workflows.deviation_pipeline import run_deviation_pipeline
from ai_modules.genai_reasoning import generate_preventive_actions

# Database imports
from database.db import engine, SessionLocal
from database.models import Base, Deviation

import json
from datetime import datetime

app = FastAPI()

# create tables automatically
Base.metadata.create_all(bind=engine)

def ensure_schema_columns():
    with engine.connect() as connection:
        existing_columns = {
            row[1] for row in connection.exec_driver_sql("PRAGMA table_info(deviations)").fetchall()
        }
        if "signatures" not in existing_columns:
            connection.exec_driver_sql("ALTER TABLE deviations ADD COLUMN signatures TEXT DEFAULT '{}' ")
            connection.commit()

ensure_schema_columns()

# allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# BASIC TEST ROUTE (VERY IMPORTANT FOR DEBUG)
# ---------------------------------------------------
@app.get("/")
def home():
    return {"status": "API is running 🚀"}

# Helper function to update history
def update_history(deviation, action, new_status, comments=""):
    history = json.loads(deviation.history) if deviation.history else []
    history.append({
        "timestamp": datetime.utcnow().isoformat(),
        "action": action,
        "status": new_status,
        "version": deviation.version + 1,
        "comments": comments
    })
    deviation.history = json.dumps(history)
    deviation.version += 1
    deviation.status = new_status

def normalize_signatures(raw_signatures):
    if not raw_signatures:
        return {}
    if isinstance(raw_signatures, dict):
        return raw_signatures
    try:
        return json.loads(raw_signatures)
    except Exception:
        return {}

# ---------------------------------------------------
# Analyze Deviation Endpoint
# ---------------------------------------------------
@app.post("/analyze-deviation")
def analyze_deviation(data: dict):
    db = SessionLocal()
    try:
        pipeline_result = run_deviation_pipeline(data)

        analysis = pipeline_result["analysis"]
        draft = pipeline_result["draft"]

        new_dev = Deviation(
            event=data.get("event", ""),
            date=data.get("date", ""),
            study=data.get("study", ""),
            severity=analysis["severity"],
            root_causes=json.dumps(analysis["probable_root_causes"]),
            corrective_actions=json.dumps(analysis["corrective_actions"]),
            preventive_actions=json.dumps(analysis["preventive_actions"]),
            capa=json.dumps(analysis["corrective_actions"] + analysis["preventive_actions"]),
            deviation_memo_draft=draft,
            status="Draft",
            version=1,
            history=json.dumps([{
                "timestamp": datetime.utcnow().isoformat(),
                "action": "created",
                "status": "Draft",
                "version": 1
            }]),
            created_at=datetime.utcnow()
        )

        db.add(new_dev)
        db.commit()
        db.refresh(new_dev)

        return {
            "id": new_dev.id,
            "analysis": analysis,
            "draft": draft
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


# ---------------------------------------------------
# SIMPLE CHECK ROUTE
# ---------------------------------------------------
@app.get("/health")
def health():
    return {"message": "working fine ✅"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.server:app", host="0.0.0.0", port=8000)