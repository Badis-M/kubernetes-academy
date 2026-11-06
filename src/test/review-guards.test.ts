import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { getChapter } from "@/content/curriculum";
import { labSteps } from "@/content/lab-steps";

function blocks(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  const item = value as Record<string, unknown>;
  return [
    ...(item["lang"] === "bash" && typeof item["code"] === "string" ? [item["code"]] : []),
    ...Object.values(item).flatMap(blocks),
  ];
}
function snippet(chapter: string, needle: string) {
  const matches = blocks(getChapter(chapter)).filter((code) => code.includes(needle));
  expect(matches).toHaveLength(1);
  return matches[0]!;
}
const targets = [
  ["namespaces-contexts", "LAB_NAMESPACES_A_UID="],
  ["labels-selectors", "LAB_LABELS_UID="],
  ["configmaps-secrets", "LAB_CONFIG_UID="],
  ["kubectl-troubleshooting", "LAB_TROUBLESHOOTING_UID="],
  ["statefulsets", "--replicas=0"],
  ["helm-basics", "helm uninstall"],
  ["helm-charts", "helm uninstall"],
  ["helm-releases", "helm uninstall"],
  ["pod-security", "apply --dry-run=server -f lab/level-3/pod-security/fixed-legacy.yaml"],
  ["setup-kind", "curl -fLO https://dl.k8s.io"],
  ["setup-kind", "curl -fLO https://github.com/kubernetes-sigs/kind"],
  ["custom-controllers", "LAB_OPERATOR_BUILD_DIR="],
  ["custom-controllers", "LAB_GREETING_GENERATION=$(kubectl"],
  ["operators", "LAB_OPERATOR_BUILD_DIR="],
  ["operators", "LAB_GREETING_GENERATION=$(kubectl"],
  ["operators", '"paused":false'],
  ["kubebuilder-operator", "make -C"],
  ["kubebuilder-operator", "docker build -t greeting-controller"],
  ["observability", "docker compose version"],
] as const;

const stub = `
record() {
  IFS= read -r count < "$COUNT_FILE"
  count=$((count + 1))
  printf '%s\\n' "$count" > "$COUNT_FILE"
  printf '%s\\n' "$*" >> "$TRACE_FILE"
  [ "$count" != "$FAIL_AT" ]
}
k() { record k "$@" || return 73; case "$*" in *--ignore-not-found*) if [ "\${EXISTING_DEPLOYMENT:-}" = yes ]; then printf deployment/web; fi ;; *jsonpath*) printf owned ;; esac; }
kubectl() { record kubectl "$@" || return 73; case "$*" in *jsonpath*) printf owned ;; esac; }
helm() { record helm "$@"; }
curl() { record curl "$@"; }
sudo() { record sudo "$@"; }
sha256sum() { record sha256sum "$@"; }
cat() { record cat "$@" || return 73; printf checksum; }
rm() { record rm "$@"; }
mktemp() { record mktemp "$@" || return 73; printf '%s' "$TEMP_DIR"; }
cd() { record cd "$@"; }
go() { record go "$@"; }
make() { record make "$@"; }
git() { record git "$@"; }
docker() { record docker "$@"; }
kind() { record kind "$@"; }
python3() { record python3 "$@" || return 73; printf password; }
python() { record python "$@"; }
source() { record source "$@"; }
`;
const shells = ["bash", "zsh"].filter((s) => spawnSync(s, ["--version"]).status === 0);

