export type IsolationMode = "open" | "deny" | "rules";
export type PeerMode = "and" | "or" | "pod";
export type SourceNamespace = "lab-netpol" | "clients" | "other";
export type Connection = "TCP 80" | "TCP 443" | "UDP 80";
export type PolicySettings = {
  sourceNamespace: SourceNamespace;
  trustedPod: boolean;
  connection: Connection;
  ingress: IsolationMode;
  egress: IsolationMode;
  peers: PeerMode;
  extraIngressAllow: boolean;
};

export const initialPolicySettings: PolicySettings = {
  sourceNamespace: "clients",
  trustedPod: true,
  connection: "TCP 80",
  ingress: "rules",
  egress: "rules",
  peers: "and",
  extraIngressAllow: false,
};

// This finite teaching model is not a general NetworkPolicy evaluator.
export function evaluatePolicy(settings: PolicySettings) {
  const namespaceMatches = settings.sourceNamespace === "clients";
  const localPodMatches = settings.sourceNamespace === "lab-netpol" && settings.trustedPod;
  const peerMatches =
    settings.peers === "and"
      ? namespaceMatches && settings.trustedPod
      : settings.peers === "or"
        ? namespaceMatches || localPodMatches
        : localPodMatches;
  const ingressPortMatches = settings.connection === "TCP 80" || settings.connection === "TCP 443";
  const egressRuleMatches = settings.connection === "TCP 80";
  const ingressRuleMatches = peerMatches && ingressPortMatches;
  const ingressAllowed =
    settings.extraIngressAllow ||
    settings.ingress === "open" ||
    (settings.ingress === "rules" && ingressRuleMatches);
  const egressAllowed =
    settings.egress === "open" || (settings.egress === "rules" && egressRuleMatches);
  return {
    namespaceMatches,
    localPodMatches,
    peerMatches,
    ingressPortMatches,
    ingressRuleMatches,
    egressRuleMatches,
    ingressAllowed,
    egressAllowed,
    allowed: ingressAllowed && egressAllowed,
  };
}

export function ingressPolicyYaml(settings: PolicySettings) {
  if (settings.ingress === "open") return "# No base Ingress policy selects web.\n";
  const prefix = `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: diagram-web-ingress
  namespace: lab-netpol
spec:
  podSelector:
    matchLabels:
      app: policy-web
  policyTypes: [Ingress]
`;
  if (settings.ingress === "deny") return prefix + "  ingress: []\n";
  const peer =
    settings.peers === "and"
      ? `        - namespaceSelector:
            matchLabels:
              team: trusted
          podSelector:
            matchLabels:
              role: trusted-client`
      : settings.peers === "or"
        ? `        - namespaceSelector:
            matchLabels:
              team: trusted
        - podSelector:
            matchLabels:
              role: trusted-client`
        : `        - podSelector:
            matchLabels:
              role: trusted-client`;
  return (
    prefix +
    `  ingress:
    - from:
${peer}
      ports:
        - protocol: TCP
          port: 80
        - protocol: TCP
          port: 443
`
  );
}

export function egressPolicyYaml(settings: PolicySettings) {
  if (settings.egress === "open") return "# No Egress policy selects the source Pod.\n";
  const prefix = `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: diagram-source-egress
  namespace: ${settings.sourceNamespace}
spec:
  podSelector:
    matchLabels:
      role: ${settings.trustedPod ? "trusted-client" : "untrusted-client"}
  policyTypes: [Egress]
`;
  return (
    prefix +
    (settings.egress === "deny"
      ? "  egress: []\n"
      : `  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: lab-netpol
          podSelector:
            matchLabels:
              app: policy-web
      ports:
        - protocol: TCP
          port: 80
`)
  );
}

export const extraIngressYaml = `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: diagram-extra-allow
  namespace: lab-netpol
spec:
  podSelector:
    matchLabels:
      app: policy-web
  policyTypes: [Ingress]
  ingress:
    - {}
`;
