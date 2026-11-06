#!/usr/bin/env python3
"""Create the shared Greeting schema once, then verify the same recorded definition."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

MANIFEST = Path(__file__).resolve().parents[1] / "level-4/crds/greetings.yaml"
NAME = "greetings.learning.k8svisual.dev"


def kubectl(*args):
    return subprocess.run(["kubectl", "--context", "kind-k8s-ops-lab", *args], check=True, text=True, capture_output=True).stdout


def ensure(receipt):
    receipt = Path(receipt)
    digest = hashlib.sha256(MANIFEST.read_bytes()).hexdigest()
    current = kubectl("get", "crd", NAME, "--ignore-not-found", "-o", "json").strip()
    if receipt.exists():
        saved = json.loads(receipt.read_text())
        if not current:
            raise ValueError("Recorded CRD is missing; do not recreate it with the old receipt")
        live = json.loads(current)
        if saved["source"] != digest or saved["uid"] != live["metadata"]["uid"] or saved["spec"] != live["spec"]:
            raise ValueError("Shared CRD identity or schema changed; refusing reuse")
        if live["metadata"].get("deletionTimestamp"):
            raise ValueError("Shared CRD is being deleted")
        return
    if current:
        raise ValueError("CRD already exists without this run's receipt; refusing adoption")
    # Exclusive creation prevents an existing receipt from being replaced.
    with receipt.open("x") as stream:
        receipt.chmod(0o600)
        live = json.loads(kubectl("create", "-f", str(MANIFEST), "-o", "json"))
        json.dump({"source": digest, "uid": live["metadata"]["uid"], "spec": live["spec"]}, stream)


if __name__ == "__main__":
    try:
        ensure(sys.argv[1])
    except (IndexError, KeyError, ValueError, OSError, subprocess.CalledProcessError) as error:
        print(f"Shared schema stopped: {error}", file=sys.stderr)
        sys.exit(1)
