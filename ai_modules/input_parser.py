import os
import json
from openai import OpenAI

# ---------------------------------------
# SAFE OPENAI CLIENT
# ---------------------------------------
def get_client():
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        print("⚠️ OPENAI_API_KEY missing → using fallback parser")
        return None

    return OpenAI(api_key=api_key)


# ---------------------------------------
# SYSTEM PROMPT
# ---------------------------------------
SYSTEM_PROMPT = """
You are a pharmaceutical QA assistant.

Convert natural language deviation descriptions into structured JSON.

Return ONLY JSON with this structure:

{
 "event": "",
 "date": "",
 "study": "",
 "detection_method": "",
 "immediate_action": ""
}

Rules:
- Do not invent information.
- If a field is missing, return "Not specified".
- Output valid JSON only.
"""


# ---------------------------------------
# MAIN FUNCTION
# ---------------------------------------
def parse_deviation_input(user_text):
    client = get_client()

    # 🚨 FALLBACK (NO AI)
    if client is None:
        return {
            "event": user_text,
            "date": "Not specified",
            "study": "Not specified",
            "detection_method": "Not specified",
            "immediate_action": "Not specified"
        }

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_text}
            ],
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)

        # ✅ Ensure all keys exist (extra safety)
        required_keys = [
            "event",
            "date",
            "study",
            "detection_method",
            "immediate_action"
        ]

        for key in required_keys:
            if key not in result or not result[key]:
                result[key] = "Not specified"

        return result

    except Exception as e:
        print(f"❌ Parsing error: {e}")

        # 🚨 SAFE FALLBACK
        return {
            "event": user_text,
            "date": "Not specified",
            "study": "Not specified",
            "detection_method": "Not specified",
            "immediate_action": "Not specified"
        }