"""Pydantic schemas for API request/response."""

from pydantic import BaseModel, EmailStr
from typing import Optional


class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    company: Optional[str] = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    user: dict


class RankRequest(BaseModel):
    job_description: str
    source: str = "workindia"
    top_n: int = 20
    location: Optional[str] = None
    remote_friendly: bool = False
    min_experience: Optional[float] = None
    min_confidence: Optional[float] = None
    skills_filter: Optional[list[str]] = None


class RankResponse(BaseModel):
    candidates: list
    total: int
    job_info: dict
