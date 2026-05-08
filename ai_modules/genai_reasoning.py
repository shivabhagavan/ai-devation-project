import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from ai_modules.rag_retriever import retrieve_context

load_dotenv()

# ---------------------------------------
# SAFE OPENAI CLIENT
# ---------------------------------------
def get_client():
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        print("⚠️ OPENAI_API_KEY not found. Running in fallback mode.")
        return None

    return OpenAI(api_key=api_key)


# ---------------------------------------
# HELPERS
# ---------------------------------------
def _normalize_risk_level(value):
    if not isinstance(value, str):
        return "Low"
    normalized = value.strip().capitalize()
    return normalized if normalized in ["Low", "Medium", "High"] else "Low"


def _calibrate_severity(deviation_input, risk_assessment, llm_severity):
    risk_assessment = risk_assessment or {}

    risk_levels = [
        _normalize_risk_level(risk_assessment.get("patient_safety")),
        _normalize_risk_level(risk_assessment.get("regulatory_compliance")),
        _normalize_risk_level(risk_assessment.get("data_integrity")),
        _normalize_risk_level(risk_assessment.get("product_quality")),
    ]

    high_count = sum(1 for r in risk_levels if r == "High")
    medium_count = sum(1 for r in risk_levels if r == "Medium")

    if high_count >= 1:
        calibrated = "High"
    elif medium_count >= 2:
        calibrated = "Medium"
    else:
        calibrated = "Low"

    text = (deviation_input or "").lower()

    if any(k in text for k in ["sterility", "contamination", "critical", "oos", "recall"]):
        calibrated = "High"
    elif calibrated == "Low" and any(k in text for k in ["repeat", "delay", "training gap"]):
        calibrated = "Medium"

    return calibrated


# ---------------------------------------
# MAIN ANALYSIS FUNCTION
# ---------------------------------------
def analyze_deviation(deviation_input):
    client = get_client()

    context_docs = retrieve_context(deviation_input, top_k=3)
    reference_context = "\n\n".join(context_docs)

    # 🚨 FALLBACK IF OPENAI NOT AVAILABLE
    if client is None:
        print("⚠️ Using fallback AI response")

        return {
            "severity": "Low",
            "risk_assessment": {
                "patient_safety": "Low",
                "regulatory_compliance": "Low",
                "data_integrity": "Low",
                "product_quality": "Low"
            },
            "reasoning": ["Fallback mode: AI unavailable"],
            "probable_root_causes": ["Insufficient data"],
            "corrective_actions": ["Review deviation manually"],
            "preventive_actions": ["Implement basic SOP checks"],
            "investigation": {
                "process_point": "Unknown",
                "cause_category": "Unknown",
                "cause_detail": "Unknown",
                "functional_area": "Unknown"
            },
            "confidence_score": 0.2
        }

    prompt = f"""
Analyze pharma deviation.

Deviation:
{deviation_input}

Context:
{reference_context}

Return ONLY JSON with:
severity, risk_assessment, reasoning, probable_root_causes,
corrective_actions, preventive_actions, investigation, confidence_score
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Return only JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1500
        )

        result_text = response.choices[0].message.content.strip()
        analysis = json.loads(result_text)

        # Normalize
        for key in ["corrective_actions", "preventive_actions"]:
            if not isinstance(analysis.get(key), list):
                analysis[key] = [str(analysis.get(key))]

        # Severity calibration
        analysis["severity"] = _calibrate_severity(
            deviation_input,
            analysis.get("risk_assessment"),
            analysis.get("severity")
        )

        return analysis

    except Exception as e:
        print(f"❌ AI error: {e}")

        # 🚨 SAFE FALLBACK
        return {
            "severity": "Low",
            "risk_assessment": {
                "patient_safety": "Low",
                "regulatory_compliance": "Low",
                "data_integrity": "Low",
                "product_quality": "Low"
            },
            "reasoning": ["AI failed, fallback used"],
            "probable_root_causes": ["Unknown"],
            "corrective_actions": ["Manual review required"],
            "preventive_actions": ["Implement SOP adherence"],
            "investigation": {
                "process_point": "Unknown",
                "cause_category": "Unknown",
                "cause_detail": "Unknown",
                "functional_area": "Unknown"
            },
            "confidence_score": 0.1
        }


# ---------------------------------------
# PREVENTIVE ACTION GENERATOR
# ---------------------------------------
def generate_preventive_actions(deviation_input, root_causes=None, corrective_actions=None):
    client = get_client()

    if client is None:
        return ["Implement SOP checks", "Improve training and monitoring"]

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Return JSON with preventive_actions list"},
                {"role": "user", "content": deviation_input}
            ],
            temperature=0.2,
            max_tokens=500
        )

        result = json.loads(response.choices[0].message.content.strip())
        return result.get("preventive_actions", ["Improve process control"])

    except Exception as e:
        print(f"❌ Preventive generation failed: {e}")
        return ["Fallback preventive action"]