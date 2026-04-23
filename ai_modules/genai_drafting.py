import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def draft_deviation_memo(deviation_input, analysis, data):
    """
    Generate formal regulatory deviation memo using deviation input, analysis, and data.
    """
    # Extract risk assessment with fallback
    risk_assessment = analysis.get('risk_assessment', {})
    patient_safety = risk_assessment.get('patient_safety', 'Medium')
    regulatory_compliance = risk_assessment.get('regulatory_compliance', 'Medium')
    data_integrity = risk_assessment.get('data_integrity', 'Medium')
    product_quality = risk_assessment.get('product_quality', 'Medium')
    
    prompt = f"""
You are a senior GxP regulatory writer with expertise in pharmaceutical deviation documentation.

Write a professional deviation memo using the following structure. Fill in ALL available information - do NOT use placeholders like [Insert Date] or [Insert Recipient]. Use the provided deviation details to populate the memo. Do NOT include "To:" or "From:" headers.

IMPORTANT: In the "Investigation Summary" section, you MUST include ALL of the following risk assessments explicitly:
- Patient Safety Risk: {patient_safety}
- Regulatory Compliance Risk: {regulatory_compliance}
- Data Integrity Risk: {data_integrity}
- Product Quality Risk: {product_quality}

Do NOT write "N/A" for any of these - use the provided values above.

DEVIATION MEMO

Date: {data.get('date', 'Current Date')}
Subject: Deviation Memo for {deviation_input}
Deviation Number: {data.get('id', 'TBD')}

1. Deviation Description
2. Immediate Action Taken
3. Investigation Summary
   - Severity: {analysis.get('severity', 'Unknown')}
   - Patient Safety Risk: {patient_safety}
   - Regulatory Compliance Risk: {regulatory_compliance}
   - Data Integrity Risk: {data_integrity}
   - Product Quality Risk: {product_quality}
4. Root Cause Analysis
5. Corrective Actions
6. Preventive Actions
7. Conclusion

DEVIATION DETAILS:
- Event: {deviation_input}
- Date: {data.get('date', 'Unknown')}
- Study/Product: {data.get('study', 'Unknown')}
- Severity: {analysis.get('severity', 'Unknown')}
- Root Causes: {', '.join(analysis.get('probable_root_causes', []))}
- Corrective Actions: {', '.join(analysis.get('corrective_actions', []))}
- Preventive Actions: {', '.join(analysis.get('preventive_actions', []))}
- Investigation Details: Process Point ({analysis.get('investigation', {}).get('process_point', 'N/A')}), Cause Category ({analysis.get('investigation', {}).get('cause_category', 'N/A')}), Functional Area ({analysis.get('investigation', {}).get('functional_area', 'N/A')})

RULES:
- Do NOT introduce new facts or speculate
- Use formal regulatory language
- Write in inspection-ready format
- Output plain text only (no markdown)
- Fill in ALL information using the provided details
- Do NOT use any placeholders or [Insert ...] text
- Reference the provided analysis data only
- CRITICAL: Never use "N/A" for risk assessment fields - always use the provided risk levels (Low, Medium, or High)

DEVIATION MEMO:
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a senior GxP regulatory writer. Write formal, inspection-ready deviation memos."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=1500
        )

        memo = response.choices[0].message.content.strip()
        print("✅ Deviation memo drafted successfully")
        return memo

    except Exception as e:
        print(f"❌ Memo drafting error: {e}")
        return f"Deviation Memo\n\nDeviation: {deviation_input}\n\nSeverity: {analysis.get('severity', 'Unknown')}\n\nInvestigation in progress."