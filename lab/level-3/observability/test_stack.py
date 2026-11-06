"""Exercise ownership and failure paths without Docker."""
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import stack


class StackGuardTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / "state.json"
        self.state = {"daemon": "daemon-a", "project": "project-a", "token": "run-a"}
        self.path.write_text(json.dumps(self.state))
        self.calls = []

    def fake_run(self, *args, **kwargs):
        self.calls.append(args)
        return "daemon-a" if args[1:2] == ("info",) else ""

    def execute(self, action, resources=(), run=None):
        with patch.object(stack, "run", side_effect=run or self.fake_run), patch.object(stack, "inventory", return_value=resources):
            stack.execute(self.path, action, [])

    def test_owned_cleanup(self):
        self.execute("down", [("volume", "v", {stack.LABEL: "run-a"})])
        self.assertEqual(self.calls[-1][-1], "down")
        self.assertNotIn("prune", str(self.calls))

    def test_foreign_resources_stop_every_mutation(self):
        for kind in ("container", "network", "volume"):
            with self.subTest(kind=kind), self.assertRaises(ValueError):
                self.execute("down", [(kind, "foreign", {})])
        self.assertTrue(all(c[1] == "info" for c in self.calls))

    def test_changed_daemon_stops_cleanup(self):
        with self.assertRaises(ValueError):
            self.execute("down", run=lambda *a, **k: "daemon-b")

    def test_read_failure_never_reaches_compose(self):
        with patch.object(stack, "run", side_effect=self.fake_run), patch.object(stack, "inventory", side_effect=OSError("denied")):
            with self.assertRaises(OSError):
                stack.execute(self.path, "down", [])
        self.assertEqual(len(self.calls), 1)

    def test_config_failure_stops_up(self):
        def failing(*args, **kwargs):
            if "config" in args:
                raise OSError("config failed")
            return self.fake_run(*args, **kwargs)
        with self.assertRaises(OSError):
            self.execute("up", run=failing)
        self.assertFalse(any("up" in c for c in self.calls))

    def test_partial_start_can_be_cleaned_but_not_restarted(self):
        resources = [("container", "partial", {stack.LABEL: "run-a"})]
        with self.assertRaises(ValueError):
            self.execute("up", resources)
        self.execute("down", resources)
        self.assertEqual(self.calls[-1][-1], "down")

    def test_create_refuses_project_collision(self):
        self.path.unlink()
        with self.assertRaises(ValueError):
            self.execute("init", [("network", "collision", {})])
        self.assertFalse(self.path.exists())

    def test_create_never_overwrites_receipt(self):
        with self.assertRaises(FileExistsError):
            self.execute("init")
        self.assertEqual(json.loads(self.path.read_text()), self.state)

    def test_absent_receipt_stops_cleanup(self):
        self.path.unlink()
        with self.assertRaises(FileNotFoundError):
            self.execute("down")

    def test_failed_down_propagates(self):
        def failing(*args, **kwargs):
            if "down" in args:
                raise OSError("cleanup failed")
            return self.fake_run(*args, **kwargs)
        with self.assertRaises(OSError):
            self.execute("down", run=failing)
        self.assertTrue(self.path.exists())


if __name__ == "__main__":
    unittest.main()
