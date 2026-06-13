"""SQLAlchemy ORM models."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from .database import Base


def _uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    company = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, nullable=False, index=True)
    job_description = Column(Text, nullable=False)
    location_filter = Column(String, default="")
    top_n = Column(String, default="20")
    created_at = Column(DateTime, default=datetime.utcnow)
