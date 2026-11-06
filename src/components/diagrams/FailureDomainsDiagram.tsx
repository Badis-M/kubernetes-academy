import { useId } from "react";
import { useLang } from "@/lib/i18n";

const topologies = {
  ha: [{ name: "k8s-ops-lab", workers: ["worker", "worker2"] }],
  fleet: [
    { name: "fleet-a", workers: [] },
    { name: "fleet-b", workers: [] },
  ],
};

export function FailureDomainsDiagram({ topology }: { topology: keyof typeof topologies }) {
  const { tr } = useLang();
  const captionId = useId();
  const clusters = topologies[topology];

  return (
    <figure
      aria-labelledby={captionId}
      className="@container my-8 rounded-2xl border border-border bg-surface/70 p-4 sm:p-5"
    >
      <figcaption id={captionId} className="font-semibold text-foreground">
        {tr({ en: "Failure domains in the kind lab", fr: "Domaines de panne du lab kind" })}
      </figcaption>
      <div className="mt-4 rounded-xl border border-amber-500/60 p-3">
        <p className="font-semibold">
          {tr({ en: "Host · shared Docker runtime", fr: "Hôte · environnement Docker partagé" })}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {tr({
            en: "Losing this host takes all the kind nodes below offline.",
            fr: "La perte de cet hôte met hors service tous les nœuds kind ci-dessous.",
          })}
        </p>
        <ul className="mt-3 grid list-none gap-3 p-0 @min-[30rem]:grid-cols-2">
          {clusters.map(({ name, workers }) => (
            <li
              key={name}
              className={`min-w-0 rounded-lg border border-primary/50 bg-surface-2 p-3 ${topology === "ha" ? "col-span-full" : ""}`}
            >
              <p className="text-sm font-semibold">
                Cluster <code>{name}</code>
              </p>
              <ul className="mt-2 grid list-none gap-2 p-0">
                {["control-plane", ...workers].map((role) => (
                  <li
                    key={role}
                    className="min-w-0 rounded-md border border-border p-2 text-sm [overflow-wrap:anywhere]"
                  >
                    {tr({ en: "Node", fr: "Nœud" })}{" "}
                    <code>
                      {name}-{role}
                    </code>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {topology === "ha"
          ? tr({
              en: "Each node is a separate kind container. Spreading Pods across workers can limit the impact of a worker outage if a healthy replica and its dependencies remain available.",
              fr: "Chaque nœud est un conteneur kind distinct. Répartir les Pods entre les workers peut limiter l’impact de la panne d’un worker si un réplica sain et ses dépendances restent disponibles.",
            })
          : tr({
              en: "Each cluster has its own API and a single control-plane node. An outage confined to one cluster can leave the other running. Both still depend on the same host.",
              fr: "Chaque cluster possède sa propre API et un seul nœud control-plane. Une panne confinée à un cluster peut laisser l’autre fonctionner. Les deux dépendent du même hôte.",
            })}
      </p>
    </figure>
  );
}
