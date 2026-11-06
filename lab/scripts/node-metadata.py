#!/usr/bin/env python3
"""Change one exercise-owned node key with optimistic concurrency checks."""
import argparse
import json
import subprocess
import sys

CONTEXT = "kind-k8s-ops-lab"


def kubectl(*args):
    return subprocess.run(
        ["kubectl", "--context", CONTEXT, *args],
        check=True, text=True, capture_output=True,
    ).stdout


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["label-add", "label-remove", "taint-add", "taint-remove"])
    parser.add_argument("node")
    parser.add_argument("key", choices=["lab.k8svisual.dev/agent", "lab.k8sops.dev/pool", "lab.k8sops.dev/dedicated"])
    parser.add_argument("value")
    parser.add_argument("--uid")
    args = parser.parse_args()
    removing = args.action.endswith("remove")
    if removing and not args.uid:
        raise ValueError("Removal requires the UID recorded after a successful addition")
    node = json.loads(kubectl("get", "node", args.node, "-o", "json"))
    metadata = node["metadata"]
    uid = metadata["uid"]
    if removing and uid != args.uid:
        raise ValueError("Node identity changed; refusing removal")
    patch = [
        {"op": "test", "path": "/metadata/uid", "value": uid},
        {"op": "test", "path": "/metadata/resourceVersion", "value": metadata["resourceVersion"]},
    ]
    if args.action.startswith("label"):
        labels = metadata.get("labels", {})
        path = "/metadata/labels/" + args.key.replace("~", "~0").replace("/", "~1")
        if removing:
            if args.key not in labels:
                print(uid)  # A repeated cleanup has nothing left to remove.
                return
            if labels[args.key] != args.value:
                raise ValueError("Label value changed; refusing removal")
            patch.append({"op": "remove", "path": path})
        else:
            if args.key in labels:
                raise ValueError("Label key already exists; refusing adoption or overwrite")
            if "labels" not in metadata:
                patch.append({"op": "add", "path": "/metadata/labels", "value": {}})
            patch.append({"op": "add", "path": path, "value": args.value})
    else:
        taints = node.get("spec", {}).get("taints", [])
        matches = [(i, t) for i, t in enumerate(taints) if t["key"] == args.key]
        expected = {"key": args.key, "value": args.value, "effect": "NoSchedule"}
        if removing:
            if not matches:
                print(uid)
                return
            if len(matches) != 1 or matches[0][1] != expected:
                raise ValueError("Taint changed; refusing removal")
            patch.append({"op": "remove", "path": f"/spec/taints/{matches[0][0]}"})
        else:
            if matches:
                raise ValueError("Taint key already exists; refusing adoption or overwrite")
            patch.append({"op": "add", "path": "/spec/taints", "value": [*taints, expected]})
    kubectl("patch", "node", args.node, "--type=json", "-p", json.dumps(patch))
    print(uid)


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, subprocess.CalledProcessError) as error:
        print(f"Stopped: {error}", file=sys.stderr)
        if isinstance(error, subprocess.CalledProcessError):
            print(error.stderr, file=sys.stderr)
        sys.exit(1)
