import json
import logging
import os
import sys
import time
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from api.deviation_pipeline import run_deviation_pipeline
from database.db import SessionLocal, engine
from database.models import Base, Deviation

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("devmem-api")

app = FastAPI(title="DevMem API", version="1.0.0")

Base.metadata.create_all(bind=engine)
logger.info("Database tables initialized")

allowed_origins = [
    "https://gray-pond-02c148a10.7.azurestaticapps.net",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
extra_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
allowed_origins.extend([origin.strip() for origin in extra_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled request error path=%s method=%s", request.url.path, request.method)
        raise
    duration_ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info("%s %s -> %s %.2fms", request.method, request.url.path, response.status_code, duration_ms)
    return response


def safe_json(data, default):
    try:
        return json.dumps(data if data else default)
    except Exception:
        return json.dumps(default)


def safe_parse(value, default):
    if value is None:
        return default
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value)
    except Exception:
        return default


def deviation_payload(deviation: Deviation):
    return {
        "id": deviation.id,
        "event": deviation.event,
        "date": deviation.date,
        "study": deviation.study,
        "severity": deviation.severity,
        "root_cause": safe_parse(deviation.root_causes, []),
        "root_causes": safe_parse(deviation.root_causes, []),
        "corrective_actions": safe_parse(deviation.corrective_actions, []),
        "preventive_actions": safe_parse(deviation.preventive_actions, []),
        "capa": safe_parse(deviation.capa, []),
        "deviation_memo_draft": deviation.deviation_memo_draft,
        "status": deviation.status,
        "version": deviation.version,
        "history": safe_parse(deviation.history, []),
        "signatures": safe_parse(deviation.signatures, {}),
        "document_filename": deviation.document_filename,
        "document_content": deviation.document_content,
        "created_at": str(deviation.created_at) if deviation.created_at else None,
    }


@app.get("/")
def home():
    return {"status": "API is running"}


@app.get("/health")
def health():
    return {"message": "working fine ✅"}


@app.post("/auth/login")
def login(data: dict):
    role = data.get("role") or data.get("personnelContext") or "DM Owner"
    username = data.get("username") or "demo"
    return {
        "data": {
            "token": f"demo-token-{role.replace(' ', '-').lower()}",
            "user": {"username": username, "role": role},
        }
    }


@app.post("/analyze-deviation")
def analyze_deviation(data: dict):
    db = SessionLocal()
    try:
        result = run_deviation_pipeline(data)
        analysis = result.get("analysis", {})
        draft = result.get("draft", "")
        corrective = analysis.get("corrective_actions", [])
        preventive = analysis.get("preventive_actions", [])

        new_dev = Deviation(
            event=data.get("event", ""),
            date=data.get("date", ""),
            study=data.get("study", ""),
            severity=analysis.get("severity", "Medium"),
            root_causes=safe_json(analysis.get("probable_root_causes", []), []),
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
                "version": 1,
            }]),
            document_filename=data.get("document_filename"),
            document_content=data.get("document_content"),
            created_at=datetime.utcnow(),
        )

        db.add(new_dev)
        db.commit()
        db.refresh(new_dev)
        logger.info("Created deviation id=%s severity=%s", new_dev.id, new_dev.severity)
        return {"id": new_dev.id, "analysis": analysis, "draft": draft}

    except Exception as e:
        logger.exception("Failed to analyze deviation")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/dashboard-metrics")
def get_dashboard_metrics():
    db = SessionLocal()
    try:
        total = db.query(Deviation).count()
        high = db.query(Deviation).filter(Deviation.severity == "High").count()
        medium = db.query(Deviation).filter(Deviation.severity == "Medium").count()
        low = db.query(Deviation).filter(Deviation.severity == "Low").count()
        open_count = db.query(Deviation).filter(Deviation.status.notin_(["Closed"])).count()
        closed_count = db.query(Deviation).filter(Deviation.status == "Closed").count()
        return {
            "total_deviations": total,
            "high": high,
            "medium": medium,
            "low": low,
            "open": open_count,
            "closed": closed_count,
        }
    except Exception as e:
        logger.exception("Failed to load dashboard metrics")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/dashboard/chart-data")
def get_chart_data():
    db = SessionLocal()
    try:
        deviations = db.query(Deviation).order_by(Deviation.created_at.asc()).all()
        return {
            "deviations": [
                {"id": d.id, "status": d.status, "severity": d.severity, "date": d.date}
                for d in deviations
            ]
        }
    except Exception as e:
        logger.exception("Failed to load chart data")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/deviations")
def get_deviations(role: Optional[str] = Query(default=None)):
    db = SessionLocal()
    try:
        deviations = db.query(Deviation).order_by(Deviation.created_at.desc()).all()
        return [
            {
                "id": d.id,
                "event": d.event,
                "date": d.date,
                "study": d.study,
                "severity": d.severity,
                "status": d.status,
            }
            for d in deviations
        ]
    except Exception as e:
        logger.exception("Failed to load deviations role=%s", role)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/deviation/{deviation_id}")
def get_deviation(deviation_id: int):
    db = SessionLocal()
    try:
        deviation = db.query(Deviation).filter(Deviation.id == deviation_id).first()
        if not deviation:
            raise HTTPException(status_code=404, detail="Deviation not found")
        return deviation_payload(deviation)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to load deviation id=%s", deviation_id)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.put("/deviation/{deviation_id}/update-memo")
