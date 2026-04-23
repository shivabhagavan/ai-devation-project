import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv
from ai_modules.rag_retriever import retrieve_context

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def _normalize_risk_level(value):
    if not isinstance(value, str):
        return "Low"
    normalized = value.strip().capitalize()
    return normalized if normalized in ["Low", "Medium", "High"] else "Low"


def _severity_rank(level):
    return {"Low": 1, "Medium": 2, "High": 3}.get(level, 1)


def _calibrate_severity(deviation_input, risk_assessment, llm_severity):
    """
    Calibrate AI severity to reduce false Medium classifications on clearly low-risk inputs.
    """
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
        # 0 or 1 medium + rest low should be treated as Low to avoid over-classification.
        calibrated = "Low"

    text = (deviation_input or "").lower()
    high_keywords = [
        "sterility", "contamination", "critical", "injury", "adverse event",
        "out of specification", "oos", "recall", "regulatory breach", "fda", "death"
    ]
    medium_keywords = [
        "repeat deviation", "recurrence", "batch hold", "investigation delay", "missed deadline",
        "documentation gap", "training gap", "excursion"
    ]

    if any(k in text for k in high_keywords):
        calibrated = "High"
    elif calibrated == "Low" and any(k in text for k in medium_keywords):
        calibrated = "Medium"

    llm_severity = llm_severity if llm_severity in ["Low", "Medium", "High"] else "Low"

    # Use calibrated output as final guardrail to reduce false Medium/High classifications.
    # Keep AI severity only when both are already aligned.
    return llm_severity if llm_severity == calibrated else calibrated

