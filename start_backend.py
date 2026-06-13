"""Start uvicorn backend as a daemon process that survives shell exit."""
import subprocess, sys, os, time, json, urllib.request

workdir = os.path.join(os.path.dirname(__file__), "backend")

proc = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
    cwd=workdir,
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
    creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0,
)

# Save PID
with open(os.path.join(os.path.dirname(__file__), ".backend_pid"), "w") as f:
    f.write(str(proc.pid))

print(f"Backend started (PID: {proc.pid})")
