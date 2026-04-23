import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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

def parse_deviation_input(user_text):

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text}
        ],
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)