import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/academy/CodeBlock";
import { useLang } from "@/lib/i18n";
import { StepSequenceDiagram } from "./StepSequenceDiagram";
import {
  policyScope,
  policySequence,
  policyTitle,
} from "@/content/diagrams/network-policy-sequence";
import {
  evaluatePolicy,
  initialPolicySettings,
  ingressPolicyYaml,
  egressPolicyYaml,
  extraIngressYaml,
  type PolicySettings,
} from "@/content/diagrams/network-policy-model";

export function NetworkPolicyDiagram() {
  const { lang, tr } = useLang();
  const fr = lang === "fr";
  const headingId = useId();
  const [settings, setSettings] = useState<PolicySettings>(initialPolicySettings);
  const [resetCount, setResetCount] = useState(0);
  const result = evaluatePolicy(settings);
  const change = <K extends keyof PolicySettings>(key: K, value: PolicySettings[K]) =>
    setSettings((current) => ({ ...current, [key]: value }));
  const modeOptions = [
    { value: "open", label: fr ? "Sans politique de base" : "No base policy" },
    { value: "deny", label: fr ? "Isolé · liste vide []" : "Isolated · empty list []" },
    { value: "rules", label: fr ? "Isolé · règle ciblée" : "Isolated · targeted rule" },
  ];
  const select = (
    key: "sourceNamespace" | "connection" | "ingress" | "egress" | "peers",
    label: string,
    options: { value: string; label: string }[],
  ) => (
    <label className="flex min-w-0 flex-col gap-2 text-sm">
      <span id={`${headingId}-${key}`}>{label}</span>
      <select
        className="min-h-11 w-full min-w-0 rounded-lg border border-border bg-surface-2 px-2 text-foreground focus-visible:outline focus-visible:outline-primary"
        aria-labelledby={`${headingId}-${key}`}
        value={settings[key]}
        onChange={(event) => change(key, event.target.value as PolicySettings[typeof key])}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
  const match = (value: boolean) => (value ? (fr ? "Oui" : "Yes") : fr ? "Non" : "No");
  const and = fr ? "ET" : "AND";
  const or = fr ? "OU" : "OR";
  const expression =
    settings.peers === "and"
      ? `(team=trusted ${and} role=trusted-client)`
      : settings.peers === "or"
        ? `(team=trusted ${or} (namespace=lab-netpol ${and} role=trusted-client))`
        : `(namespace=lab-netpol ${and} role=trusted-client)`;
  return (
    <section aria-labelledby={headingId} className="my-8" data-network-policy="">
      <h3 id={headingId} className="text-lg font-semibold">
        {fr ? "Testez les permissions" : "Try the permissions"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {fr
          ? "Changez un paramètre, prédisez le résultat, puis suivez la décision. Les réglages et le YAML sont une extension pédagogique du lab ; aucune commande n’est exécutée."
          : "Change a setting, predict the result, then trace the decision. These settings and YAML extend the lab for teaching; no commands are executed."}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {select("sourceNamespace", fr ? "Namespace source" : "Source namespace", [
          { value: "clients", label: "clients · team=trusted" },
          { value: "lab-netpol", label: "lab-netpol · team=lab" },
          { value: "other", label: "other · team=other" },
        ])}
        <label className="flex min-w-0 flex-col gap-2 text-sm">
          <span id={`${headingId}-source-label`}>
            {fr ? "Label du Pod source" : "Source Pod label"}
          </span>
          <select
            className="min-h-11 w-full min-w-0 rounded-lg border border-border bg-surface-2 px-2"
            aria-labelledby={`${headingId}-source-label`}
            value={settings.trustedPod ? "trusted" : "untrusted"}
            onChange={(event) => change("trustedPod", event.target.value === "trusted")}
          >
            <option value="trusted">role=trusted-client</option>
            <option value="untrusted">role=untrusted-client</option>
          </select>
        </label>
        {select(
          "connection",
          fr ? "Connexion vers web" : "Connection to web",
          ["TCP 80", "TCP 443", "UDP 80"].map((value) => ({ value, label: value })),
        )}
        {select("peers", fr ? "Pairs de la règle ingress" : "Ingress rule peers", [
          { value: "and", label: fr ? "Même pair · ET" : "Same peer · AND" },
          { value: "or", label: fr ? "Deux pairs · OU" : "Two peers · OR" },
          { value: "pod", label: "podSelector" },
        ])}
        {select("egress", fr ? "Egress source" : "Source egress", modeOptions)}
        {select(
          "ingress",
          fr ? "Ingress destination (base)" : "Destination ingress (base)",
          modeOptions,
        )}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {fr
          ? "Règle egress ciblée : namespace lab-netpol ET app=policy-web ET TCP 80. La politique egress suit le namespace et le label de la source choisie. Règle ingress ciblée : pairs ci-dessus ET (TCP 80 OU TCP 443)."
          : "Targeted egress rule: namespace lab-netpol AND app=policy-web AND TCP 80. The egress policy follows the selected source namespace and label. Targeted ingress rule: peers above AND (TCP 80 OR TCP 443)."}
      </p>
      <label className="mt-3 flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="size-5 shrink-0 accent-primary"
          checked={settings.extraIngressAllow}
          onChange={(event) => change("extraIngressAllow", event.target.checked)}
        />
        <span>
          {fr
            ? "Ajouter une autre politique ingress : tout autoriser"
            : "Add another ingress policy: allow all"}
        </span>
      </label>
      <div
        role="status"
        aria-label={fr ? "Verdict du modèle" : "Model verdict"}
        className={`mt-3 rounded-xl border p-3 text-sm ${result.allowed ? "border-emerald-500/60 bg-emerald-500/10" : "border-amber-500/60 bg-amber-500/10"}`}
      >
        <p className="font-semibold">
          {fr ? "Verdict du modèle : " : "Model verdict: "}
          {result.allowed
            ? fr
              ? "autorisé par ces politiques"
              : "allowed by these policies"
            : fr
              ? "bloqué par ces politiques"
              : "blocked by these policies"}
        </p>
        <p className="mt-1">
          Egress: {match(result.egressAllowed)} {and} Ingress: {match(result.ingressAllowed)}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-3 min-h-11 h-auto whitespace-normal"
        onClick={() => {
          setSettings({ ...initialPolicySettings });
          setResetCount((count) => count + 1);
        }}
      >
        {fr ? "Réinitialiser les règles" : "Reset rules"}
      </Button>
      <details className="mt-4 rounded-xl border border-border p-3 text-sm">
        <summary className="cursor-pointer font-medium">
          {fr ? "Voir la logique ET/OU et le YAML" : "Show AND/OR logic and YAML"}
        </summary>
        <p className="mt-3 [overflow-wrap:anywhere]">
          {fr ? "Expression de la règle ingress ciblée" : "Targeted ingress rule expression"} :{" "}
          {expression} {and} (TCP 80 {or} TCP 443)
        </p>
        <p className="mt-2">
          {fr ? "Correspondance des pairs" : "Peer match"}: {match(result.peerMatches)} ·{" "}
          {fr ? "Protocole/port" : "Protocol/port"}: {match(result.ingressPortMatches)}
        </p>
        <p className="mt-2 text-muted-foreground">
          {fr
            ? "Cette expression s’applique seulement au mode « règle ciblée ». Un podSelector seul reste dans le namespace de la politique, lab-netpol : le mode OU n’autorise donc pas un Pod trusted dans n’importe quel namespace. Les éléments de ports sont des alternatives ; il faut toujours aussi un pair correspondant."
            : "This expression applies only to targeted-rule mode. A podSelector alone stays in the policy namespace, lab-netpol: OR mode therefore does not allow a trusted Pod in every namespace. Port entries are alternatives; a matching peer is still required."}
        </p>
        <CodeBlock
          lang="yaml"
          kind="snippet"
          title="Ingress · lab-netpol/web"
          code={ingressPolicyYaml(settings)}
        />
        <CodeBlock
          lang="yaml"
          kind="snippet"
          title={`Egress · ${settings.sourceNamespace}`}
          code={egressPolicyYaml(settings)}
        />
        {settings.extraIngressAllow && (
          <CodeBlock
            lang="yaml"
            kind="snippet"
            title={fr ? "Ingress · politique supplémentaire" : "Ingress · additional policy"}
            code={extraIngressYaml}
          />
        )}
        <p className="text-muted-foreground">
          {fr
            ? "ingress: [] n’accorde rien ; ingress: [{}] accorde tout. Les règles et politiques sélectionnantes s’additionnent par OU dans chaque direction, sans priorité deny. Le verdict final combine egress et ingress par ET."
            : "ingress: [] grants nothing; ingress: [{}] grants everything. Rules and selecting policies are unioned with OR within each direction, with no deny priority. The final verdict combines egress and ingress with AND."}
        </p>
      </details>
      <StepSequenceDiagram
        key={`${JSON.stringify(settings)}-${resetCount}`}
        title={policyTitle}
        scope={policyScope}
        scenarios={policySequence(settings)}
      />
    </section>
  );
}
