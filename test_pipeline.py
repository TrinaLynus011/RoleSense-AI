"""Test the full RoleSense AI pipeline."""
import urllib.request, json, sys

BASE = "http://localhost:8000"

def req(method, path, body=None, token=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.urlopen(urllib.request.Request(url, data=data, headers=headers, method=method))
    return json.loads(r.read())

# 1. Health
h = req("GET", "/api/health")
print(f"[OK] Health: {h['status']}")

# 2. Signup
try:
    s = req("POST", "/api/signup", {"name": "Dev", "email": "dev3@test.com", "password": "pass123"})
    token = s["access_token"]
    print(f"[OK] Signup -> token ({len(token)} chars), user: {s['user']['name']}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    if "already registered" in body:
        # User exists, login instead
        l = req("POST", "/api/login", {"email": "dev3@test.com", "password": "pass123"})
        token = l["access_token"]
        print(f"[OK] Login -> token ({len(token)} chars)")
    else:
        print(f"[FAIL] Signup: {e.code} {body}")
        sys.exit(1)

# 3. Get locations
loc_resp = req("GET", "/api/locations", token=token)
cities = loc_resp.get("locations", loc_resp)
print(f"[OK] Locations: {len(cities)} cities (e.g., {cities[0]})")

# 4. Rank candidates
jd = "Looking for a Senior Software Engineer with 5+ years experience in Python, cloud infrastructure, and team leadership."
rank = req("POST", "/api/rank-candidates", {"job_description": jd, "top_n": 5}, token=token)
print(f"[OK] Ranked {len(rank['candidates'])} candidates")
for c in rank["candidates"][:3]:
    print(f"     #{c['rank']} {c['name']} - {c['match_percent']}% ({c['confidence']['label']})")

# 5. Analytics
an = req("GET", "/api/analytics", token=token)
print(f"[OK] Analytics: {an['total_candidates']} candidates, avg score: {an['avg_score']:.2f}")

print("\n=== ALL CHECKS PASSED ===")
