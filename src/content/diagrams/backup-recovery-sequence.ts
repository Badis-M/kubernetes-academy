import type { L } from "../types";
import type { SequenceLane, SequenceScenario } from "@/components/diagrams/StepSequenceDiagram";

const l = (en: string, fr: string): L => ({ en, fr });
const absent = l("Not created yet", "Pas encore créé");
const baseline = l("2 orders · total 30", "2 commandes · total 30");
const later = l("3 orders · total 55", "3 commandes · total 55");
const captured = l("orders.tar · 2 orders · total 30", "orders.tar · 2 commandes · total 30");

function scene(source: L, archive: L, target: L): SequenceLane[] {
  return [
    {
      label: l("State at the selected step", "État à l’étape sélectionnée"),
      nodes: [
        { label: l("Source PVC", "PVC source"), detail: source },
        { label: l("Snapshot · file archive", "Snapshot · archive de fichier"), detail: archive },
        { label: l("Restore PVC", "PVC de restauration"), detail: target },
      ],
    },
  ];
}

const scenario = {
  label: l("File recovery drill", "Exercice de restauration de fichier"),
  steps: [
    {
      title: l("Freeze source writes", "Suspendre les écritures source"),
      description: l(
        "The lab seeds /data/orders.csv in lab-backup-source with two orders totaling 30. No background process writes to the file during capture.",
        "Le lab initialise /data/orders.csv dans lab-backup-source avec deux commandes totalisant 30. Aucun processus n’écrit dans le fichier pendant la capture.",
      ),
      scene: scene(baseline, absent, absent),
    },
    {
      title: l("Capture the recovery point", "Capturer le point de reprise"),
      description: l(
        "The host saves orders.tar and the checksums of the archive and source file. The archive captures the two orders present at this point.",
        "L’hôte enregistre orders.tar et les sommes de contrôle de l’archive et du fichier source. L’archive contient les deux commandes présentes à cet instant.",
      ),
      scene: scene(baseline, captured, absent),
    },
    {
      title: l("Write A003 after capture", "Écrire A003 après la capture"),
      description: l(
        "Order A003 adds 25 to the source. The source now totals 55. The archive still contains the earlier state totaling 30.",
        "La commande A003 ajoute 25 à la source. Le total source passe à 55. L’archive conserve l’état antérieur, soit 30.",
      ),
      scene: scene(later, captured, absent),
    },
    {
      title: l("Check the archive before restoring", "Contrôler l’archive avant restauration"),
      description: l(
        "The target has a separate PVC in lab-backup-restore. The restore script checks the archive checksum and its contents before contacting the target. It stops if either check fails or if the target file already exists.",
        "La cible dispose d’un PVC distinct dans lab-backup-restore. Le script vérifie la somme de contrôle et le contenu de l’archive avant de contacter la cible. Il s’arrête si un contrôle échoue ou si le fichier cible existe déjà.",
      ),
      scene: scene(later, captured, l("PVC ready · file absent", "PVC prêt · fichier absent")),
    },
    {
      title: l("Restore the captured file", "Restaurer le fichier capturé"),
      description: l(
        "The script extracts orders.csv into the target and verifies its checksum. The source keeps all three orders.",
        "Le script extrait orders.csv dans la cible et vérifie sa somme de contrôle. La source conserve ses trois commandes.",
      ),
      scene: scene(later, captured, baseline),
    },
    {
      title: l("Verify what was recovered", "Vérifier les données récupérées"),
      description: l(
        "The functional check counts two orders totaling 30 in the target. A003 was written after capture, so it is absent from this restore. The elapsed time since capture illustrates possible data loss. The RPO defines how much loss is acceptable, measured in time.",
        "Le contrôle fonctionnel compte deux commandes pour un total de 30 dans la cible. A003 a été écrite après la capture et manque donc à la restauration. Le temps écoulé depuis la capture illustre la perte possible. Le RPO fixe la perte acceptable, exprimée en temps.",
      ),
      scene: scene(
        later,
        captured,
        l("Verified · 2 orders · total 30", "Vérifié · 2 commandes · total 30"),
      ),
    },
  ],
} satisfies SequenceScenario;

export const backupRecoverySequence = {
  title: l(
    "Backup · source, snapshot and restore",
    "Sauvegarde · source, snapshot et restauration",
  ),
  scope: l(
    "The snapshot in this simulation is a local tar archive of one application file. CSI volume snapshots and etcd backups use separate mechanisms. The two PVCs in this lab still share the same host failure domain.",
    "Dans cette simulation, le snapshot est une archive tar locale d’un fichier applicatif. Les snapshots de volume CSI et les sauvegardes etcd reposent sur des mécanismes distincts. Les deux PVC du lab partagent le même domaine de panne de l’hôte.",
  ),
  scenarios: [scenario] as const,
};
