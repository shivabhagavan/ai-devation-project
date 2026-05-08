import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------
# SAFE OPENAI CLIENT
# ---------------------------------------
def get_client():
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        print("⚠️ OPENAI_API_KEY not found. Memo will use fallback.")
        return None

    return OpenAI(api_key=api_key)


# ---------------------------------------
# MEMO GENERATOR
# ---------------------------------------
def draft_deviation_memo(deviation_input, analysis, data):
    """
    Generate formal regulatory deviation memo
    """
    client = get_client()

    # Extract risk assessment with fallback
    risk_assessment = analysis.get('risk_assessment', {})
    patient_safety = risk_assessment.get('patient_safety', 'Medium')
    regulatory_compliance = risk_assessment.get('regulatory_compliance', 'Medium')
    data_integrity = risk_assessment.get('data_integrity', 'Medium')
    product_quality = risk_assessment.get('product_quality', 'Medium')

    # 🚨 FALLBACK IF NO OPENAI
    if client is None:
        return f"""DEVIATION MEMO

Date: {data.get('date', 'Current Date')}
Subject: Deviation Memo for {deviation_input}
Deviation Number: {data.get('id', 'TBD')}

1. Deviation Description
{deviation_input}

2. Immediate Action Taken
Initial containment actions were performed as per SOP.

3. Investigation Summary
Severity: {analysis.get('severity', 'Unknown')}
Patient Safety Risk: {patient_safety}
Regulatory Compliance Risk: {regulatory_compliance}
Data Integrity Risk: {data_integrity}
Product Quality Risk: {product_quality}

4. Root Cause Analysis
{', '.join(analysis.get('probable_root_causes', ['Under investigation']))}

5. Corrective Actions
{', '.join(analysis.get('corrective_actions', ['To be defined']))}

6. Preventive Actions
{', '.join(analysis.get('preventive_actions', ['To be defined']))}

7. Conclusion
The deviation is being managed as per GxP requirements.
"""

    prompt = f"""
You are a senior GxP regulatory writer.

Write a deviation memo.

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
                {"role": "system", "content": "Write formal deviation memo. No markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=1200
        )

        memo = response.choices[0].message.content.strip()
        print("✅ Memo generated")
        return memo

    except Exception as e:
        print(f"❌ Memo AI error: {e}")

        # 🚨 SAFE FALLBACK
        return f"""DEVIATION MEMO

Deviation: {deviation_input}

Severity: {analysis.get('severity', 'Unknown')}

Investigation ongoing. Manual review required.
"""