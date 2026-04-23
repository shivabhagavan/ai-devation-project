from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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
# Analyze Deviation Endpoint (AI + Save to DB)
# ---------------------------------------------------

@app.post("/analyze-deviation")
def analyze_deviation(data: dict):
    """
    Analyze deviation using AI pipeline and save to database.
    """
    print(f"📥 Received deviation input: {data}")

    # Run the AI pipeline
    pipeline_result = run_deviation_pipeline(data)

    analysis = pipeline_result["analysis"]
    draft = pipeline_result["draft"]

    print(f"🤖 AI Analysis for DEV-{new_dev.id if 'new_dev' in locals() else 'new'}: {json.dumps(analysis, indent=2)}")

    # Store in database
    db = SessionLocal()
    try:
        # Use input severity if provided, otherwise use AI analysis
        input_severity = data.get("severity")
        final_severity = input_severity if input_severity and input_severity in ["High", "Medium", "Low"] else analysis["severity"]

        new_dev = Deviation(
            event=data.get("event", ""),
            date=data.get("date", ""),
            study=data.get("study", ""),
            severity=final_severity,
            root_causes=json.dumps(analysis["probable_root_causes"]),
            corrective_actions=json.dumps(analysis["corrective_actions"]),
            preventive_actions=json.dumps(analysis["preventive_actions"]),
            capa=json.dumps(analysis["corrective_actions"] + analysis["preventive_actions"]),  # Combined for backward compatibility
            deviation_memo_draft=draft,
            status="Draft",
            version=1,
            history=json.dumps([{
                "timestamp": datetime.utcnow().isoformat(),
                "action": "created",
                "status": "Draft",
                "version": 1,
                "comments": "AI-generated deviation"
            }]),
            document_filename=data.get("document_filename"),
            document_content=data.get("document_content"),
            created_at=datetime.utcnow()
        )

        db.add(new_dev)
        db.commit()
        db.refresh(new_dev)

        print(f"💾 Deviation saved to DB with ID: {new_dev.id}")

    except Exception as e:
        db.rollback()
        print(f"❌ Database error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save deviation")
    finally:
        db.close()

    # Return result
    return {
        "id": new_dev.id,
        "event": new_dev.event,
        "date": new_dev.date,
        "study": new_dev.study,
        "status": new_dev.status,
        "analysis": analysis,
        "draft": draft
    }


# ---------------------------------------------------
# Dashboard Metrics Endpoint
# ---------------------------------------------------

@app.get("/dashboard-metrics")
def dashboard_metrics():

    db = SessionLocal()

    total = db.query(Deviation).count()

    high = db.query(Deviation).filter(
        Deviation.severity == "High"
    ).count()

    medium = db.query(Deviation).filter(
        Deviation.severity == "Medium"
    ).count()

    low = db.query(Deviation).filter(
        Deviation.severity == "Low"
    ).count()

    open_dev = db.query(Deviation).filter(
        Deviation.status == "Open"
    ).count()

    closed_dev = db.query(Deviation).filter(
        Deviation.status == "Closed"
    ).count()

    db.close()

    return {
        "total_deviations": total,
        "high": high,
        "medium": medium,
        "low": low,
        "open": open_dev,
        "closed": closed_dev
    }


# ---------------------------------------------------
# Get All Deviations (Reports Page)
# ---------------------------------------------------

@app.get("/deviations")
def get_deviations(role: str = "DM Owner"):
    """
    Get deviations with role-based filtering.
    - DM Owner: Can see Draft + all other statuses
    - QA Reviewer: Cannot see Draft (only Under Review and later)
    - Approver: Cannot see Draft (only Under Approval and later)
    """
    db = SessionLocal()

    deviations = db.query(Deviation).order_by(Deviation.id.desc()).all()

    data = []
    for d in deviations:
        # Filter based on role
        if role not in ["DM Owner", "System Admin"]:
            # Hide Draft deviations from non-owner roles
            if d.status == "Draft":
                continue
        
        root_causes = json.loads(d.root_causes) if d.root_causes else []
        event_summary = root_causes[0] if root_causes else d.event
        data.append({
            "id": d.id,
            "event": event_summary,
            "date": d.date,
            "study": d.study,
            "severity": d.severity,
            "status": d.status
        })

    db.close()
    return data


# ---------------------------------------------------
# Get Single Deviation Details
# ---------------------------------------------------

