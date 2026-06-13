"""Kill any running backend processes."""
import os, signal, sys

pid_file = os.path.join(os.path.dirname(__file__), ".backend_pid")
if os.path.exists(pid_file):
    with open(pid_file) as f:
        pid = int(f.read().strip())
    try:
        os.kill(pid, signal.SIGTERM)
        print(f"Killed backend (PID: {pid})")
    except ProcessLookupError:
        print(f"Process {pid} not found")
    os.remove(pid_file)
else:
    print("No .backend_pid file found")
