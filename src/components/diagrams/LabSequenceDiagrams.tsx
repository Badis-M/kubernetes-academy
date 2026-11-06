import { StepSequenceDiagram } from "./StepSequenceDiagram";

const fleetStart = {
  title: { en: "Apply to A", fr: "Appliquer sur A" },
  description: {
    en: "Apply the reviewed manifest to cluster A. Cluster B still runs its previous revision.",
    fr: "Appliquez le manifest examiné au cluster A. Le cluster B conserve sa révision précédente.",
  },
};

export function FleetPromotionDiagram() {
  return (
    <StepSequenceDiagram
      title={{ en: "When is it safe to promote to B?", fr: "Quand peut-on promouvoir vers B ?" }}
      scenarios={[
        {
          label: { en: "A passes", fr: "A est validé" },
          steps: [
            fleetStart,
            {
              title: { en: "Check A", fr: "Vérifier A" },
              description: {
                en: "The rollout completes and the Service has a ready endpoint. These are the minimum checks for this lab.",
                fr: "Le rollout se termine et le Service a un endpoint prêt. Ce sont les contrôles minimaux de ce lab.",
              },
            },
            {
              title: { en: "Promote to B", fr: "Promouvoir vers B" },
              description: {
                en: "Recheck A just before applying the same manifest to B, then observe B independently.",
                fr: "Vérifiez de nouveau A juste avant d’appliquer le même manifest sur B, puis observez B séparément.",
              },
            },
          ],
        },
        {
          label: { en: "A times out", fr: "A dépasse le délai" },
          steps: [
            fleetStart,
            {
              title: { en: "A fails the check", fr: "A échoue au contrôle" },
              description: {
                en: "The rollout times out. Inspect the Deployment and its Pods before retrying.",
                fr: "Le rollout dépasse son délai. Examinez le Deployment et ses Pods avant de réessayer.",
              },
            },
            {
              title: { en: "Hold B", fr: "Maintenir B en l’état" },
              description: {
                en: "The gate stops the apply on B. Fix or revert A before attempting another promotion.",
                fr: "Le contrôle bloque l’application sur B. Corrigez A ou revenez en arrière avant une nouvelle tentative.",
              },
            },
          ],
        },
      ]}
    />
  );
}

export function EvictionBudgetDiagram() {
  return (
    <StepSequenceDiagram
      title={{
        en: "Will the eviction API allow this request?",
        fr: "L’API d’éviction acceptera-t-elle la demande ?",
      }}
      scenarios={[
        {
          label: { en: "Three healthy Pods", fr: "Trois Pods sains" },
          steps: [
            {
              title: { en: "One disruption allowed", fr: "Une perturbation autorisée" },
              description: {
                en: "With three healthy replicas and minAvailable: 2, the lab budget has one unit of headroom.",
                fr: "Avec trois réplicas sains et minAvailable: 2, le budget du lab laisse une perturbation possible.",
              },
            },
            {
              title: { en: "Eviction accepted", fr: "Éviction acceptée" },
              description: {
                en: "The API can accept one eviction. Check actual deletion before claiming that it completed.",
                fr: "L’API peut accepter une éviction. Vérifiez la suppression effective avant de conclure.",
              },
            },
            {
              title: { en: "Wait for recovery", fr: "Attendre la reprise" },
              description: {
                en: "The ReplicaSet replaces the Pod. Verify that disruptionsAllowed returns to 1 before asking for another eviction.",
                fr: "Le ReplicaSet remplace le Pod. Vérifiez que disruptionsAllowed revient à 1 avant de demander une autre éviction.",
              },
            },
          ],
        },
        {
          label: { en: "Two healthy Pods", fr: "Deux Pods sains" },
          steps: [
            {
              title: { en: "No disruption allowed", fr: "Aucune perturbation autorisée" },
              description: {
                en: "With two healthy replicas and minAvailable: 2, the lab budget has no headroom.",
                fr: "Avec deux réplicas sains et minAvailable: 2, le budget du lab ne laisse aucune marge.",
              },
            },
            {
              title: { en: "HTTP 429", fr: "HTTP 429" },
              description: {
                en: "The eviction request would violate the budget, so the API rejects it. Both Pods remain.",
                fr: "L’éviction enfreindrait le budget. L’API refuse la demande et les deux Pods restent en place.",
              },
            },
            {
              title: { en: "Restore headroom", fr: "Rétablir une marge" },
              description: {
                en: "Add capacity and wait for the third replica to become healthy before retrying the eviction.",
                fr: "Ajoutez de la capacité et attendez que le troisième réplica soit sain avant de retenter l’éviction.",
              },
            },
          ],
        },
      ]}
    />
  );
}
