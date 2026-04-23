from ai_modules.genai_reasoning import analyze_deviation
from ai_modules.genai_drafting import draft_deviation_memo


def run_deviation_pipeline(deviation_data):
    """
    Run the complete deviation analysis pipeline.
    deviation_data should be a dict with 'event', 'date', 'study', etc.
    Returns: {"analysis": analysis_json, "draft": memo_text}
    """
    print("🚀 Starting deviation analysis pipeline...")

    deviation_input = deviation_data.get("event", "")

    # Step 1: AI Reasoning with RAG
    print("🔍 Running AI reasoning with RAG...")
    analysis = analyze_deviation(deviation_input)

    # Step 2: AI Drafting
    print("📝 Generating deviation memo...")
    draft = draft_deviation_memo(deviation_input, analysis, deviation_data)

    print("✅ Pipeline completed successfully")

    return {
        "analysis": analysis,
        "draft": draft
    }