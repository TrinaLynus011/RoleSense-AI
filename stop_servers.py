"""Kill detached server processes."""
import os, signal

pid_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".server_pids")
if not os.path.exists(pid_file):
    print("No .server_pids file found.")
    exit()

with open(pid_file) as f:
    pids = [int(line.strip()) for line in f if line.strip()]

for pid in pids:
    try:
        os.kill(pid, signal.SIGTERM)
        print(f"Killed PID {pid}")
    except ProcessLookupError:
        print(f"PID {pid} not found (already stopped)")
    except Exception as e:
        print(f"Failed to kill PID {pid}: {e}")

os.remove(pid_file)
print("Servers stopped.")