@app.get("/deviation/{dev_id}")
def get_deviation(dev_id: int):
    db = SessionLocal()

    d = db.query(Deviation).filter(Deviation.id == dev_id).first()

    if not d:
        db.close()
        return {"error": "Deviation not found"}

    parsed_capa = None
    try:
        parsed_capa = json.loads(d.capa) if d.capa else None
    except Exception:
        parsed_capa = d.capa

    corrective_actions = None
    preventive_actions = None
    try:
        corrective_actions = json.loads(d.corrective_actions) if getattr(d, 'corrective_actions', None) else None
    except Exception:
        corrective_actions = d.corrective_actions

    try:
        preventive_actions = json.loads(d.preventive_actions) if getattr(d, 'preventive_actions', None) else None
    except Exception:
        preventive_actions = d.preventive_actions

    if not preventive_actions:
        try:
            preventive_actions = generate_preventive_actions(
                d.event,
                root_causes=json.loads(d.root_causes) if d.root_causes else None,
                corrective_actions=corrective_actions
            )
            d.preventive_actions = json.dumps(preventive_actions)
            d.capa = json.dumps((json.loads(d.capa) if d.capa else []) + preventive_actions)
            d.capa = json.dumps(list(dict.fromkeys(json.loads(d.capa))))
            db.commit()
        except Exception as e:
            print(f"⚠️ Failed to generate fallback preventive_actions: {e}")
            preventive_actions = []

    response = {
        "id": d.id,
        "event": d.event,
        "date": d.date,
        "study": d.study,
        "severity": d.severity,
        "root_cause": json.loads(d.root_causes),
        "capa": parsed_capa,
        "corrective_actions": corrective_actions,
        "preventive_actions": preventive_actions,
        "deviation_memo_draft": getattr(d, 'deviation_memo_draft', None),
        "signatures": normalize_signatures(getattr(d, 'signatures', None)),
        "document_filename": getattr(d, 'document_filename', None),
        "status": d.status,
        "version": d.version,
        "history": json.loads(d.history) if d.history else []
    }
    db.close()
    return response


# ---------------------------------------------------
# Close Deviation
# ---------------------------------------------------

@app.put("/close-deviation/{dev_id}")
def close_deviation(dev_id: int):
    db = SessionLocal()

    d = db.query(Deviation).filter(Deviation.id == dev_id).first()

    if d:
        d.status = "Closed"
        db.commit()

    db.close()

    return {"message": "Deviation closed successfully"}


# ---------------------------------------------------
# Update Deviation Memo (Owner edits AI draft)
# ---------------------------------------------------

@app.put("/deviation/{dev_id}/update-memo")
def update_memo(dev_id: int, data: dict):
    db = SessionLocal()
    d = db.query(Deviation).filter(Deviation.id == dev_id).first()
    if not d:
        db.close()
        return {"error": "Deviation not found"}

    d.deviation_memo_draft = data.get("memo", d.deviation_memo_draft)
    if "document_filename" in data:
        d.document_filename = data.get("document_filename")
    if "document_content" in data:
        d.document_content = data.get("document_content")
    update_history(d, "memo_updated", d.status, data.get("comments", "Owner edited memo"))
    db.commit()
    db.close()
    return {"message": "Memo updated successfully"}


@app.put("/deviation/{dev_id}/signature")
def update_signature(dev_id: int, data: dict):
    db = SessionLocal()
    d = db.query(Deviation).filter(Deviation.id == dev_id).first()
    if not d:
        db.close()
        raise HTTPException(status_code=404, detail="Deviation not found")

    role = (data.get("role") or "").strip()
    signer_name = (data.get("name") or "").strip()

    role_key_map = {
        "DM Owner": "owner",
        "DM QA": "qa",
        "DM Approver": "approver",
    }

    if role not in role_key_map:
        db.close()
        raise HTTPException(status_code=403, detail="This role cannot sign the compliance memo")

    if not signer_name:
        db.close()
        raise HTTPException(status_code=400, detail="Signer name is required")

    signatures = normalize_signatures(getattr(d, 'signatures', None))
    slot = role_key_map[role]
    signatures[slot] = {
        "name": signer_name,
        "role": role,
        "signed_at": datetime.utcnow().isoformat()
    }
    d.signatures = json.dumps(signatures)
    db.commit()
    db.close()
    return {"message": "Signature saved successfully", "signatures": signatures}


# ---------------------------------------------------
# Send Deviation for Investigation (Owner -> QA)
# ---------------------------------------------------

