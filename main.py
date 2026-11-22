"""One-command launcher: starts the FastAPI backend and the Vite frontend together.

Usage (from the project root):
    python main.py
    python main.py --no-browser      # don't open the browser automatically
    python main.py --no-reload       # run uvicorn without auto-reload
    python main.py --skip-install    # skip dependency checks/installs

Press Ctrl+C once to stop both servers.
"""

import argparse
import os
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"

BACKEND_PORT = 8000  # must match the proxy target in frontend/vite.config.js
FRONTEND_PORT = 5173

IS_WINDOWS = os.name == "nt"

# ANSI colours (enabled on Windows 10+ terminals by the empty os.system call)
if IS_WINDOWS:
    os.system("")
CYAN, MAGENTA, GREEN, YELLOW, RED, RESET = (
    "\033[36m", "\033[35m", "\033[32m", "\033[33m", "\033[31m", "\033[0m",
)


def log(message: str, colour: str = GREEN) -> None:
    print(f"{colour}[launcher]{RESET} {message}", flush=True)


def fail(message: str) -> None:
    log(message, RED)
    sys.exit(1)


# --------------------------------------------------------------------------- #
# Pre-flight checks
# --------------------------------------------------------------------------- #
def port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def copy_env_if_missing(folder: Path) -> None:
    env_file, example = folder / ".env", folder / ".env.example"
    if not env_file.exists() and example.exists():
        shutil.copyfile(example, env_file)
        log(f"Created {env_file.relative_to(ROOT)} from .env.example")


def ensure_backend_deps() -> None:
    try:
        import fastapi  # noqa: F401
        import httpx  # noqa: F401
        import multipart  # noqa: F401  (python-multipart)
        import pydantic_settings  # noqa: F401
        import uvicorn  # noqa: F401
        return
    except ImportError:
        pass

    log("Backend dependencies missing. Installing from requirements.txt ...", YELLOW)
    log(f"Using interpreter: {sys.executable}", YELLOW)
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", "-r", str(BACKEND_DIR / "requirements.txt")]
    )
    if result.returncode != 0:
        fail("pip install failed. Fix the error above and run again.")


def find_npm() -> str:
    npm = shutil.which("npm")
    if not npm:
        fail("npm was not found. Install Node.js 18+ from https://nodejs.org and retry.")
    return npm


def ensure_frontend_deps(npm: str) -> None:
    if (FRONTEND_DIR / "node_modules").exists():
        return
    log("frontend/node_modules not found. Running npm install (first run only) ...", YELLOW)
    result = subprocess.run([npm, "install"], cwd=FRONTEND_DIR)
    if result.returncode != 0:
        fail("npm install failed. Fix the error above and run again.")


# --------------------------------------------------------------------------- #
# Process management
# --------------------------------------------------------------------------- #
def start_process(name: str, colour: str, command: list, cwd: Path) -> subprocess.Popen:
    env = {**os.environ, "PYTHONUNBUFFERED": "1"}
    kwargs = {}
    if IS_WINDOWS:
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        kwargs["start_new_session"] = True

    proc = subprocess.Popen(
        command,
        cwd=cwd,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1,
        **kwargs,
    )

    def pump() -> None:
        assert proc.stdout is not None
        for line in proc.stdout:
            try:
                print(f"{colour}[{name}]{RESET} {line.rstrip()}", flush=True)
            except UnicodeEncodeError:
                # Fallback for Windows consoles that can't handle some characters (like the Vite arrow)
                clean_line = line.encode("ascii", errors="replace").decode("ascii")
                print(f"{colour}[{name}]{RESET} {clean_line.rstrip()}", flush=True)

    threading.Thread(target=pump, daemon=True).start()
    return proc


def stop_process(proc: subprocess.Popen) -> None:
    """Terminate a process *and its children* (npm and uvicorn spawn workers)."""
    if proc.poll() is not None:
        return
    try:
        if IS_WINDOWS:
            subprocess.run(
                ["taskkill", "/PID", str(proc.pid), "/T", "/F"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        else:
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        proc.wait(timeout=8)
    except Exception:
        proc.kill()


def open_browser_when_ready(url: str, port: int) -> None:
    for _ in range(120):  # wait up to ~60 s for Vite
        if port_in_use(port):
            time.sleep(0.5)
            webbrowser.open(url)
            return
        time.sleep(0.5)


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def main() -> None:
    parser = argparse.ArgumentParser(description="Run backend + frontend together.")
    parser.add_argument("--no-browser", action="store_true", help="do not open the browser")
    parser.add_argument("--no-reload", action="store_true", help="run uvicorn without --reload")
    parser.add_argument("--skip-install", action="store_true", help="skip dependency checks")
    args = parser.parse_args()

    if not BACKEND_DIR.exists() or not FRONTEND_DIR.exists():
        fail("Run this script from the project root (the folder containing backend/ and frontend/).")

    for port, label in ((BACKEND_PORT, "backend"), (FRONTEND_PORT, "frontend")):
        if port_in_use(port):
            fail(f"Port {port} ({label}) is already in use. Stop the other process and retry.")

    npm = find_npm()
    copy_env_if_missing(BACKEND_DIR)
    copy_env_if_missing(FRONTEND_DIR)
    if not args.skip_install:
        ensure_backend_deps()
        ensure_frontend_deps(npm)

    backend_cmd = [
        sys.executable, "-m", "uvicorn", "app.main:app",
        "--host", "127.0.0.1", "--port", str(BACKEND_PORT),
    ]
    if not args.no_reload:
        backend_cmd.append("--reload")

    frontend_cmd = [
        npm, "run", "dev", "--",
        "--port", str(FRONTEND_PORT), "--strictPort",
    ]

    log("Starting servers ... (Ctrl+C to stop both)")
    processes = [
        ("backend", CYAN, start_process("backend", CYAN, backend_cmd, BACKEND_DIR)),
        ("frontend", MAGENTA, start_process("frontend", MAGENTA, frontend_cmd, FRONTEND_DIR)),
    ]

    app_url = f"http://localhost:{FRONTEND_PORT}"
    log(f"App:      {app_url}")
    log(f"API docs: http://localhost:{BACKEND_PORT}/docs")

    if not args.no_browser:
        threading.Thread(
            target=open_browser_when_ready, args=(app_url, FRONTEND_PORT), daemon=True
        ).start()

    exit_code = 0
    try:
        while True:
            for name, _, proc in processes:
                code = proc.poll()
                if code is not None:
                    log(f"The {name} server exited with code {code}. Shutting down.", RED)
                    exit_code = code or 1
                    raise KeyboardInterrupt
            time.sleep(0.5)
    except KeyboardInterrupt:
        log("Stopping servers ...", YELLOW)
    finally:
        for _, _, proc in processes:
            stop_process(proc)
        log("Stopped.")
    sys.exit(exit_code)


if __name__ == "__main__":
    main()