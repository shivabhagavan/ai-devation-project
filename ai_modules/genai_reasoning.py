import os
import json
import re
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
        print("[WARNING] OPENAI_API_KEY not found. Running in fallback mode.")
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
    overall_risk = _normalize_risk_level(risk_assessment.get("overall_risk"))
    impact = _normalize_risk_level(risk_assessment.get("impact"))

    risk_levels = [
        _normalize_risk_level(risk_assessment.get("patient_safety")),
        _normalize_risk_level(risk_assessment.get("regulatory_compliance")),
        _normalize_risk_level(risk_assessment.get("data_integrity")),
        _normalize_risk_level(risk_assessment.get("product_quality")),
        overall_risk,
        impact,
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


def _load_json_response(result_text):
    """Parse model JSON, including occasional fenced JSON responses."""
    try:
        return json.loads(result_text)
    except json.JSONDecodeError:
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", result_text, re.DOTALL)
        if match:
            return json.loads(match.group(1))

        start = result_text.find("{")
        end = result_text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(result_text[start:end + 1])

        raise


def _ensure_list(value, default):
    if value is None:
        return default
    if isinstance(value, list):
        return value
    return [str(value)]


def _normalize_analysis(analysis, deviation_input):
    analysis.setdefault("risk_assessment", {})
    analysis.setdefault("reasoning", [])
    analysis.setdefault("probable_root_causes", [])
    analysis.setdefault("investigation", {})
    analysis.setdefault("confidence_score", 0.5)

    legacy_capa = analysis.get("corrective_and_preventive_actions", [])
    analysis["corrective_actions"] = _ensure_list(
        analysis.get("corrective_actions"),
        _ensure_list(legacy_capa, ["Manual review required"])
    )
    analysis["preventive_actions"] = _ensure_list(
        analysis.get("preventive_actions"),
        ["Improve SOP adherence and monitoring"]
    )
    analysis["reasoning"] = _ensure_list(analysis.get("reasoning"), ["AI analysis completed"])
    analysis["probable_root_causes"] = _ensure_list(
        analysis.get("probable_root_causes"),
        ["Root cause under investigation"]
    )

    risk_assessment = analysis["risk_assessment"]
    if "overall_risk" in risk_assessment:
        overall_risk = _normalize_risk_level(risk_assessment.get("overall_risk"))
        for key in ["patient_safety", "regulatory_compliance", "product_quality"]:
            risk_assessment.setdefault(key, overall_risk)
    if "impact" in risk_assessment:
        risk_assessment.setdefault("data_integrity", _normalize_risk_level(risk_assessment.get("impact")))

    confidence = analysis.get("confidence_score", 0.5)
    if isinstance(confidence, (int, float)) and confidence > 1:
        analysis["confidence_score"] = round(confidence / 100, 2)

    analysis["severity"] = _calibrate_severity(
        deviation_input,
        risk_assessment,
        analysis.get("severity")
    )

    return analysis


# ---------------------------------------
# MAIN ANALYSIS FUNCTION
# ---------------------------------------
def analyze_deviation(deviation_input):
    client = get_client()

    context_docs = retrieve_context(deviation_input, top_k=3)
    reference_context = "\n\n".join(context_docs)

    # 🚨 FALLBACK IF OPENAI NOT AVAILABLE
    if client is None:
        print("[WARNING] Using fallback AI response")

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

Return ONLY JSON with this exact structure:
{{
  "severity": "Low | Medium | High",
  "risk_assessment": {{
    "patient_safety": "Low | Medium | High",
    "regulatory_compliance": "Low | Medium | High",
    "data_integrity": "Low | Medium | High",
    "product_quality": "Low | Medium | High"
  }},
  "reasoning": ["..."],
  "probable_root_causes": ["..."],
  "corrective_actions": ["..."],
  "preventive_actions": ["..."],
  "investigation": {{
    "process_point": "...",
    "cause_category": "...",
    "cause_detail": "...",
    "functional_area": "..."
  }},
  "confidence_score": 0.0
}}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Return only JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=1500
        )

        result_text = response.choices[0].message.content.strip()
        analysis = _load_json_response(result_text)

        return _normalize_analysis(analysis, deviation_input)

    except Exception as e:
        print(f"[ERROR] AI error: {e}")

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
        print(f"[ERROR] Preventive generation failed: {e}")
        return ["Fallback preventive action"]
