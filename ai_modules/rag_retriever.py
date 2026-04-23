import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()

# point to root chroma db
PERSIST_DIR = os.path.join(os.getcwd(), "chroma_db")
chroma_client = None
collection = None

try:
    import chromadb
    chroma_client = chromadb.PersistentClient(path=PERSIST_DIR)
    collection = chroma_client.get_collection(name="deviation_knowledge")
except Exception as e:
    print("⚠️ chromadb unavailable, using fallback context retrieval:", str(e))


def retrieve_context(query, top_k=3):
    # if chromadb is available, use it
    if collection is not None:
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
            documents = results["documents"][0]
            print(f"🔍 RAG Retrieved {len(documents)} documents for query: '{query}'")
            for i, doc in enumerate(documents, 1):
                print(f"  Doc {i}: {doc[:200]}...")
            return documents
        except Exception as e:
            print(f"❌ RAG Error: {e}")

    # fallback static context
    fallback_docs = [
        "SOP for deviation handling in pharma GxP environment.",
        "Investigation workflows with root cause analysis and corrective action planning.",
        "Regulatory expectations for deviation closure and CAPA documentation."
    ]
    print(f"⚠️ Using fallback context: {fallback_docs[:top_k]}")
    return fallback_docs[:top_k]