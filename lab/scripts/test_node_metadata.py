"""Offline safety checks; kubectl is replaced with an in-memory API double."""
import copy
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("node_metadata", Path(__file__).with_name("node-metadata.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class NodeMetadataTests(unittest.TestCase):
    def setUp(self):
        self.node = {"metadata": {"uid": "owned", "resourceVersion": "7", "labels": {"unrelated": "keep"}}, "spec": {"taints": [{"key": "unrelated", "effect": "NoSchedule"}]}}
        self.calls = []
        self.conflict = False

    def kubectl(self, *args):
        self.calls.append(args)
        if args[0] == "get":
            return json.dumps(self.node)
        if self.conflict:
            raise subprocess.CalledProcessError(1, args, stderr="resourceVersion test failed")
        document = copy.deepcopy(self.node)
        for operation in json.loads(args[-1]):
            keys = [key.replace("~1", "/").replace("~0", "~") for key in operation["path"].split("/")[1:]]
            parent = document
            for key in keys[:-1]:
                parent = parent[int(key)] if isinstance(parent, list) else parent[key]
            key = int(keys[-1]) if isinstance(parent, list) else keys[-1]
            if operation["op"] == "test":
                self.assertEqual(parent[key], operation["value"])
            elif operation["op"] == "remove":
                del parent[key]
            else:
                parent[key] = operation["value"]
        self.node = document
        return "patched"

    def run_action(self, action, key="lab.k8svisual.dev/agent", value="enabled", uid=None):
        argv = ["node-metadata.py", action, "worker", key, value]
        if uid is not None:
            argv += ["--uid", uid]
        with patch.object(sys, "argv", argv), patch.object(module, "kubectl", self.kubectl), patch("sys.stdout", new_callable=io.StringIO) as output:
            module.main()
            return output.getvalue().strip()

    def test_label_roundtrip_preserves_unrelated_metadata(self):
        original = copy.deepcopy(self.node)
        self.assertEqual(self.run_action("label-add"), "owned")
        self.run_action("label-remove", uid="owned")
        self.assertEqual(self.node, original)

    def test_existing_label_including_empty_is_not_adopted(self):
        for value in ["", "enabled", "foreign"]:
            self.node["metadata"]["labels"]["lab.k8svisual.dev/agent"] = value
            with self.assertRaises(ValueError):
                self.run_action("label-add")
        self.assertTrue(all(call[0] == "get" for call in self.calls))

    def test_missing_or_replaced_uid_blocks_removal(self):
        for uid in [None, "", "replaced"]:
            with self.assertRaises(ValueError):
                self.run_action("label-remove", uid=uid)
        self.assertTrue(all(call[0] == "get" for call in self.calls))

    def test_changed_label_blocks_removal(self):
        self.node["metadata"]["labels"]["lab.k8svisual.dev/agent"] = "foreign"
        with self.assertRaises(ValueError):
            self.run_action("label-remove", uid="owned")
        self.assertEqual(len(self.calls), 1)

    def test_absent_key_cleanup_is_read_only(self):
        self.run_action("label-remove", uid="owned")
        self.run_action("taint-remove", "lab.k8sops.dev/dedicated", "exercise", "owned")
        self.assertTrue(all(call[0] == "get" for call in self.calls))

    def test_taint_roundtrip_preserves_other_taints(self):
        original = copy.deepcopy(self.node)
        self.run_action("taint-add", "lab.k8sops.dev/dedicated", "exercise")
        self.run_action("taint-remove", "lab.k8sops.dev/dedicated", "exercise", "owned")
        self.assertEqual(self.node, original)

    def test_existing_taint_any_effect_blocks_addition(self):
        for effect in ["NoSchedule", "NoExecute", "PreferNoSchedule"]:
            self.node["spec"]["taints"] = [{"key": "lab.k8sops.dev/dedicated", "effect": effect}]
            with self.assertRaises(ValueError):
                self.run_action("taint-add", "lab.k8sops.dev/dedicated", "exercise")
        self.assertTrue(all(call[0] == "get" for call in self.calls))

    def test_changed_taint_blocks_removal(self):
        self.node["spec"]["taints"] = [{"key": "lab.k8sops.dev/dedicated", "value": "foreign", "effect": "NoSchedule"}]
        with self.assertRaises(ValueError):
            self.run_action("taint-remove", "lab.k8sops.dev/dedicated", "exercise", "owned")
        self.assertEqual(len(self.calls), 1)

    def test_concurrent_update_is_not_retried(self):
        original = copy.deepcopy(self.node)
        self.conflict = True
        with self.assertRaises(subprocess.CalledProcessError):
            self.run_action("label-add")
        self.assertEqual(self.node, original)
        self.assertEqual(len(self.calls), 2)

    def test_read_error_prevents_patch(self):
        with patch.object(module, "kubectl", side_effect=subprocess.CalledProcessError(1, "kubectl", stderr="Forbidden")) as mocked, patch.object(sys, "argv", ["script", "label-add", "worker", "lab.k8svisual.dev/agent", "enabled"]):
            with self.assertRaises(subprocess.CalledProcessError):
                module.main()
            self.assertEqual(mocked.call_count, 1)

    def test_explicit_context_and_failed_command(self):
        with patch.object(module.subprocess, "run", side_effect=subprocess.CalledProcessError(1, "kubectl")) as mocked:
            with self.assertRaises(subprocess.CalledProcessError):
                module.kubectl("get", "node", "worker")
            self.assertEqual(mocked.call_args.args[0][:3], ["kubectl", "--context", "kind-k8s-ops-lab"])
            self.assertTrue(mocked.call_args.kwargs["check"])


if __name__ == "__main__":
    unittest.main()
