import os
import chromadb
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Absolute path for vector database
PERSIST_DIR = os.path.join(os.getcwd(), "chroma_db")
print("Chroma DB location:", PERSIST_DIR)

# Persistent Chroma client
chroma_client = chromadb.PersistentClient(path=PERSIST_DIR)

# Create or get collection
collection = chroma_client.get_or_create_collection(
    name="deviation_knowledge"
)

DOCUMENT_FOLDER = "documents"


def chunk_text(text, chunk_size=500):
    chunks = []
    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i + chunk_size])
    return chunks


documents = []
ids = []

print("Reading documents from subfolders...")

# Read all .txt files from subfolders
for root, dirs, files in os.walk(DOCUMENT_FOLDER):
    for file in files:
        if file.endswith(".txt"):
            path = os.path.join(root, file)

            print("Reading:", path)

            with open(path, "r", encoding="utf-8") as f:
                text = f.read()

            chunks = chunk_text(text)

            for i, chunk in enumerate(chunks):
                documents.append(chunk)
                ids.append(f"{file}_{i}")

print("Total document chunks:", len(documents))

print("Generating embeddings...")

embeddings = []

for doc in documents:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=doc
    )
    embeddings.append(response.data[0].embedding)

print("Storing embeddings in Chroma...")

collection.add(
    documents=documents,
    embeddings=embeddings,
    ids=ids
)

print("Vector database created successfully.")