def analyze_deviation(deviation_input):
    """
    Analyze deviation using RAG and generate structured JSON output.
    """
    # Retrieve relevant context from ChromaDB
    context_docs = retrieve_context(deviation_input, top_k=3)
    reference_context = "\n\n".join(context_docs)

    # Build the prompt
    prompt = f"""
You are a pharmaceutical compliance expert analyzing deviations in a GxP environment.

DEVIATION INPUT:
{deviation_input}

REFERENCE CONTEXT (SOPs, Regulations, Past Cases - for root cause analysis ONLY):
{reference_context}

INSTRUCTIONS:
- Analyze the deviation comprehensively to determine its severity level.
- Evaluate the actual impact on patient safety, product quality, regulatory compliance, and data integrity.
- Use your pharmaceutical expertise to classify severity as High, Medium, or Low based on the overall risk assessment.
- Default to LOW when impact is minor, localized, quickly corrected, and does not affect patient safety/product quality/compliance.
- Use MEDIUM only when there is meaningful compliance, quality, or data integrity concern.
- Use HIGH only for critical or patient-safety-impacting events.
- Consider the nature of the deviation, extent of impact, and any corrective actions already taken.
- Use reference context ONLY for suggesting root causes and CAPA strategies, not for inferring severity.
- Provide clear reasoning for your severity classification.
- Provide at least one corrective action AND at least one preventive action.
- Do NOT combine corrective and preventive actions into a single list.

OUTPUT JSON ONLY (no markdown, no explanation):

{{
"severity": "High | Medium | Low",
"risk_assessment": {{
"patient_safety": "Low | Medium | High",
"regulatory_compliance": "Low | Medium | High",
"data_integrity": "Low | Medium | High",
"product_quality": "Low | Medium | High"
}},
"reasoning": ["bullet1", "bullet2"],
"probable_root_causes": ["cause1", "cause2"],
"corrective_actions": ["action1", "action2"],
"preventive_actions": ["action1", "action2"],
"investigation": {{
"process_point": "",
"cause_category": "",
"cause_detail": "",
"functional_area": ""
}},
"confidence_score": 0.0
}}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a pharmaceutical compliance expert. Output only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=2000
        )

        result_text = response.choices[0].message.content.strip()

        # Parse and validate JSON
        analysis = json.loads(result_text)

        # Validate required keys
        required_keys = [
            "severity", "risk_assessment", "reasoning", "probable_root_causes",
            "corrective_actions", "preventive_actions", "investigation", "confidence_score"
        ]

        for key in required_keys:
            if key not in analysis:
                raise ValueError(f"Missing required key: {key}")

        # Validate risk_assessment sub-keys
        risk_keys = ["patient_safety", "regulatory_compliance", "data_integrity", "product_quality"]
        for key in risk_keys:
            if key not in analysis["risk_assessment"]:
                raise ValueError(f"Missing risk assessment key: {key}")
            analysis["risk_assessment"][key] = _normalize_risk_level(analysis["risk_assessment"][key])

        # Validate investigation sub-keys
        inv_keys = ["process_point", "cause_category", "cause_detail", "functional_area"]
        for key in inv_keys:
            if key not in analysis["investigation"]:
                raise ValueError(f"Missing investigation key: {key}")

        # Normalize corrective_actions and preventive_actions to non-empty lists
        for key in ["corrective_actions", "preventive_actions"]:
            value = analysis.get(key)
            normalized = []

            if isinstance(value, list):
                normalized = [item.strip() for item in value if isinstance(item, str) and item.strip()]
            elif isinstance(value, str):
                if value.strip():
                    normalized = [item.strip() for item in value.replace("\r", "\n").split("\n") if item.strip()]
            elif value is None:
                normalized = []
            else:
                normalized = [str(value).strip()] if str(value).strip() else []

            analysis[key] = normalized

        if not analysis["preventive_actions"]:
            fallback = []
            if analysis.get("probable_root_causes"):
                fallback.append(
                    f"Establish preventive controls to address {analysis['probable_root_causes'][0]}."
                )
            else:
                fallback.append("Establish preventive controls to avoid recurrence of the identified deviation.")
            analysis["preventive_actions"] = fallback
            print("⚠️ preventive_actions was empty or malformed; fallback action added.")

        if not analysis["corrective_actions"]:
            analysis["corrective_actions"] = []

        original_severity = analysis.get("severity", "Low")
        calibrated_severity = _calibrate_severity(
            deviation_input,
            analysis.get("risk_assessment"),
            original_severity
        )
        analysis["severity"] = calibrated_severity

        if calibrated_severity != original_severity:
            analysis.setdefault("reasoning", [])
            analysis["reasoning"].append(
                f"Severity calibrated from {original_severity} to {calibrated_severity} based on structured risk levels and deviation context."
            )

        print(f"✅ AI Analysis completed with confidence: {analysis['confidence_score']}")
        return analysis

    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {e}")
        raise ValueError("AI returned invalid JSON")
    except Exception as e:
        print(f"❌ AI analysis error: {e}")
        raise


def generate_preventive_actions(deviation_input, root_causes=None, corrective_actions=None):
    """
    Generate preventive actions if they are missing from a stored deviation.
    """
    context_docs = retrieve_context(deviation_input, top_k=3)
    reference_context = "\n\n".join(context_docs)
    root_causes_text = ''
    if root_causes:
        if isinstance(root_causes, list):
            root_causes_text = '\n'.join(f'- {c}' for c in root_causes)
        else:
            root_causes_text = str(root_causes)
    corrective_text = ''
    if corrective_actions:
        if isinstance(corrective_actions, list):
            corrective_text = '\n'.join(f'- {c}' for c in corrective_actions)
        else:
            corrective_text = str(corrective_actions)

    prompt = f"""
You are a pharmaceutical compliance expert.

Use the deviation event and available context to create a list of preventive actions.
Do not repeat corrective actions. Output only JSON with a single key:
{{"preventive_actions": ["action1", "action2"]}}

Deviation Event:
{deviation_input}

Reference Context:
{reference_context}

Known Root Causes:
{root_causes_text}

Corrective Actions Taken:
{corrective_text}

Requirements:
- Provide at least two preventive actions.
- Actions must be relevant to the deviation and regulatory compliance.
- Do not include placeholders like [Insert ...].
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert in GxP compliance and deviation management."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=600
        )
        result_text = response.choices[0].message.content.strip()
        result = json.loads(result_text)
        preventive_actions = result.get("preventive_actions")
        if not isinstance(preventive_actions, list) or not preventive_actions:
            raise ValueError("AI did not return a valid preventive_actions list")
        return [str(item).strip() for item in preventive_actions if str(item).strip()]
    except Exception as e:
        print(f"❌ Preventive action generation error: {e}")
        raise
