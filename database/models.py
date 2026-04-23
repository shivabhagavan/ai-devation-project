from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database.db import Base

class Deviation(Base):
    __tablename__ = "deviations"

    id = Column(Integer, primary_key=True, index=True)
    event = Column(String)
    date = Column(String)
    study = Column(String)
    severity = Column(String)
    root_causes = Column(Text)
    corrective_actions = Column(Text)
    preventive_actions = Column(Text)
    capa = Column(Text)  # Keep for backward compatibility
    deviation_memo_draft = Column(Text)
    status = Column(String, default="Draft")
    version = Column(Integer, default=1)
    history = Column(Text, default="[]")  # JSON array of history entries
    signatures = Column(Text, default="{}")  # JSON object for role-based sign-offs
    document_filename = Column(String, nullable=True)  # Optional uploaded document filename
    document_content = Column(Text, nullable=True)  # Optional uploaded document content (base64)
    created_at = Column(DateTime, default=datetime.utcnow)