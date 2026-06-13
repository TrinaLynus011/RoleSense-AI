"""Routes: Authentication (signup, login)."""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..auth import hash_password, verify_password, create_access_token, decode_token
from ..schemas import SignupRequest, LoginRequest, AuthResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/api", tags=["auth"])
security = HTTPBearer()


@router.post("/signup", response_model=AuthResponse)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(
        email=body.email,
        name=body.name,
        company=body.company,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return AuthResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "company": user.company},
    )


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")
    token = create_access_token(user.id)
    return AuthResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "company": user.company},
    )


@router.get("/me")
def get_me(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(401, "Invalid token")
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(404, "User not found")
    return {"id": user.id, "email": user.email, "name": user.name, "company": user.company}
