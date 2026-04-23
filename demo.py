from dotenv import load_dotenv
load_dotenv()

import logging
from ai_modules.genai_reasoning import analyze_with_genai
from ai_modules.genai_drafting import draft_with_genai

# -------------------------------
# Logging Setup
# -------------------------------
logging.basicConfig(
    filename="ai_audit.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

print("\n" + "=" * 80)
print("GENAI-DRIVEN DEVIATION MANAGEMENT SYSTEM - PHASE 1")
print("=" * 80)

# -------------------------------
# STEP 1: USER INPUT
# -------------------------------

deviation_input = {
    "event": "One subject visit occurred 1 day outside protocol window",
    "date": "10 March 2026",
    "study": "Clinical Study ABC-789",
    "detection_method": "Routine monitoring visit",
    "immediate_action": "Deviation documented and site retrained"
}

print("\n[STEP 1] RAW INPUT")
print("-" * 80)
for key, value in deviation_input.items():
    print(f"{key.replace('_',' ').title()}: {value}")

logging.info("INPUT: %s", deviation_input)

# -------------------------------
# STEP 2: GENAI REASONING
# -------------------------------

print("\n[STEP 2] GENAI REASONING")
print("-" * 80)

analysis = analyze_with_genai(deviation_input)

logging.info("ANALYSIS: %s", analysis)

print(f"\nSeverity: {analysis['severity']}")
print(f"Confidence Score: {analysis['confidence_score']}")

# Confidence Governance
if analysis["confidence_score"] < 0.6:
    print("\n⚠️ LOW CONFIDENCE DETECTED")
    print("Mandatory Senior QA Review Required.")

if analysis["severity"] == "High":
    print("\n🔴 HIGH SEVERITY – Executive QA Notification Required.")

print("\nRisk Assessment:")
for k, v in analysis["risk_assessment"].items():
    print(f"- {k.replace('_',' ').title()}: {v}")

print("\nReasoning:")
for r in analysis["reasoning"]:
    print(f"- {r}")

print("\nProbable Root Causes:")
for rc in analysis["probable_root_causes"]:
    print(f"- {rc}")

print("\nSuggested CAPA:")
for action in analysis["corrective_and_preventive_actions"]:
    print(f"- {action}")

# -------------------------------
# STEP 3: GENAI DRAFTING
# -------------------------------

print("\n[STEP 3] GENAI DRAFTING")
print("-" * 80)

draft = draft_with_genai(deviation_input, analysis)

logging.info("DRAFT: %s", draft)

print("\nDeviation Narrative:\n")
print(draft)

# -------------------------------
# FINAL HUMAN CONTROL NOTICE
# -------------------------------

print("\n" + "=" * 80)
print("AI OUTPUT REQUIRES MANDATORY HUMAN VALIDATION BEFORE SUBMISSION")
print("=" * 80)