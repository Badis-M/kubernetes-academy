"""The shared CRD receipt is tested with a fake kubectl transport."""
import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("schema_guard", Path(__file__).with_name("greeting-schema.py"))
schema = importlib.util.module_from_spec(spec)
spec.loader.exec_module(schema)


class SchemaTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.receipt = Path(self.temp.name) / "receipt.json"
        self.live = None
        self.calls = []
        self.failure = None

    def kubectl(self, *args):
        self.calls.append(args)
        if args[0] == self.failure:
            raise OSError("transport failed")
        if args[0] == "create":
            self.live = {"metadata": {"uid": "owned"}, "spec": {"versions": [{"name": "v1alpha1"}]}}
        return json.dumps(self.live) if self.live else ""

    def ensure(self):
        with patch.object(schema, "kubectl", side_effect=self.kubectl):
            schema.ensure(self.receipt)

    def test_create_then_reuse_across_chapters(self):
        self.ensure()
        self.ensure()
        self.assertEqual(sum(c[0] == "create" for c in self.calls), 1)
        self.assertFalse(any(c[0] in ("apply", "delete") for c in self.calls))

    def test_unrecorded_existing_crd_is_not_adopted(self):
        self.live = {"metadata": {"uid": "foreign"}, "spec": {}}
        with self.assertRaises(ValueError):
            self.ensure()
        self.assertEqual(len(self.calls), 1)

    def test_replaced_or_changed_schema_stops(self):
        self.ensure()
        original = copy.deepcopy(self.live)
        for changed in ({"metadata": {"uid": "new"}, "spec": original["spec"]}, {"metadata": original["metadata"], "spec": {}}):
            self.live = changed
            with self.assertRaises(ValueError):
                self.ensure()

    def test_disappeared_crd_is_not_recreated(self):
        self.ensure()
        self.live = None
        with self.assertRaises(ValueError):
            self.ensure()

    def test_read_failure_stops_create(self):
        self.failure = "get"
        with self.assertRaises(OSError):
            self.ensure()
        self.assertFalse(self.receipt.exists())

    def test_failed_create_keeps_partial_receipt_and_stops_retry(self):
        self.failure = "create"
        with self.assertRaises(OSError):
            self.ensure()
        self.failure = None
        with self.assertRaises(ValueError):
            self.ensure()
        self.assertEqual(sum(c[0] == "create" for c in self.calls), 1)

    def test_source_change_stops_reuse(self):
        self.ensure()
        saved = json.loads(self.receipt.read_text())
        saved["source"] = "different"
        self.receipt.write_text(json.dumps(saved))
        with self.assertRaises(ValueError):
            self.ensure()


if __name__ == "__main__":
    unittest.main()
