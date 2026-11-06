import { spawnSync } from "node:child_process";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { NetworkPolicyDiagram } from "@/components/diagrams/NetworkPolicyDiagram";
import { LangProvider } from "@/lib/i18n";
import {
  evaluatePolicy,
  initialPolicySettings,
  ingressPolicyYaml,
  egressPolicyYaml,
  extraIngressYaml,
  type PolicySettings,
  type SourceNamespace,
} from "@/content/diagrams/network-policy-model";

const peerCases: [SourceNamespace, boolean, boolean, boolean, boolean][] = [
  ["clients", true, true, true, false],
  ["clients", false, false, true, false],
  ["lab-netpol", true, false, true, true],
  ["lab-netpol", false, false, false, false],
  ["other", true, false, false, false],
  ["other", false, false, false, false],
];
for (const [sourceNamespace, trustedPod, and, or, pod] of peerCases) {
  for (const [peers, expected] of [
    ["and", and],
    ["or", or],
    ["pod", pod],
  ] as const) {
    it(`${peers} scopes ${sourceNamespace}/${trustedPod ? "trusted" : "untrusted"} correctly`, () => {
      expect(
        evaluatePolicy({ ...initialPolicySettings, sourceNamespace, trustedPod, peers }).allowed,
      ).toBe(expected);
    });
  }
}
it("requires both directional permissions and never treats deny as an overriding rule", () => {
  for (const ingress of ["open", "deny", "rules"] as const) {
    for (const egress of ["open", "deny", "rules"] as const) {
      expect(evaluatePolicy({ ...initialPolicySettings, ingress, egress }).allowed).toBe(
        ingress !== "deny" && egress !== "deny",
      );
      expect(
        evaluatePolicy({ ...initialPolicySettings, ingress, egress, extraIngressAllow: true })
          .allowed,
      ).toBe(egress !== "deny");
    }
  }
});
it("ORs ingress ports but ANDs peer, protocol and egress permission", () => {
  expect(evaluatePolicy({ ...initialPolicySettings, connection: "TCP 443" })).toMatchObject({
    ingressAllowed: true,
    egressAllowed: false,
    allowed: false,
  });
  expect(
    evaluatePolicy({ ...initialPolicySettings, connection: "TCP 443", egress: "open" }).allowed,
  ).toBe(true);
  expect(
    evaluatePolicy({ ...initialPolicySettings, connection: "UDP 80", egress: "open" }).allowed,
  ).toBe(false);
  expect(
    evaluatePolicy({
      ...initialPolicySettings,
      connection: "TCP 443",
      egress: "open",
      trustedPod: false,
    }).allowed,
  ).toBe(false);
});

type Selector = { matchLabels?: Record<string, string> };
type Peer = { namespaceSelector?: Selector; podSelector?: Selector };
type Rule = { from?: Peer[]; to?: Peer[]; ports?: { protocol?: string; port: number }[] };
type Policy = {
  metadata: { namespace: string };
  spec: { podSelector: Selector; policyTypes: string[]; ingress?: Rule[]; egress?: Rule[] };
};
type Pod = {
  namespace: string;
  labels: Record<string, string>;
  namespaceLabels: Record<string, string>;
};
const matches = (selector: Selector, labels: Record<string, string>) =>
  Object.entries(selector.matchLabels ?? {}).every(([key, value]) => labels[key] === value);
