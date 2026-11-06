import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { getChapter } from "@/content/curriculum";

function snippet(id: string, needle: string): string {
  const matches: string[] = [];
  function walk(value: unknown) {
    if (!value || typeof value !== "object") return;
    const item = value as Record<string, unknown>;
    if (typeof item["code"] === "string" && item["code"].includes(needle))
      matches.push(item["code"]);
    Object.values(item).forEach(walk);
  }
  walk(getChapter(id));
  expect(matches).toHaveLength(1);
  return matches[0]!;
}

const stub = `
k() {
  printf 'k %s\\n' "$*" >&2
  case "$*" in
    'create -f '*argo-project.yaml*) [ "$FAIL" != project-create ] || return 1; printf owned ;;
    'create -f '*argo-application.yaml*) [ "$FAIL" != application-create ] || return 1; printf owned ;;
    *'delete application'*) [ "$FAIL" != application-delete ] ;;
    *'delete appproject'*) [ "$FAIL" != project-delete ] ;;
    'create namespace envoy-gateway-system'*) [ "$FAIL" != namespace-create ] || return 1; printf owned ;;
    *'jsonpath='*)
      [ "$FAIL" != read ] || return 1
      if [ "$FAIL" = partial-read ]; then printf owned; return 1; fi
      if [ "$FAIL" = replaced ]; then printf foreign; else printf owned; fi ;;
    *'--ignore-not-found'*)
      [ "$FAIL" != forbidden ] || return 1
      if [ "$FAIL" = collision ]; then printf existing; fi ;;
    *'delete -f'*) [ "$FAIL" != route ] ;;
    'delete gatewayclass'*) [ "$FAIL" != class ] ;;
    'delete namespace lab-gateway'*) [ "$FAIL" != namespace ] ;;
  esac
}
helm() {
  printf 'helm %s\\n' "$*" >&2
  [ "$FAIL" != helm ]
}
python3() {
  printf 'python3 %s\\n' "$*" >&2
  case "$*" in
    *'label-add '*'worker2 '*|*'label-add b '*) [ "$FAIL" != second ] || return 1 ;;
    *'label-add '*) [ "$FAIL" != first ] || return 1 ;;
  esac
  printf owned
}
`;
const shells = ["bash", "zsh"].filter((shell) => spawnSync(shell, ["--version"]).status === 0);

describe.each(shells)("authored lab guards in %s", (shell) => {
  function run(block: string, failure: string) {
    return spawnSync(shell, [], {
      input: stub + "\n" + block,
      encoding: "utf8",
      env: {
        ...process.env,
        FAIL: failure,
        worker_a: "a",
        worker_b: "b",
        LAB_GATEWAY_NS_UID: "owned",
        LAB_GITOPS_ARGO_UID: "owned",
        LAB_ARGO_PROJECT_UID: "owned",
        LAB_ARGO_APPLICATION_UID: "owned",
        LAB_GITOPS_OUTPUT_DIR: "/mock",
        LAB_GATEWAY_CLASS_UID: "owned",
        LAB_ENVOY_NS_UID: "owned",
        LAB_ENVOY_RELEASE_UID: "owned",
      },
    });
  }
  it.each(["collision", "forbidden", "read", "partial-read", "replaced", "project-create"])(
    "blocks Argo creation after %s",
    (failure) => {
      const result = run(snippet("gitops", "LAB_ARGO_PROJECT_UID="), failure);
      expect(result.status).not.toBe(0);
      expect(result.stderr).not.toContain("create -f /mock/argo-application.yaml");
    },
  );
  it("keeps the created project UID after Application creation fails", () => {
    const block = snippet("gitops", "LAB_ARGO_PROJECT_UID=");
    const result = run(
      block +
        '\nresult=$?\nprintf "uids=%s/%s" "$LAB_ARGO_PROJECT_UID" "$LAB_ARGO_APPLICATION_UID"\nexit "$result"',
      "application-create",
    );
    expect(result.status).not.toBe(0);
    expect(result.stdout).toBe("uids=owned/");
    expect(result.stderr).not.toMatch(/delete|apply/);
  });
  it.each(["collision", "forbidden", "read", "partial-read", "replaced", "project-delete"])(
    "blocks Argo namespace cleanup after %s",
    (failure) => {
      const result = run(snippet("gitops", "delete appproject academy-lab"), failure);
      expect(result.status).not.toBe(0);
      expect(result.stderr).not.toContain("delete namespace");
    },
  );
  it("completes Argo project cleanup when the Application is absent", () => {
    const result = run(snippet("gitops", "delete appproject academy-lab"), "ok");
    expect(result.status).toBe(0);
    expect(result.stderr).toContain("delete namespace lab-gitops-argo");
  });
  it.each([
    ["read", /delete|uninstall/],
    ["partial-read", /delete|uninstall/],
    ["replaced", /delete|uninstall/],
    ["route", /delete gatewayclass|delete namespace|uninstall/],
    ["class", /delete namespace|uninstall/],
    ["namespace", /uninstall|delete namespace envoy/],
    ["helm", /delete namespace envoy/],
  ])("stops Gateway cleanup after %s failure", (failure, forbidden) => {
    const result = run(snippet("ingress-gateway", "uninstall lab-eg"), failure);
    expect(result.status).not.toBe(0);
    expect(result.stderr).not.toMatch(forbidden);
  });
  it.each(["namespace-create", "helm"])("preserves partial Gateway setup after %s", (failure) => {
    const block = snippet("ingress-gateway", "LAB_ENVOY_RELEASE_UID=");
    const result = run(
      block +
        '\nresult=$?\nprintf "uids=%s/%s" "$LAB_ENVOY_NS_UID" "$LAB_ENVOY_RELEASE_UID"\nexit "$result"',
      failure,
    );
    expect(result.status).not.toBe(0);
    expect(result.stdout).toBe(failure === "helm" ? "uids=owned/" : "uids=/");
    expect(result.stderr).not.toMatch(/get secret|delete|uninstall/);
  });
  it("removes the controller namespace only after successful teardown", () => {
    const result = run(snippet("ingress-gateway", "uninstall lab-eg"), "ok");
    expect(result.status).toBe(0);
    expect(result.stderr).toMatch(/delete namespace envoy-gateway-system/);
  });
  it.each(["collision", "forbidden"])("does not install Gateway after %s", (failure) => {
    const result = run(snippet("ingress-gateway", "LAB_ENVOY_RELEASE_UID="), failure);
    expect(result.status).not.toBe(0);
    expect(result.stderr).not.toMatch(/create namespace|helm /);
  });
  it.each(["first", "second"])("stops Scheduling setup after the %s label fails", (failure) => {
    const result = run(snippet("scheduling", "LAB_POOL_A_UID="), failure);
    expect(result.status).not.toBe(0);
    expect(result.stderr).not.toContain("taint-add");
    if (failure === "first") expect(result.stderr).not.toContain("label-add b");
  });
  it("stops DaemonSet setup after the first label fails", () => {
    const result = run(snippet("daemonsets", "LAB_DAEMON_WORKER_UID="), "first");
    expect(result.status).not.toBe(0);
    expect(result.stderr).not.toMatch(/rollout status|label-add .*worker2/);
  });
});
