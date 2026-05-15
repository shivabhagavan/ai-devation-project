import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1️⃣ Get DB path from environment (Azure will provide this)
db_path = os.getenv("SQLITE_DB_PATH")

# 2️⃣ Fallback for local + GitHub Actions
if not db_path:
    db_path = os.path.join(os.getcwd(), "deviations.db")

# 3️⃣ Create directory ONLY if safe (avoid /home/data issue in GitHub)
db_dir = os.path.dirname(os.path.abspath(db_path))

if db_dir and not db_dir.startswith("/home/data"):
    os.makedirs(db_dir, exist_ok=True)

# 4️⃣ Build DB URL
DATABASE_URL = f"sqlite:///{db_path}"

# 5️⃣ Engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# 6️⃣ Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 7️⃣ Base
Base = declarative_base()