// Independent interpreter for the YAML subset emitted by the teaching model.
function permits(
  policies: Policy[],
  direction: "Ingress" | "Egress",
  subject: Pod,
  peer: Pod,
  protocol: string,
  port: number,
) {
  const selected = policies.filter(
    (policy) =>
      policy.metadata.namespace === subject.namespace &&
      matches(policy.spec.podSelector, subject.labels) &&
      policy.spec.policyTypes.includes(direction),
  );
  return (
    !selected.length ||
    selected.some((policy) =>
      (direction === "Ingress" ? policy.spec.ingress : policy.spec.egress)?.some((rule) => {
        const peers = direction === "Ingress" ? rule.from : rule.to;
        const peerAllowed =
          !peers?.length ||
          peers.some((item) => {
            if (item.namespaceSelector && !matches(item.namespaceSelector, peer.namespaceLabels))
              return false;
            if (
              item.podSelector &&
              !item.namespaceSelector &&
              peer.namespace !== policy.metadata.namespace
            )
              return false;
            return !item.podSelector || matches(item.podSelector, peer.labels);
          });
        return (
          peerAllowed &&
          (!rule.ports?.length ||
            rule.ports.some((item) => (item.protocol ?? "TCP") === protocol && item.port === port))
        );
      }),
    )
  );
}
it("all 972 settings agree with the displayed YAML, parsed independently with Bun", () => {
  const settings: PolicySettings[] = [];
  for (const sourceNamespace of ["clients", "lab-netpol", "other"] as const)
    for (const trustedPod of [true, false])
      for (const connection of ["TCP 80", "TCP 443", "UDP 80"] as const)
        for (const ingress of ["open", "deny", "rules"] as const)
          for (const egress of ["open", "deny", "rules"] as const)
            for (const peers of ["and", "or", "pod"] as const)
              for (const extraIngressAllow of [true, false])
                settings.push({
                  sourceNamespace,
                  trustedPod,
                  connection,
                  ingress,
                  egress,
                  peers,
                  extraIngressAllow,
                });
  const input = settings.map((config) => [
    ingressPolicyYaml(config),
    egressPolicyYaml(config),
    ...(config.extraIngressAllow ? [extraIngressYaml] : []),
  ]);
  const parse = spawnSync(
    "bun",
    [
      "-e",
      "const rows=await Bun.stdin.json(); console.log(JSON.stringify(rows.map(row=>row.map(text=>Bun.YAML.parse(text)).filter(Boolean))));",
    ],
    { input: JSON.stringify(input), encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
  );
  expect(parse.status, parse.stderr).toBe(0);
  const documents = JSON.parse(parse.stdout) as Policy[][];
  expect(settings).toHaveLength(972);
  const destination: Pod = {
    namespace: "lab-netpol",
    labels: { app: "policy-web" },
    namespaceLabels: { "kubernetes.io/metadata.name": "lab-netpol", team: "lab" },
  };
  settings.forEach((config, index) => {
    const source: Pod = {
      namespace: config.sourceNamespace,
      labels: { role: config.trustedPod ? "trusted-client" : "untrusted-client" },
      namespaceLabels: {
        "kubernetes.io/metadata.name": config.sourceNamespace,
        team:
          config.sourceNamespace === "clients"
            ? "trusted"
            : config.sourceNamespace === "lab-netpol"
              ? "lab"
              : "other",
      },
    };
    const [protocol, port] = config.connection.split(" ");
    const ingress = permits(
      documents[index]!,
      "Ingress",
      destination,
      source,
      protocol!,
      Number(port),
    );
    const egress = permits(
      documents[index]!,
      "Egress",
      source,
      destination,
      protocol!,
      Number(port),
    );
    expect(evaluatePolicy(config), JSON.stringify(config)).toMatchObject({
      ingressAllowed: ingress,
      egressAllowed: egress,
      allowed: ingress && egress,
    });
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
for (const lang of ["fr", "en"] as const) {
  it(`updates verdicts, exposes YAML and cancels playback on edits/reset in ${lang}`, () => {
    vi.useFakeTimers();
    render(
      <LangProvider initialLang={lang}>
        <NetworkPolicyDiagram />
      </LangProvider>,
    );
    const status = screen.getByRole("status", { name: /Verdict du modèle|Model verdict/ });
    expect(status).toHaveTextContent(lang === "fr" ? "autorisé par" : "allowed by");
    fireEvent.change(
      screen.getByLabelText(lang === "fr" ? "Label du Pod source" : "Source Pod label"),
      { target: { value: "untrusted" } },
    );
    expect(status).toHaveTextContent(lang === "fr" ? "bloqué par" : "blocked by");
    fireEvent.change(
      screen.getByLabelText(lang === "fr" ? "Pairs de la règle ingress" : "Ingress rule peers"),
      { target: { value: "or" } },
    );
    expect(status).toHaveTextContent(lang === "fr" ? "autorisé par" : "allowed by");
    const figure = screen.getByRole("figure");
    fireEvent.click(
      within(figure).getByRole("button", { name: lang === "fr" ? "Lecture" : "Play" }),
    );
    act(() => {
      vi.advanceTimersByTime(3200);
    });
    expect(figure.querySelector('[aria-current="step"]')?.textContent).toMatch(/^2\./);
    fireEvent.change(screen.getByLabelText(lang === "fr" ? "Egress source" : "Source egress"), {
      target: { value: "deny" },
    });
    act(() => {
      vi.advanceTimersByTime(6400);
    });
    expect(document.querySelector('[aria-current="step"]')?.textContent).toMatch(/^1\./);
    expect(status).toHaveTextContent(lang === "fr" ? "bloqué par" : "blocked by");
    fireEvent.click(
      screen.getByRole("button", {
        name: lang === "fr" ? "Réinitialiser les règles" : "Reset rules",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: lang === "fr" ? "Lecture" : "Play" }));
    act(() => {
      vi.advanceTimersByTime(3200);
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: lang === "fr" ? "Réinitialiser les règles" : "Reset rules",
      }),
    );
    act(() => {
      vi.advanceTimersByTime(6400);
    });
    expect(document.querySelector('[aria-current="step"]')?.textContent).toMatch(/^1\./);
    expect(status).toHaveTextContent(lang === "fr" ? "autorisé par" : "allowed by");
    expect(screen.getByText("diagram-web-ingress", { exact: false })).toBeInTheDocument();
  });
}
