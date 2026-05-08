from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# 🔥 FIX IMPORT PATH FOR AZURE / LOCAL
import sys
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# ✅ IMPORTS
from api.deviation_pipeline import run_deviation_pipeline
from ai_modules.genai_reasoning import generate_preventive_actions

from database.db import engine, SessionLocal
from database.models import Base, Deviation

import json
from datetime import datetime

app = FastAPI()

# ✅ CREATE TABLES
Base.metadata.create_all(bind=engine)

# ✅ CORS CONFIG (FIXED)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# TEST ROUTES
# ---------------------------------------------------
@app.get("/")
def home():
    return {"status": "API is running 🚀"}

@app.get("/health")
def health():
    return {"message": "working fine ✅"}

# ---------------------------------------------------
# HELPER FUNCTION
# ---------------------------------------------------
def safe_json(data, default):
    try:
        return json.dumps(data if data else default)
    except Exception:
        return json.dumps(default)

# ---------------------------------------------------
# ANALYZE DEVIATION
# ---------------------------------------------------
@app.post("/analyze-deviation")
def analyze_deviation(data: dict):
    db = SessionLocal()
    try:
        result = run_deviation_pipeline(data)

        analysis = result.get("analysis", {})
        draft = result.get("draft", "")

        severity = analysis.get("severity", "Medium")
        root_causes = analysis.get("probable_root_causes", [])
        corrective = analysis.get("corrective_actions", [])
        preventive = analysis.get("preventive_actions", [])

        new_dev = Deviation(
            event=data.get("event", ""),
            date=data.get("date", ""),
            study=data.get("study", ""),
            severity=severity,
            root_causes=safe_json(root_causes, []),
            corrective_actions=safe_json(corrective, []),
            preventive_actions=safe_json(preventive, []),
            capa=safe_json(corrective + preventive, []),
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
# RUN SERVER (LOCAL ONLY)
# ---------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.server:app", host="0.0.0.0", port=8000, reload=True)