import os
from openai import OpenAI
from dotenv import load_dotenv

# Load env variables (works locally, ignored safely in Azure)
load_dotenv()

# ---------------------------------------
# SAFE OPENAI CLIENT (lazy initialization)
# ---------------------------------------
def get_client():
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        print("[WARNING] OPENAI_API_KEY not found. Running in fallback mode.")
        return None

    return OpenAI(api_key=api_key)


# ---------------------------------------
# CHROMA DB SETUP
# ---------------------------------------
PERSIST_DIR = os.path.join(os.getcwd(), "chroma_db")
chroma_client = None
collection = None

try:
    import chromadb
    chroma_client = chromadb.PersistentClient(path=PERSIST_DIR)
    collection = chroma_client.get_collection(name="deviation_knowledge")
    print("[OK] ChromaDB connected")
except Exception as e:
    print("[WARNING] chromadb unavailable, using fallback context retrieval:", str(e))


# ---------------------------------------
# CONTEXT RETRIEVAL FUNCTION
# ---------------------------------------
def retrieve_context(query, top_k=3):
    client = get_client()

    # If both OpenAI + Chroma available -> use RAG
    if client is not None and collection is not None:
        try:
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input=query
            )

            query_embedding = response.data[0].embedding

            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )

            documents = results.get("documents", [[]])[0]

            print(f"[RAG] Retrieved {len(documents)} documents for query: '{query}'")
            for i, doc in enumerate(documents, 1):
                print(f"  Doc {i}: {doc[:200]}...")

            return documents

        except Exception as e:
            print(f"[ERROR] RAG Error: {e}")

    # ---------------------------------------
    # FALLBACK (NO CRASH GUARANTEE)
    # ---------------------------------------
    fallback_docs = [
        "SOP for deviation handling in pharma GxP environment.",
        "Investigation workflows with root cause analysis and corrective action planning.",
        "Regulatory expectations for deviation closure and CAPA documentation."
    ]

    print(f"[WARNING] Using fallback context: {fallback_docs[:top_k]}")
    return fallback_docs[:top_k]