import { useId } from "react";
import { ArrowDown } from "lucide-react";
import { useLang } from "@/lib/i18n";

const pods = [
  { title: { en: "Before deletion", fr: "Avant suppression" }, uid: "A" },
  { title: { en: "After recreation", fr: "Après recréation" }, uid: "B" },
];

export function StatefulSetIdentityDiagram() {
  const { tr } = useLang();
  const captionId = useId();

  return (
    <figure
      aria-labelledby={captionId}
      className="@container my-8 rounded-2xl border border-border bg-surface/70 p-4 sm:p-5"
    >
      <figcaption id={captionId} className="font-semibold text-foreground">
        {tr({ en: "Same ordinal, new Pod UID", fr: "Même ordinal, nouvel UID de Pod" })}
      </figcaption>
      <p className="mt-2 text-sm text-muted-foreground">
        {tr({
          en: "StatefulSet notebook keeps slot 0 in namespace lab-stateful.",
          fr: "Le StatefulSet notebook conserve l’emplacement d’ordinal 0 dans le namespace lab-stateful.",
        })}
      </p>
      <ol className="mt-4 grid list-none gap-3 p-0 @min-[28rem]:grid-cols-2">
        {pods.map(({ title, uid }) => (
          <li key={uid} className="min-w-0 rounded-xl border border-border bg-surface-2 p-3">
            <p className="text-sm font-semibold">{tr(title)}</p>
            <p className="mt-2 font-mono text-sm">Pod notebook-0</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <code>metadata.uid</code> · {uid}
            </p>
          </li>
        ))}
      </ol>
      <p className="my-3 flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowDown aria-hidden="true" className="size-4 shrink-0" />
        {tr({
          en: "Each Pod references the same PVC in turn",
          fr: "Chaque Pod référence à son tour le même PVC",
        })}
      </p>
      <div className="rounded-xl border border-primary/40 bg-primary/5 p-3">
        <p className="font-mono text-sm [overflow-wrap:anywhere]">PVC data-notebook-0</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {tr({
            en: "Claim template data + Pod name notebook-0 → data-notebook-0",
            fr: "Template de PVC data + nom du Pod notebook-0 → data-notebook-0",
          })}
        </p>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {tr({
          en: "A and B stand for distinct Pod UIDs. Once the replacement mounts the retained volume at /data, it can read the original identity.txt. This assumes the claim remains bound and the backing storage is still accessible.",
          fr: "A et B représentent deux UID de Pod distincts. Une fois le volume conservé monté sur /data, le nouveau Pod peut lire le fichier identity.txt d’origine. Cela suppose que le PVC reste lié à son PV et que le stockage reste accessible.",
        })}
      </p>
    </figure>
  );
}
