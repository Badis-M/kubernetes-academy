import type { L } from "../types";
import type { SequenceLane, SequenceScenario } from "@/components/diagrams/StepSequenceDiagram";
import { evaluatePolicy, type PolicySettings } from "./network-policy-model";

const l = (en: string, fr: string): L => ({ en, fr });
export const policyTitle = l(
  "NetworkPolicies · two permissions, one connection",
  "NetworkPolicies · deux permissions, une connexion",
);
export const policyScope = l(
  "Simulation of new direct Pod-to-Pod connections, with an enforcing CNI and converged policies. Destination: web, app=policy-web, namespace lab-netpol. Source namespaces: clients (team=trusted), lab-netpol (team=lab), other (team=other). This extends the lab with fictional namespaces and TCP 443. DNS, Services/NAT, host traffic, other security controls and existing connections are excluded. Allowed by these policies does not prove that an application is listening or reachable. Default kindnet does not enforce NetworkPolicy.",
  "Simulation de nouvelles connexions directes entre Pods, avec CNI filtrant et politiques convergées. Destination : web, app=policy-web, namespace lab-netpol. Namespaces source : clients (team=trusted), lab-netpol (team=lab), other (team=other). Le lab est étendu avec des namespaces fictifs et TCP 443. DNS, Services/NAT, trafic hôte, autres contrôles de sécurité et connexions existantes sont exclus. Autorisé par ces politiques ne prouve pas qu’une application écoute ou soit joignable. Kindnet par défaut n’applique pas NetworkPolicy.",
);
export function policySequence(settings: PolicySettings): [SequenceScenario] {
  const result = evaluatePolicy(settings);
  const verdict = (allowed: boolean) =>
    allowed ? l("Allowed", "Autorisé") : l("Blocked", "Bloqué");
  const direction = (mode: PolicySettings["ingress"], match: boolean) =>
    mode === "open"
      ? l(
          "Not isolated: no policy selects this direction.",
          "Non isolé : aucune politique ne sélectionne cette direction.",
        )
      : mode === "deny"
        ? l(
            "Isolated, empty rule list: no permission from this policy.",
            "Isolé, liste de règles vide : aucune permission accordée par cette politique.",
          )
        : match
          ? l(
              "Isolated: the peer AND protocol/port match the rule.",
              "Isolé : le pair ET le protocole/port correspondent à la règle.",
            )
          : l(
              "Isolated: the peer AND protocol/port do not both match.",
              "Isolé : le pair ET le protocole/port ne correspondent pas tous deux.",
            );
  const ingressExplanation = settings.extraIngressAllow
    ? l(
        "The extra ingress policy adds ingress: [{}]. Its allow-all is unioned with the base policy, even ingress: []. It does not override source egress.",
        "La politique ingress supplémentaire ajoute ingress: [{}]. Son autorisation totale s’ajoute à la politique de base, même ingress: []. Elle ne contourne pas l’egress source.",
      )
    : direction(settings.ingress, result.ingressRuleMatches);
  const scene = (phase: number): SequenceLane[] => [
    {
      label: l(
        "Logical permission checks · not network appliances or packet-processing order",
        "Contrôles logiques de permission · pas des équipements ni un ordre de traitement réseau",
      ),
      nodes: [
        {
          label: l("Source · egress", "Source · egress"),
          detail: phase >= 1 ? verdict(result.egressAllowed) : l("To evaluate", "À évaluer"),
          ...(phase >= 1
            ? { tone: result.egressAllowed ? ("success" as const) : ("blocked" as const) }
            : {}),
        },
        {
          label: l("Destination · ingress", "Destination · ingress"),
          detail: phase >= 2 ? verdict(result.ingressAllowed) : l("To evaluate", "À évaluer"),
          ...(phase >= 2
            ? { tone: result.ingressAllowed ? ("success" as const) : ("blocked" as const) }
            : {}),
        },
        {
          label: l("Egress AND ingress", "Egress ET ingress"),
          detail:
            phase >= 3
              ? verdict(result.allowed)
              : l("Both permissions required", "Deux permissions nécessaires"),
          ...(phase >= 3
            ? { tone: result.allowed ? ("success" as const) : ("blocked" as const) }
            : {}),
        },
      ],
    },
  ];
  return [
    {
      label: l("Trace the decision", "Suivre la décision"),
      steps: [
        {
          title: l("Identify source and destination", "Identifier source et destination"),
          description: l(
            `New ${settings.connection} connection: ${settings.sourceNamespace}/${settings.trustedPod ? "trusted" : "untrusted"} → lab-netpol/web. The egress policy shown selects the source; the ingress policy selects web. Peer selectors describe the other end of the connection.`,
            `Nouvelle connexion ${settings.connection} : ${settings.sourceNamespace}/${settings.trustedPod ? "trusted" : "untrusted"} → lab-netpol/web. La politique egress affichée sélectionne la source ; la politique ingress sélectionne web. Les sélecteurs de pairs décrivent l’autre extrémité de la connexion.`,
          ),
          scene: scene(0),
        },
        {
          title: l("Evaluate source egress", "Évaluer l’egress source"),
          description: direction(settings.egress, result.egressRuleMatches),
          scene: scene(1),
        },
        {
          title: l("Evaluate destination ingress", "Évaluer l’ingress destination"),
          description: ingressExplanation,
          scene: scene(2),
        },
        {
          title: l("Combine permissions with AND", "Combiner les permissions avec ET"),
          description: result.allowed
            ? l(
                "Both directions permit this connection. Reply traffic for an allowed connection is implicitly permitted; it does not require a mirror rule. DNS and application health are separate checks.",
                "Les deux directions autorisent cette connexion. Son trafic de réponse est implicitement permis, sans règle miroir nécessaire. DNS et santé applicative restent des vérifications séparées.",
              )
            : l(
                "At least one direction lacks permission. An ingress allow cannot bypass blocked source egress, nor vice versa. There is no ordered deny rule: permissions across selecting policies are additive within each direction.",
                "Au moins une direction manque de permission. Une autorisation ingress ne contourne pas un egress source bloqué, et inversement. Il n’y a pas de règle deny ordonnée : les permissions des politiques sélectionnantes s’additionnent dans chaque direction.",
              ),
          scene: scene(3),
        },
      ],
    },
  ];
}