@app.put("/deviation/{dev_id}/send-for-review")
def send_for_review(dev_id: int, data: dict = None):
    db = SessionLocal()
    d = db.query(Deviation).filter(Deviation.id == dev_id).first()
    if not d:
        db.close()
        raise HTTPException(status_code=404, detail="Deviation not found")

    comments = (data or {}).get("comments", "Submitted for QA review")
    update_history(d, "sent_for_qa_review", "QA Review", comments)
    db.commit()
    db.close()
    return {"message": "Deviation sent for QA review"}


# ---------------------------------------------------
# Delete Draft Deviation
@app.delete("/deviation/{dev_id}")
def delete_deviation(dev_id: int):
    db = SessionLocal()
    d = db.query(Deviation).filter(Deviation.id == dev_id).first()
    if not d:
        db.close()
        raise HTTPException(status_code=404, detail="Deviation not found")

    if d.status != "Draft":
        db.close()
        raise HTTPException(status_code=400, detail="Only draft deviations can be deleted")

    db.delete(d)
    db.commit()
    db.close()
    return {"message": "Draft deviation deleted successfully"}


# ---------------------------------------------------
# QA Approve -> Send for Approval
# ---------------------------------------------------

@app.put("/deviation/{dev_id}/qa-approve")
def qa_approve(dev_id: int):
    db = SessionLocal()
    d = db.query(Deviation).filter(Deviation.id == dev_id).first()
    if not d:
        db.close()
        return {"error": "Deviation not found"}

    d.status = "Pending Approval"
    db.commit()
    db.close()
    return {"message": "Deviation sent for final approval"}


# ---------------------------------------------------
# QA Reject -> Send back to Owner
# ---------------------------------------------------

@app.put("/deviation/{dev_id}/qa-reject")
def qa_reject(dev_id: int, data: dict = None):
    db = SessionLocal()
    d = db.query(Deviation).filter(Deviation.id == dev_id).first()
    if not d:
        db.close()
        return {"error": "Deviation not found"}

    d.status = "Rework Required"
    db.commit()
    db.close()
    return {"message": "Deviation rejected, sent back to owner"}


# ---------------------------------------------------
# Approver Final Approve -> Close
# ---------------------------------------------------

@app.put("/deviation/{dev_id}/final-approve")
def final_approve(dev_id: int):
    db = SessionLocal()
    d = db.query(Deviation).filter(Deviation.id == dev_id).first()
    if not d:
        db.close()
        return {"error": "Deviation not found"}

    d.status = "Closed"
    db.commit()
    db.close()
    return {"message": "Deviation approved and closed"}


# ---------------------------------------------------
# Approver Reject -> Send back for rework
# ---------------------------------------------------

@app.put("/deviation/{dev_id}/final-reject")
def final_reject(dev_id: int):
    db = SessionLocal()
    d = db.query(Deviation).filter(Deviation.id == dev_id).first()
    if not d:
        db.close()
        return {"error": "Deviation not found"}

    d.status = "Rework Required"
    db.commit()
    db.close()
    return {"message": "Deviation rejected by approver"}


# ---------------------------------------------------
# New Role-Based Workflow Endpoints
# ---------------------------------------------------

@app.put("/deviation/{dev_id}/approve")
def approve_deviation(dev_id: int, data: dict):
    """
    Approve deviation based on role.
    - QA: status -> "Pending Approval"
    - Approver: status -> "Closed"
    """
    role = (data.get("role", "") or "").strip()
    role_normalized = role.lower()
    comments = data.get("comments", "")
    
    db = SessionLocal()
    d = db.query(Deviation).filter(Deviation.id == dev_id).first()
    if not d:
        db.close()
        raise HTTPException(status_code=404, detail="Deviation not found")
    
    if role_normalized in ["qa", "qa reviewer"]:
        new_status = "Pending Approval"
        action = "qa_approved"
    elif role_normalized in ["approver", "final approver"]:
        new_status = "Closed"
        action = "final_approved"
    else:
        db.close()
        raise HTTPException(status_code=400, detail="Invalid role for approval")
    
    update_history(d, action, new_status, comments)
    db.commit()
    db.close()
    return {"message": f"Deviation {action.replace('_', ' ')}"}

