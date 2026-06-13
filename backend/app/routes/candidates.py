"""Routes: Candidate ranking, location extraction, analytics."""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from ..schemas import RankRequest, RankResponse
from ..auth import decode_token
from ..services.ranking_service import rank_candidates, _extract_all_locations, compute_analytics

router = APIRouter(prefix="/api", tags=["candidates"])
security = HTTPBearer()


def _get_user_id(credentials) -> str:
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


@router.post("/rank-candidates", response_model=RankResponse)
def rank(body: RankRequest, credentials=Depends(security)):
    _get_user_id(credentials)
    result = rank_candidates(
        job_description=body.job_description,
        source=body.source,
        top_n=body.top_n,
        location_filter=body.location,
        remote_friendly=body.remote_friendly,
        min_experience=body.min_experience,
        min_confidence=body.min_confidence,
        skills_filter=body.skills_filter,
    )
    return RankResponse(**result)


@router.get("/locations")
def get_locations(credentials=Depends(security)):
    _get_user_id(credentials)
    return {"locations": _extract_all_locations()}


@router.get("/analytics")
def get_analytics(credentials=Depends(security)):
    _get_user_id(credentials)
    result = rank_candidates(
        job_description="Software Engineer\n\nLooking for talented engineers.",
        source="workindia",
        top_n=100,
    )
    analytics = compute_analytics(result["candidates"])
    return analytics
