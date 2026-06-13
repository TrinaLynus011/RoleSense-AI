"""Standalone test for RoleSense AI backend via TestClient."""
import sys, os, json

backend_dir = os.path.join(os.path.dirname(__file__), "backend")
sys.path.insert(0, backend_dir)
os.chdir(backend_dir)

from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)
passed = 0
failed = 0

# Create a test user and get real JWT token
signup_resp = client.post("/api/signup", json={
    "email": "test@rolesense.ai",
    "password": "testpass123",
    "name": "Test Recruiter",
    "company": "TestCorp",
})
if signup_resp.status_code == 200:
    TOKEN = signup_resp.json()["access_token"]
    print(f"  Test user created, token acquired")
else:
    # Try login (might already exist from previous run)
    login_resp = client.post("/api/login", json={
        "email": "test@rolesense.ai",
        "password": "testpass123",
    })
    if login_resp.status_code == 200:
        TOKEN = login_resp.json()["access_token"]
        print(f"  Test user logged in, token acquired")
    else:
        TOKEN = None
        print(f"  WARNING: Could not acquire token")

def test(method, path, data=None, token=TOKEN):
    global passed, failed
    if not token:
        print(f"  [SKIP] {method} {path} -> no token available")
        return None
    headers = {"Authorization": f"Bearer {token}"}
    if data:
        r = client.post(path, json=data, headers=headers)
    else:
        r = client.get(path, headers=headers)
    ok = r.status_code in (200, 201)
    if ok: passed += 1
    else: failed += 1
    status = "PASS" if ok else "FAIL"
    print(f"  [{status}] {method} {path} -> {r.status_code}")
    return r

print("RoleSense AI - Backend Test Suite")
print("=" * 50)

print("\n-- Health --")
r = test("GET", "/api/health")
if r.status_code == 200:
    print(f"         -> {r.json()}")

print("\n-- Locations --")
r = test("GET", "/api/locations")
if r.status_code == 200:
    locs = r.json().get("locations", [])
    print(f"         -> {len(locs)} locations loaded")
    print(f"         -> e.g. {locs[:5]}")

print("\n-- Analytics --")
r = test("GET", "/api/analytics")
if r.status_code == 200:
    data = r.json()
    print(f"         -> {data['total_candidates']} candidates")
    print(f"         -> avg_score: {data['avg_score']}")
    print(f"         -> high/med/low: {data['high_confidence']}/{data['medium_confidence']}/{data['low_confidence']}")
    print(f"         -> top skills: {[s['skill'] for s in data['top_skills'][:5]]}")

print("\n-- Rank Candidates (workindia, top 5) --")
r = test("POST", "/api/rank-candidates", {
    "job_description": "Delivery Executive - Mumbai. Need bike, license, 1+ yr exp.",
    "source": "workindia",
    "top_n": 5,
})
if r.status_code == 200:
    data = r.json()
    print(f"         -> {data['total']} total, showing top {len(data['candidates'])}")
    for c in data["candidates"][:3]:
        print(f"            #{c['rank']} {c['name']:30s} {c['match_percent']:.1f}% [{c['confidence']['label']}]")
    print(f"         -> job: {data['job_info'].get('title', 'N/A')}")

print("\n-- Rank Candidates (with location filter: Mumbai) --")
r = test("POST", "/api/rank-candidates", {
    "job_description": "Software engineer role in Mumbai",
    "source": "workindia",
    "top_n": 10,
    "location": "Mumbai",
})
if r.status_code == 200:
    data = r.json()
    print(f"         -> {data['total']} candidates in Mumbai")
    for c in data["candidates"][:3]:
        print(f"            #{c['rank']} {c['name']:30s} {c['match_percent']:.1f}% - {c.get('location','')}")

print("\n-- Rank Candidates (with skills filter) --")
r = test("POST", "/api/rank-candidates", {
    "job_description": "Delivery job with bike",
    "source": "workindia",
    "top_n": 10,
    "skills_filter": ["Delivery", "Driving"],
})
if r.status_code == 200:
    data = r.json()
    print(f"         -> {data['total']} candidates with Delivery/Driving skills")

print("\n-- No Auth (should fail on protected routes) --")
r = client.get("/api/locations")
print(f"  [{'PASS' if r.status_code == 403 else 'FAIL'}] GET /api/locations (no auth) -> {r.status_code}")

print(f"\n{'='*50}")
print(f"Results: {passed} passed, {failed} failed of {passed+failed}")
