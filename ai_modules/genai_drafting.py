import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


def get_client():
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        print("[WARNING] OPENAI_API_KEY not found. Memo will use fallback.")
        return None

    return OpenAI(api_key=api_key, timeout=15.0)


def _format_list(items, default):
    if not items:
        return default
    if not isinstance(items, list):
        items = [items]
    return "\n".join(f"- {item}" for item in items)


def _build_fallback_memo(deviation_input, analysis, data):
    risk_assessment = analysis.get("risk_assessment", {})
    return f"""DEVIATION MEMO

Date: {data.get('date', 'Current Date')}
Subject: Deviation Memo for {data.get('study') or 'Reported Deviation'}
Deviation Number: {data.get('id', 'TBD')}

1. Deviation Description
{deviation_input}

2. Immediate Action Taken
{data.get('immediate_action') or 'Initial containment and investigation activities were initiated as per SOP.'}

3. Investigation Summary
Severity: {analysis.get('severity', 'Unknown')}
Patient Safety Risk: {risk_assessment.get('patient_safety', 'Not specified')}
Regulatory Compliance Risk: {risk_assessment.get('regulatory_compliance', 'Not specified')}
Data Integrity Risk: {risk_assessment.get('data_integrity', 'Not specified')}
Product Quality Risk: {risk_assessment.get('product_quality', 'Not specified')}

4. Root Cause Analysis
{_format_list(analysis.get('probable_root_causes'), '- Under investigation')}

5. Corrective Actions
{_format_list(analysis.get('corrective_actions'), '- To be defined')}

6. Preventive Actions
{_format_list(analysis.get('preventive_actions'), '- To be defined')}

7. Conclusion
The deviation is being managed through the defined GxP workflow and requires human review before approval.
"""


def draft_deviation_memo(deviation_input, analysis, data):
    """
    Generate a formal regulatory deviation memo.
    Falls back to a deterministic memo if the model is unavailable or slow.
    """
    client = get_client()

    risk_assessment = analysis.get("risk_assessment", {})
    patient_safety = risk_assessment.get("patient_safety", "Medium")
    regulatory_compliance = risk_assessment.get("regulatory_compliance", "Medium")
    data_integrity = risk_assessment.get("data_integrity", "Medium")
    product_quality = risk_assessment.get("product_quality", "Medium")

    if client is None:
        return _build_fallback_memo(deviation_input, analysis, data)

    prompt = f"""
You are a senior GxP regulatory writer.

Write a concise deviation memo. Use plain text only, no markdown.

Deviation:
{deviation_input}

Severity: {analysis.get('severity')}
Patient Safety Risk: {patient_safety}
Regulatory Compliance Risk: {regulatory_compliance}
Data Integrity Risk: {data_integrity}
Product Quality Risk: {product_quality}

Root Causes: {analysis.get('probable_root_causes')}
Corrective Actions: {analysis.get('corrective_actions')}
Preventive Actions: {analysis.get('preventive_actions')}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Write a formal deviation memo in plain text. No markdown."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=800,
        )

        memo = response.choices[0].message.content.strip()
        print("[OK] Memo generated")
        return memo

    except Exception as e:
        print(f"[ERROR] Memo AI error: {e}")
        return _build_fallback_memo(deviation_input, analysis, data)
