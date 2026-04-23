from dotenv import load_dotenv
load_dotenv()

import logging
from ai_modules.genai_reasoning import analyze_with_genai
from ai_modules.genai_drafting import draft_with_genai
from ai_modules.input_parser import parse_deviation_input

# ---------------------------------
# Logging Setup
# ---------------------------------
logging.basicConfig(
    filename="ai_audit.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# ---------------------------------
# New Deviation Input
# ---------------------------------

user_input = """
During manufacturing on 22 February 2026 the product temperature exceeded
the allowable limit of 75°C and reached 82°C. The process monitoring system
triggered an alarm and the batch was immediately placed on hold and moved
to quarantine for investigation.
"""

deviation_input = parse_deviation_input(user_input)
print("\n" + "="*80)
print("GENAI DEVIATION ANALYSIS - MAIN EXECUTION")
print("="*80)

# ---------------------------------
# STEP 1 - GENAI REASONING
# ---------------------------------

analysis = analyze_with_genai(deviation_input)

logging.info("INPUT: %s", deviation_input)
logging.info("ANALYSIS: %s", analysis)

print("\nSeverity:", analysis["severity"])
print("Confidence:", analysis["confidence_score"])

if analysis["confidence_score"] < 0.6:
    print("\n⚠️ LOW CONFIDENCE - Senior QA Review Required")

if analysis["severity"] == "High":
    print("\n🔴 HIGH SEVERITY - Escalate to QA Head")

print("\nRisk Assessment:")
for k, v in analysis["risk_assessment"].items():
    print(f"- {k.replace('_',' ').title()}: {v}")

print("\nReasoning:")
for r in analysis["reasoning"]:
    print("-", r)

print("\nProbable Root Causes:")
for rc in analysis["probable_root_causes"]:
    print("-", rc)

print("\nSuggested CAPA:")
for action in analysis["corrective_and_preventive_actions"]:
    print("-", action)

# ---------------------------------
# STEP 2 - GENAI DRAFTING
# ---------------------------------

draft = draft_with_genai(deviation_input, analysis)

logging.info("DRAFT: %s", draft)

print("\nDeviation Narrative:\n")
print(draft)

print("\n" + "="*80)
print("AI OUTPUT REQUIRES HUMAN VALIDATION BEFORE APPROVAL")
print("="*80)