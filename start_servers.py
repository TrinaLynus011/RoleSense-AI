"""Start both backend and frontend as detached processes on Windows."""
import subprocess, sys, os, time, urllib.request, json

ROOT = os.path.dirname(os.path.abspath(__file__))
DETACHED_PROCESS = 0x00000008
CREATE_NEW_PROCESS_GROUP = 0x00000200
flags = DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP

# Kill any existing backend on port 8000
import http.client
try:
    conn = http.client.HTTPConnection("localhost", 8000, timeout=2)
    conn.request("GET", "/api/health")
    r = conn.getresponse()
    if r.status == 200:
        print("Backend already running on port 8000.")
    conn.close()
except Exception:
    # Start backend
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=os.path.join(ROOT, "backend"),
        stdout=open(os.path.join(ROOT, ".backend.log"), "w"),
        stderr=subprocess.STDOUT,
        creationflags=flags,
    )
    print(f"Backend started (PID: {backend_proc.pid})")

# Start frontend if not already running
try:
    conn2 = http.client.HTTPConnection("localhost", 4200, timeout=2)
    conn2.request("GET", "/")
    r2 = conn2.getresponse()
    if r2.status == 200:
        print("Frontend already running on port 4200.")
    conn2.close()
except Exception:
    frontend_proc = subprocess.Popen(
        ["npx.cmd", "ng", "serve", "--port", "4200", "--host", "0.0.0.0"],
        cwd=os.path.join(ROOT, "frontend"),
        stdout=open(os.path.join(ROOT, ".frontend.log"), "w"),
        stderr=subprocess.STDOUT,
        creationflags=flags,
    )
    print(f"Frontend started (PID: {frontend_proc.pid})")

print("\nWaiting for servers to initialize...")
time.sleep(10)

# Verify
for name, host, port in [("Backend", "localhost", 8000), ("Frontend", "localhost", 4200)]:
    try:
        conn = http.client.HTTPConnection(host, port, timeout=3)
        conn.request("GET", "/api/health" if name == "Backend" else "/")
        r = conn.getresponse()
        print(f"{name} -> HTTP {r.status}")
        conn.close()
    except Exception as e:
        print(f"{name} -> {e}")

print("\nOpen http://localhost:4200 in your browser.")
