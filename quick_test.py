from dotenv import load_dotenv
load_dotenv()

import json
from ai_modules.genai_reasoning import analyze_with_genai
from ai_modules.genai_drafting import draft_with_genai

test_input = {
    "event": "Equipment calibration performed 2 months beyond schedule",
    "date": "18 February 2026",
    "study": "Analytical Balance XYZ-001",
    "detection_method": "Maintenance audit",
    "immediate_action": "Recalibrated immediately"
}

print("\n==============================")
print("Running GenAI Reasoning...")
print("==============================\n")

analysis = analyze_with_genai(test_input)

# 🔍 Print FULL raw JSON clearly formatted
print("FULL RAW ANALYSIS JSON:\n")
print(json.dumps(analysis, indent=4))

# Safe extraction
severity = analysis.get("severity")
reasoning = analysis.get("reasoning", [])

print("\nExtracted Severity:", severity)
print("\nExtracted Reasoning:")
for r in reasoning:
    print("-", r)

print("\n==============================")
print("Running GenAI Drafting...")
print("==============================\n")

draft = draft_with_genai(test_input, analysis)

print("Generated Draft:\n")
print(draft)