def update_memo(deviation_id: int, data: dict):
    db = SessionLocal()
    try:
        deviation = db.query(Deviation).filter(Deviation.id == deviation_id).first()
        if not deviation:
            raise HTTPException(status_code=404, detail="Deviation not found")
        if "memo" in data:
            deviation.deviation_memo_draft = data["memo"]
        if "document_filename" in data:
            deviation.document_filename = data["document_filename"]
        if "document_content" in data:
            deviation.document_content = data["document_content"]
        db.commit()
        return {"message": "Memo updated successfully", "id": deviation.id}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to update memo id=%s", deviation_id)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.put("/deviation/{deviation_id}/send-for-review")
def send_for_review(deviation_id: int, data: dict):
    return set_deviation_status(deviation_id, "QA Review", "sent_for_review", data)


@app.put("/deviation/{deviation_id}/resubmit")
def resubmit_deviation(deviation_id: int, data: dict):
    db = SessionLocal()
    try:
        deviation = db.query(Deviation).filter(Deviation.id == deviation_id).first()
        if not deviation:
            raise HTTPException(status_code=404, detail="Deviation not found")
        deviation.status = "QA Review"
        deviation.version = (deviation.version or 1) + 1
        append_history(deviation, "resubmitted", data.get("comments", ""))
        db.commit()
        return {"message": "Resubmitted for QA review", "status": deviation.status}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to resubmit deviation id=%s", deviation_id)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.put("/deviation/{deviation_id}/approve")
def approve_deviation(deviation_id: int, data: dict):
    role = data.get("role", "")
    if role in ["Approver", "DM Approver"]:
        return set_deviation_status(deviation_id, "Closed", "approver_approved", data)
    return set_deviation_status(deviation_id, "Pending Approval", "qa_approved", data)


@app.put("/deviation/{deviation_id}/reject")
def reject_deviation(deviation_id: int, data: dict):
    role = data.get("role", "")
    if role in ["Approver", "DM Approver"]:
        return set_deviation_status(deviation_id, "QA Review", "approver_rejected", data)
    return set_deviation_status(deviation_id, "Owner Review", "qa_rejected", data)


@app.put("/deviation/{deviation_id}/signature")
def save_signature(deviation_id: int, data: dict):
    db = SessionLocal()
    try:
        deviation = db.query(Deviation).filter(Deviation.id == deviation_id).first()
        if not deviation:
            raise HTTPException(status_code=404, detail="Deviation not found")
        role_map = {
            "DM Owner": "owner",
            "DM QA": "qa",
            "QA": "qa",
            "QA Reviewer": "qa",
            "DM Approver": "approver",
            "Approver": "approver",
        }
        sig_key = role_map.get(data.get("role", ""))
        if not sig_key:
            raise HTTPException(status_code=400, detail="Invalid role for signature")
        signatures = safe_parse(deviation.signatures, {})
        signatures[sig_key] = {
            "name": data.get("name", ""),
            "signed_at": datetime.utcnow().isoformat(),
        }
        deviation.signatures = json.dumps(signatures)
        db.commit()
        return {"message": "Signature saved", "signatures": signatures}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to save signature id=%s", deviation_id)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.delete("/deviation/{deviation_id}")
def delete_deviation(deviation_id: int):
    db = SessionLocal()
    try:
        deviation = db.query(Deviation).filter(Deviation.id == deviation_id).first()
        if not deviation:
            raise HTTPException(status_code=404, detail="Deviation not found")
        if deviation.status != "Draft":
            raise HTTPException(status_code=400, detail="Only Draft deviations can be deleted")
        db.delete(deviation)
        db.commit()
        return {"message": "Deviation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to delete deviation id=%s", deviation_id)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.put("/close-deviation/{deviation_id}")
def close_deviation(deviation_id: int, data: dict):
    return set_deviation_status(deviation_id, "Closed", "closed", data)


@app.get("/download-pdf/{deviation_id}")
def download_pdf(deviation_id: int):
    db = SessionLocal()
    try:
        deviation = db.query(Deviation).filter(Deviation.id == deviation_id).first()
        if not deviation:
            raise HTTPException(status_code=404, detail="Deviation not found")
        content = f"""DEVIATION MEMO

Case ID: DEV-{str(deviation.id).zfill(4)}
Date: {deviation.date or 'N/A'}
Product / Study: {deviation.study or 'N/A'}
Severity: {deviation.severity or 'N/A'}
Status: {deviation.status or 'N/A'}

Description:
{deviation.event or 'N/A'}

Memo:
{deviation.deviation_memo_draft or 'No memo available.'}
"""
        return Response(
            content=content,
            media_type="text/plain",
            headers={"Content-Disposition": f'attachment; filename="deviation-{deviation.id}.txt"'},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to download deviation id=%s", deviation_id)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


def append_history(deviation: Deviation, action: str, comments: str = ""):
    history = safe_parse(deviation.history, [])
    history.append({
        "timestamp": datetime.utcnow().isoformat(),
        "action": action,
        "status": deviation.status,
        "version": deviation.version,
        "comments": comments,
    })
    deviation.history = json.dumps(history)


def set_deviation_status(deviation_id: int, status: str, action: str, data: dict):
    db = SessionLocal()
    try:
        deviation = db.query(Deviation).filter(Deviation.id == deviation_id).first()
        if not deviation:
            raise HTTPException(status_code=404, detail="Deviation not found")
        deviation.status = status
        append_history(deviation, action, data.get("comments", ""))
        db.commit()
        return {"message": "Deviation updated", "status": deviation.status}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to set status id=%s status=%s", deviation_id, status)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api.server:app", host="0.0.0.0", port=8000, reload=True)