@app.put("/deviation/{dev_id}/reject")
def reject_deviation(dev_id: int, data: dict):
    """
    Reject deviation based on role.
    - QA: status -> "Owner Review"
    - Approver: status -> "Rework Required"
    """
    role = (data.get("role", "") or "").strip()
    role_normalized = role.lower()
    comments = data.get("comments", "")
    
    db = SessionLocal()
    d = db.query(Deviation).filter(Deviation.id == dev_id).first()
    if not d:
        db.close()
        raise HTTPException(status_code=404, detail="Deviation not found")
    
    if role_normalized in ["qa", "qa reviewer"]:
        new_status = "Owner Review"
        action = "qa_rejected"
    elif role_normalized in ["approver", "final approver"]:
        new_status = "Rework Required"
        action = "approver_rejected"
    else:
        db.close()
        raise HTTPException(status_code=400, detail="Invalid role for rejection")
    
    update_history(d, action, new_status, comments)
    db.commit()
    db.close()
    return {"message": f"Deviation {action.replace('_', ' ')}"}

@app.put("/deviation/{dev_id}/resubmit")
def resubmit_deviation(dev_id: int, data: dict):
    """
    Owner resubmits deviation after rework.
    status -> "QA Review"
    """
    role = (data.get("role", "") or "").strip()
    role_normalized = role.lower()
    comments = data.get("comments", "")
    
    if role_normalized not in ["dm owner", "owner"]:
        raise HTTPException(status_code=403, detail="Only owner can resubmit")
    
    db = SessionLocal()
    d = db.query(Deviation).filter(Deviation.id == dev_id).first()
    if not d:
        db.close()
        raise HTTPException(status_code=404, detail="Deviation not found")
    
    new_status = "QA Review"
    action = "resubmitted"
    update_history(d, action, new_status, comments)
    db.commit()
    db.close()
    return {"message": "Deviation resubmitted for QA review"}


# ---------------------------------------------------
# Authentication Endpoint
# ---------------------------------------------------

@app.post("/auth/login")
def login(credentials: dict):
    # For demo purposes: accept any username/password combination
    # In production, validate against a user database with hashed passwords
    username = credentials.get("username", "")
    password = credentials.get("password", "")
    role = credentials.get("role", "")
    
    if not username or not password or not role:
        return {"error": "Missing credentials", "status": 401}
    
    # Return a demo token (in production, use JWT)
    return {
        "message": "Login successful",
        "token": f"demo-token-{username}",
        "user": {
            "username": username,
            "role": role
        }
    }


# ---------------------------------------------------
# Dashboard Chart Data Endpoint
# ---------------------------------------------------

@app.get("/dashboard/chart-data")
def dashboard_chart_data():
    """Returns data for line chart (trends) and pie chart (status distribution)"""
    db = SessionLocal()
    
    # Line chart data - deviations by month (mock temporal data)
    line_data = [
        {"month": "Jan", "deviations": 12},
        {"month": "Feb", "deviations": 19},
        {"month": "Mar", "deviations": 15},
        {"month": "Apr", "deviations": 25},
        {"month": "May", "deviations": 22},
        {"month": "Jun", "deviations": 18}
    ]
    
    # Get status distribution from database
    open_count = db.query(Deviation).filter(Deviation.status == "Open").count()
    closed_count = db.query(Deviation).filter(Deviation.status == "Closed").count()
    assigned_count = max(0, db.query(Deviation).count() - open_count - closed_count)
    
    pie_data = [
        {"name": "Open", "value": open_count},
        {"name": "Assigned", "value": assigned_count},
        {"name": "Closed", "value": closed_count}
    ]
    
    db.close()
    
    return {
        "line_chart": line_data,
        "pie_chart": pie_data
    }


# ---------------------------------------------------
# Create Deviation from Form
# ---------------------------------------------------

@app.post("/deviations/create")
def create_deviation_form(form_data: dict):
    """Create a deviation from form submission (alternative to analyze-deviation)"""
    db = SessionLocal()
    
    try:
        new_dev = Deviation(
            event=form_data.get("event", form_data.get("narrativeObservation", "")),
            date=form_data.get("date", form_data.get("reportDate", "")),
            study=form_data.get("study", ""),
            severity=form_data.get("severity", "Medium"),
            root_causes=json.dumps({"causes": [form_data.get("rootCause", "")]}),
            capa=json.dumps({
                "corrective": form_data.get("correctiveAction", ""),
                "preventive": form_data.get("preventiveAction", "")
            }),
            status="Open",
            created_at=datetime.utcnow()
        )
        
        db.add(new_dev)
        db.commit()
        db.refresh(new_dev)
        
        result = {
            "id": new_dev.id,
            "event": new_dev.event,
            "date": new_dev.date,
            "study": new_dev.study,
            "severity": new_dev.severity,
            "status": new_dev.status,
            "message": "Deviation created successfully"
        }
        
        return result
        
    except Exception as e:
        db.rollback()
        return {"error": str(e), "status": 500}
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)