describe.each(shells)("R16–R23 command boundaries in %s", (shell) => {
  function run(code: string, failAt = 0, variables: Record<string, string> = {}) {
    const dir = mkdtempSync(join(tmpdir(), "academy-guards-"));
    try {
      writeFileSync(join(dir, "count"), "0\n");
      writeFileSync(join(dir, "trace"), "");
      writeFileSync(
        join(dir, "greeting-controller"),
        "#!/bin/sh\n" + stub.slice(0, stub.indexOf("k()")) + '\nrecord manager "$@"',
        { mode: 0o700 },
      );
      const result = spawnSync(shell, [], {
        cwd: dir,
        input: stub + "\n" + code,
        encoding: "utf8",
        env: {
          ...process.env,
          TEMP_DIR: dir,
          COUNT_FILE: join(dir, "count"),
          TRACE_FILE: join(dir, "trace"),
          FAIL_AT: String(failAt),
          LAB_GREETING_STATE: "/mock/receipt",
          ...variables,
        },
      });
      return {
        ...result,
        calls: readFileSync(join(dir, "trace"), "utf8").trim().split("\n").filter(Boolean),
      };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  it.each(targets)("stops %s (%s) at every failed command", (chapter, needle) => {
    const code = snippet(chapter, needle);
    const success = run(code);
    expect(success.status, success.stderr).toBe(0);
    expect(success.calls.length).toBeGreaterThan(1);
    for (let failure = 1; failure <= success.calls.length; failure++) {
      const result = run(code, failure);
      expect(result.status, `failure ${failure}: ${result.stderr}`).not.toBe(0);
      expect(result.calls, `continued after ${success.calls[failure - 1]}`).toHaveLength(failure);
    }
  });
  it("stops optional Python setup at every failed prerequisite", () => {
    const code = labSteps[0]!.command;
    const success = run(code);
    expect(success.status).toBe(0);
    for (let failure = 1; failure <= success.calls.length; failure++) {
      const result = run(code, failure);
      expect(result.status).not.toBe(0);
      expect(result.calls).toHaveLength(failure);
    }
  });
  it.each([
    "lab-namespaces-a",
    "lab-namespaces-b",
    "lab-labels",
    "lab-config",
    "lab-troubleshooting",
  ])("requires identity before cleaning %s", (namespace) => {
    const chapter = namespace.startsWith("lab-namespaces")
      ? "namespaces-contexts"
      : namespace === "lab-labels"
        ? "labels-selectors"
        : namespace === "lab-config"
          ? "configmaps-secrets"
          : "kubectl-troubleshooting";
    const code = snippet(chapter, `delete namespace ${namespace}`);
    const variable = namespace.toUpperCase().replaceAll("-", "_") + "_UID";
    for (const value of ["", "foreign"]) {
      const result = run(code, 0, { [variable]: value });
      expect(result.status).not.toBe(0);
      expect(result.calls.join("\n")).not.toContain("delete namespace");
    }
    const readFailure = run(code, 1, { [variable]: "owned" });
    expect(readFailure.calls).toHaveLength(1);
    expect(readFailure.status).not.toBe(0);
    expect(run(code, 0, { [variable]: "owned" }).status).toBe(0);
  });
  it("retains only the successful namespace receipt after partial setup", () => {
    const code = snippet("namespaces-contexts", "LAB_NAMESPACES_A_UID=");
    const result = run(
      code +
        '\nresult=$?\nprintf "receipts=%s/%s" "$LAB_NAMESPACES_A_UID" "$LAB_NAMESPACES_B_UID"\nexit "$result"',
      2,
    );
    expect(result.status).not.toBe(0);
    expect(result.stdout).toBe("receipts=owned/");
    expect(result.calls).toHaveLength(2);
  });
  it("records final namespace cleanup permission only after successful Deployment deletion", () => {
    const code = snippet("deployments", "k delete deployment web");
    const success = run(code, 0, {
      LAB_RECOVERED_DEPLOYMENT_UID: "owned",
      LAB_DEPLOYMENTS_NS_UID: "owned",
    });
    expect(success.status).toBe(0);
    for (let failure = 1; failure <= success.calls.length; failure++) {
      const result = run(
        code +
          '\nresult=$?\nprintf "receipt=%s" "${LAB_DEPLOYMENTS_CLEANUP_UID:-}"\nexit "$result"',
        failure,
        { LAB_RECOVERED_DEPLOYMENT_UID: "owned", LAB_DEPLOYMENTS_NS_UID: "owned" },
      );
      expect(result.status).not.toBe(0);
      expect(result.stdout).toBe("receipt=");
      expect(result.calls).toHaveLength(failure);
    }
  });
  it("never deletes the Deployments namespace without the recovery receipt", () => {
    const code = snippet("deployments", "delete namespace lab-deployments");
    for (const receipt of ["", "foreign"]) {
      const result = run(code, 0, {
        LAB_DEPLOYMENTS_NS_UID: "owned",
        LAB_DEPLOYMENTS_CLEANUP_UID: receipt,
      });
      expect(result.status).not.toBe(0);
      expect(result.calls.join("\n")).not.toContain("delete namespace");
    }
    const result = run(code, 0, {
      LAB_DEPLOYMENTS_NS_UID: "owned",
      LAB_DEPLOYMENTS_CLEANUP_UID: "owned",
    });
    expect(result.status).toBe(0);
    expect(result.calls.at(-1)).toContain("delete namespace");
    const replacement = run(code, 0, {
      LAB_DEPLOYMENTS_NS_UID: "owned",
      LAB_DEPLOYMENTS_CLEANUP_UID: "owned",
      EXISTING_DEPLOYMENT: "yes",
    });
    expect(replacement.status).not.toBe(0);
    expect(replacement.calls.join("\n")).not.toContain("delete namespace");
  });
  it.each(["troubleshooting-2", "admission-webhooks", "scheduler-internals", "failure-scenarios"])(
    "separates failure and recovery in %s",
    (chapter) => {
      const source = blocks(getChapter(chapter));
      const pairs = [
        ["nginx:missing-lab-tag", "nginx:1.28.0-alpine"],
        ["--replicas=0", "--replicas=1"],
        ["lab-balanced", "default-scheduler"],
        ["--replicas=1", "--replicas=2"],
      ];
      const [failure, recovery] =
        pairs[
          [
            "troubleshooting-2",
            "admission-webhooks",
            "scheduler-internals",
            "failure-scenarios",
          ].indexOf(chapter)
        ]!;
      expect(source.filter((b) => b.includes(failure!)).length).toBeGreaterThan(0);
      expect(source.some((b) => b.includes(failure!) && b.includes(recovery!))).toBe(false);
    },
  );
});
