#!/usr/bin/env python3
"""Operate only this run's labeled Compose resources on the recorded Docker daemon."""
import json
import os
from pathlib import Path
import subprocess
import sys
import uuid

ROOT = Path(__file__).resolve().parent
LABEL = "dev.k8sacademy.observability-run"
PROJECT_LABEL = "com.docker.compose.project"


def run(*args, env=None, capture=True):
    result = subprocess.run(args, check=True, text=True, capture_output=capture, env=env)
    return result.stdout.strip() if capture else ""


def inventory(project):
    result = []
    for kind in ("container", "network", "volume"):
        identities = set()
        for selector in (f"label={PROJECT_LABEL}={project}", f"name={project}"):
            args = ["docker", kind, "ls", "--filter", selector, "--format", "{{.ID}}" if kind != "volume" else "{{.Name}}"]
            if kind == "container":
                args.append("--all")
            identities.update(run(*args).splitlines())
        for identity in sorted(identities):
            item = json.loads(run("docker", kind, "inspect", identity))[0]
            labels = item.get("Config", {}).get("Labels", {}) if kind == "container" else item.get("Labels", {})
            result.append((kind, identity, labels or {}))
    return result


def execute(state_path, action, args):
    state_path = Path(state_path)
    daemon = run("docker", "info", "--format", "{{.ID}}")
    if not daemon:
        raise ValueError("Docker daemon identity is missing")
    if action == "init":
        token = uuid.uuid4().hex
        project = "k8s-ops-observability-" + token
        if inventory(project):
            raise ValueError("Compose project collision; refusing adoption")
        state_path.parent.mkdir(parents=True, exist_ok=True)
        with state_path.open("x") as stream:
            json.dump({"daemon": daemon, "project": project, "token": token}, stream)
        state_path.chmod(0o600)
        print(f"Reserved project: {project}")
        return
    state = json.loads(state_path.read_text())
    if daemon != state["daemon"]:
        raise ValueError("Docker daemon changed; refusing operation")
    resources = inventory(state["project"])
    if any(labels.get(LABEL) != state["token"] for _, _, labels in resources):
        raise ValueError("Foreign or replaced Compose resource; refusing operation")
    if action == "up" and resources:
        raise ValueError("Project already has resources; inspect partial setup, do not retry up")
    allowed = {"up", "ps", "logs", "stop", "start", "down"}
    if action not in allowed:
        raise ValueError("Unsupported lab action")
    env = {**os.environ, "LAB_OBS_RUN": state["token"]}
    compose = ["docker", "compose", "-p", state["project"], "-f", str(ROOT / "compose.yaml")]
    run(*compose, "config", "--quiet", env=env)
    run(*compose, action, *args, env=env, capture=False)


if __name__ == "__main__":
    try:
        execute(sys.argv[1], sys.argv[2], sys.argv[3:])
    except (IndexError, KeyError, ValueError, OSError, subprocess.CalledProcessError) as error:
        # Do not echo captured configuration output or environment values.
        detail = f"Docker command failed with exit code {error.returncode}" if isinstance(error, subprocess.CalledProcessError) else str(error)
        print(f"Stack operation stopped: {detail}", file=sys.stderr)
        sys.exit(1)
