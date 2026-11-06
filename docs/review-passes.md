# Grille des cinq passes — mise à jour du 2026-11-06

Relecture terminée sur le checkout local `ffec215` avec ses changements non commités, antérieurs et présents. **60/60 chapitres relus en FR et EN**, quiz, indices, solutions et labs compris. Les cinq passes du 5 novembre sont consignées. Le lot R16–R23 est corrigé et vérifié le 6 novembre ; la validation réelle des exercices reste distincte et non effectuée. Les schémas Probes, Gateway, Scheduling, NetworkPolicies, Init containers et Sidecars, StatefulSets, Architecture de l’API et Sauvegarde et reprise ont ensuite été ajoutés et vérifiés dans les deux langues (suivis ci-dessous).

| Passe | Résultat | Limite explicite |
| --- | --- | --- |
| 1 · Technique et labs | Tous les chapitres et leurs fichiers pédagogiques relus ; Gateway, DaemonSets, Scheduling et Argo CD corrigés et simulés. | R16–R21 corrigés le 6 novembre ; aucun cluster réel. |
| 2 · Éditorial FR/EN | Lecture intégrale des 60 chapitres, 162 questions, 120 indices et 147 blocs de solution ; pages hors cours relues. | Difficulté des distracteurs perfectible ; métadonnées R22 corrigées. |
| 3 · Schémas | Vingt-sept variantes de schémas disponibles, dont les timelines de snapshot etcd et CSI. | Les modèles illustrent les contrats des labs. Voir les constats de la dernière passe. |
| 4 · Rendu et interactions | 264 vues automatisées, inspection manuelle des planches de captures et détails ciblés FR/EN mobile/bureau ; débordements corrigés. | Échantillonnage des zones visuelles, pas lecture pixel par pixel ; 500 non provoquée ; pas d’audit lecteur d’écran complet. |
| 5 · Régressions | La dernière passe confirme 208 tests applicatifs, 62 tests E2E, TypeScript, lint, build et contrôles hors ligne des labs. | Dette lint/bundle héritée ; tests simulés distincts du runtime Kubernetes. |

**Légende :** « Relu » = lecture manuelle des sources dans les deux langues, y compris commandes et fichiers affichés. « Contrôlé » = balayage navigateur et inspection des captures décrits dans le [journal](manual-review-log.md), sans garantie sur chaque pixel. Un constat ouvert n’annule pas la lecture. « Lecture » dans la colonne lab ne signifie jamais exécution réelle. Les scripts de navigation n’ont pas validé automatiquement toutes les bonnes réponses : celles-ci ont été confrontées manuellement aux cours.

| Page ou chapitre | FR | EN | Quiz / indices / solutions | Lab et fichiers | Mobile FR/EN | Bureau FR/EN | Décision / constat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Relu | Relu | S/O | S/O | Contrôlé | Contrôlé | Architecture et contenu partagés |
| `/academy` | Relu | Relu | S/O | S/O | Contrôlé | Contrôlé | Niveau 0 et 60 cours ; disponibilité précisée |
| `/lab` | Relu | Relu | Indices/solutions relus | Lecture, 10 étapes | Contrôlé | Contrôlé | Port-forward EN précisé ; R19 |
| `/source-files` | Relu | Relu | S/O | Lecture, 6 fichiers | Contrôlé | Contrôlé | Notices comparées aux vrais fichiers |
| `/k8s-basics` | S/O | S/O | S/O | S/O | S/O | S/O | 301 vers architecture vérifiée |
| `/prerequisites` | S/O | S/O | S/O | S/O | S/O | S/O | 301 vers setup-kind vérifiée |
| `/review-missing` | Relu | Relu | S/O | S/O | Contrôlé | Contrôlé | 404 générale |
| `/learn/review-missing` | Relu | Relu | S/O | S/O | Contrôlé | Contrôlé | 404 chapitre |
| Écran d’erreur runtime | Source relue | Source relue | S/O | S/O | Non provoqué | Non provoqué | Limite, distincte des 404 |
| `/learn/why-kubernetes` | Relu | Relu | Relus · 0 questions, 2 indices, 4 blocs solution | Lecture · 6 blocs Bash | Contrôlé | Contrôlé | VM/conteneur et SIGTERM précisés |
| `/learn/architecture` | Relu | Relu | Relus · 0 questions, 2 indices, 2 blocs solution | Lecture · 12 blocs Bash | Contrôlé | Contrôlé | Events et disponibilité API précisés |
| `/learn/reconciliation` | Relu | Relu | Relus · 0 questions, 2 indices, 2 blocs solution | Lecture · 11 blocs Bash | Contrôlé | Contrôlé | Modèle de contrôle précisé |
| `/learn/setup-kind` | Relu | Relu | Relus · 0 questions, 2 indices, 5 blocs solution | Lecture · 13 blocs Bash | Contrôlé | Contrôlé | R10 relu ; R19 corrigé |
| `/learn/namespaces-contexts` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 9 blocs Bash | Contrôlé | Contrôlé | R16 corrigé |
| `/learn/pods` | Relu | Relu | Relus · 0 questions, 2 indices, 3 blocs solution | Lecture · 13 blocs Bash | Contrôlé | Contrôlé | Phases et réparation précisées |
| `/learn/deployments` | Relu | Relu | Relus · 0 questions, 2 indices, 6 blocs solution | Lecture · 15 blocs Bash | Contrôlé | Contrôlé | R13/R15 relus ; R17 corrigé ; rollout et champs mobiles corrigés |
| `/learn/services` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/labels-selectors` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | R16 corrigé |
| `/learn/configmaps-secrets` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | R16 corrigé |
| `/learn/kubectl-troubleshooting` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | R16 corrigé |
| `/learn/rollout-strategies` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 9 blocs Bash | Contrôlé | Contrôlé | FR hors terminaison corrigé |
| `/learn/rollbacks` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 7 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/resources` | Relu | Relu | Relus · 3 questions, 2 indices, 3 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/probes` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 7 blocs Bash | Contrôlé | Contrôlé | Schéma livré · startup/readiness/liveness · 3 branches FR/EN |
| `/learn/init-sidecars` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 6 blocs Bash | Contrôlé | Contrôlé | Timeline livrée · 5 scénarios, 24 étapes · startup, échecs et arrêt FR/EN |
| `/learn/storage` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/statefulsets` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | R19 corrigé. Schéma livré et vérifié en FR/EN à 320 et 1 280 px. |
| `/learn/daemonsets` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 12 blocs Bash | Contrôlé | Contrôlé | Garde UID/valeur/resourceVersion corrigée et simulée |
| `/learn/jobs` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/dns` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/helm-basics` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 7 blocs Bash | Contrôlé | Contrôlé | R19 corrigé |
| `/learn/ingress-gateway` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 11 blocs Bash | Contrôlé | Contrôlé | Garde corrigée ; schéma livré · configuration/trafic · 200/404/503 |
| `/learn/network-policies` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 10 blocs Bash | Contrôlé | Contrôlé | Schéma livré · ingress/egress, ET/OU, union additive et portée des pairs |
| `/learn/rbac` | Relu | Relu | Relus · 3 questions, 2 indices, 3 blocs solution | Lecture · 6 blocs Bash | Contrôlé | Contrôlé | Graphe des permissions livré et vérifié en FR/EN. |
| `/learn/scheduling` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 11 blocs Bash | Contrôlé | Contrôlé | Garde corrigée ; schéma livré · filtre/score/binding ou Pending |
| `/learn/troubleshooting-2` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 14 blocs Bash | Contrôlé | Contrôlé | R20 corrigé |
| `/learn/helm-charts` | Relu | Relu | Relus · 3 questions, 2 indices, 3 blocs solution | Lecture · 10 blocs Bash | Contrôlé | Contrôlé | R19 corrigé |
| `/learn/helm-releases` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | R19 corrigé |
| `/learn/kustomize` | Relu | Relu | Relus · 3 questions, 2 indices, 5 blocs solution | Lecture · 9 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/gitops` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 12 blocs Bash | Contrôlé | Contrôlé | Création/nettoyage Argo gardés et simulés |
| `/learn/hpa` | Relu | Relu | Relus · 3 questions, 2 indices, 1 blocs solution | Lecture · 7 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/vertical-cluster-scaling` | Relu | Relu | Relus · 3 questions, 2 indices, 1 blocs solution | Lecture · 7 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/pdb` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | Séquence interactive relue et rejouée |
| `/learn/ha` | Relu | Relu | Relus · 3 questions, 2 indices, 1 blocs solution | Lecture · 5 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus · Schéma hôte, cluster et nœud contrôlé en FR/EN. |
| `/learn/advanced-scheduling` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | R11 relu et simulé |
| `/learn/security-hardening` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 6 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/pod-security` | Relu | Relu | Relus · 3 questions, 2 indices, 3 blocs solution | Lecture · 6 blocs Bash | Contrôlé | Contrôlé | R19 corrigé |
| `/learn/rbac-advanced` | Relu | Relu | Relus · 3 questions, 2 indices, 4 blocs solution | Lecture · 14 blocs Bash | Contrôlé | Contrôlé | R11 relu et simulé. Graphes des permissions et de l’agrégation vérifiés en FR/EN. |
| `/learn/cni-internals` | Relu | Relu | Relus · 3 questions, 2 indices, 5 blocs solution | Lecture · 9 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/observability` | Relu | Relu | Relus · 3 questions, 2 indices, 4 blocs solution | Lecture · 6 blocs Bash | Contrôlé | Contrôlé | R18 corrigé. Graphe des trois signaux vérifié en FR/EN à 320 et 1 280 px. |
| `/learn/incidents` | Relu | Relu | Relus · 3 questions, 2 indices, 5 blocs solution | Lecture · 12 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/backup-dr` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 13 blocs Bash | Contrôlé | Contrôlé | Timeline livrée et contrôlée en FR/EN à 320 et 1 280 px. |
| `/learn/api-architecture` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 6 blocs Bash | Contrôlé | Contrôlé | Timeline 409 et relecture livrée. Six étapes vérifiées en FR/EN à 320 et 1 280 px. |
| `/learn/controllers-internals` | Relu | Relu | Relus · 3 questions, 2 indices, 1 blocs solution | Lecture · 6 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/crds` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 7 blocs Bash | Contrôlé | Contrôlé | R21 corrigé |
| `/learn/custom-controllers` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | R19/R21 corrigés |
| `/learn/operators` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | R19/R21 corrigés |
| `/learn/kubebuilder-operator` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 7 blocs Bash | Contrôlé | Contrôlé | R19/R21 corrigés |
| `/learn/admission-webhooks` | Relu | Relu | Relus · 3 questions, 2 indices, 6 blocs solution | Lecture · 11 blocs Bash | Contrôlé | Contrôlé | R12/R14 relus ; R20 corrigé |
| `/learn/api-extension` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | R12 relu et simulé |
| `/learn/scheduler-internals` | Relu | Relu | Relus · 3 questions, 2 indices, 6 blocs solution | Lecture · 8 blocs Bash | Contrôlé | Contrôlé | R20 corrigé ; schéma partagé disponible dans le chapitre lié Scheduling, sans duplication |
| `/learn/etcd` | Relu | Relu | Relus · 3 questions, 2 indices, 3 blocs solution | Lecture · 5 blocs Bash | Contrôlé | Contrôlé | Timeline snapshot de l’état API vérifiée en FR/EN. |
| `/learn/cri` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 7 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/cni-advanced` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 6 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/csi` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 7 blocs Bash | Contrôlé | Contrôlé | Timeline snapshot de volume vérifiée en FR/EN. |
| `/learn/control-plane-scale` | Relu | Relu | Relus · 3 questions, 2 indices, 2 blocs solution | Lecture · 9 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |
| `/learn/multi-cluster` | Relu | Relu | Relus · 3 questions, 2 indices, 6 blocs solution | Lecture · 12 blocs Bash | Contrôlé | Contrôlé | R9/R10 relus ; séquence rejouée · Schéma hôte, cluster et nœud contrôlé en FR/EN. |
| `/learn/failure-scenarios` | Relu | Relu | Relus · 3 questions, 2 indices, 6 blocs solution | Lecture · 11 blocs Bash | Contrôlé | Contrôlé | R20 corrigé |
| `/learn/platform-engineering` | Relu | Relu | Relus · 3 questions, 2 indices, 1 blocs solution | Lecture · 5 blocs Bash | Contrôlé | Contrôlé | Voir le journal : contrat et décision relus |

## Clôture du lot R16–R23 — 2026-11-06

| ID | Statut | Résultat vérifié |
| --- | --- | --- |
| R16 · P1 | Corrigé | Les quatre préparations débutantes s’arrêtent après échec ; UID publié seulement après création réussie ; retraits séparés et gardés, préparation partielle testée. |
| R17 · P1 | Corrigé | Le nettoyage final de Deployments exige le reçu de reprise/suppression du Deployment, le namespace original et l’absence du Deployment. |
| R18 · P1 | Corrigé | Projet Compose unique, état local, démon et jeton de ressources vérifiés ; collision/ressource étrangère/démarrage partiel refusent une reprise aveugle ; aucun prune. |
| R19 · P2 | Corrigé | Téléchargements/checksum/install, StatefulSets, Helm, Pod Security, génération/Ready des contrôleurs et venv/pip/Uvicorn chaînés ; échecs pédagogiques conservés séparément. |
| R20 · P2 | Corrigé | Panne, observation et reprise réparties en blocs distincts dans les quatre chapitres ; arrêt explicite avant récupération. |
| R21 · P2 | Corrigé | CRD créée sans adoption puis réutilisée avec preuve UID/spec/source ; preuve commune aux quatre cours ; suppression globale retirée, README du projet aligné. |
| R22 · P3 | Corrigé | `?lang=fr` et `?lang=en` commandent le contenu et les métadonnées SSR ; navigation, redirections et ancres conservent la langue ; chemins existants préservés. |
| R23 · P3 | Corrigé | Échecs de lecture/écriture et données corrompues signalés ; langue et progression utilisables en mémoire ; clés historiques conservées. |

Les lectures intégrales des 60 chapitres/162 questions datent du 5 novembre. Le 6 novembre porte sur les corrections, les vingt chapitres touchés, le lab guidé et les composants/pages partagés : **24 pages × FR/EN × 320/1 280 px = 96 vues**, plus quatre vues du stockage indisponible, captures de détails et 22 E2E. Les autres lignes de rendu conservent la preuve du 5 novembre ; elles ne sont pas présentées comme rejouées intégralement aujourd’hui. Les quiz n’ont pas été réécrits. Le corpus compte désormais 159 blocs de solution et 522 blocs Bash, principalement par séparation des étapes.

Preuves et limites : [journal de relecture, suivi R16–R23](manual-review-log.md#suivi-r16r23--2026-11-06). Aucune anomalie R16–R23 laissée ouverte dans le périmètre décrit. Les gardes supposent un lab réservé à un seul opérateur ; ce ne sont pas des transactions contre un administrateur concurrent. Aucun test réel Docker/Kubernetes, commit, push ou déploiement.

Les propositions de schémas du [journal](manual-review-log.md#passe-3--inventaire-et-décisions-visuelles) ont été réévaluées dans le lot suivant : les trois premières sont désormais livrées.

## Schémas Probes, Gateway et Scheduling — 2026-11-06

| Schéma / insertion | Couverture FR/EN | Vérification technique | Statut |
| --- | --- | --- | --- |
| Probes, après le modèle mental | 3 branches, 13 étapes ; Lecture/Pause/Suivant/Reset ; mobile et bureau | Seuils du manifest 30/2/3 ; startup conditionne les probes ; readiness ne redémarre pas ; UID du Pod conservé lors du redémarrage du conteneur | Livré et vérifié localement |
| Gateway, avant la préparation du lab | 3 branches, 10 étapes ; deux voies configuration/trafic ; mobile et bureau | Host/chemin, backendRef, endpoints ; 200 nominal, 404 sans correspondance, 503 recommandé pour zéro endpoint prêt ; 500 distinct pour une référence invalide | Livré et vérifié localement |
| Scheduling, après le modèle mental | 2 branches, 7 étapes ; candidats/filtres/classement/binding ou Pending ; mobile et bureau | Deux workers du lab ; toleration n’attire pas ; aucun score ne compense un filtre ; binding distinct de Ready | Livré et vérifié localement |

Les **30 étapes × FR/EN × 320/1 280 px = 120 états** sont parcourus et capturés sur le Worker local ; les captures représentatives sont inspectées. Tests des interactions au clavier, hypothèses dépliables et préférence de mouvement réduit ; contrôles tactiles agrandis. Les détails, sources primaires et limites figurent dans le [journal de validation](manual-review-log.md#schémas-probes-gateway-et-scheduling--2026-11-06). Ce lot ne réexécute aucun lab réel et ne renouvelle pas la relecture intégrale des 60 chapitres.

## Schéma NetworkPolicies — 2026-11-06

| Périmètre | Couverture fraîche | Résultat |
| --- | --- | --- |
| Exactitude du modèle | 18 cas explicites de pairs ; matrice ingress/egress ; ports/protocole ; 972 combinaisons comparées au YAML parsé et évalué indépendamment | Conforme au sous-ensemble pédagogique ; portée locale du podSelector seul préservée |
| Interaction FR/EN | Sélecteurs, allow supplémentaire, verdict, quatre étapes Lecture/Pause/Suivant/Reset, reset des règles, changement de langue | Vérifié ; modifier les règles interrompt et réinitialise la séquence |
| Mobile / bureau | 12 configurations × FR/EN × 320/1 280 px = 48 états ; captures supplémentaires des contrôles, YAML et hypothèses | Aucun débordement global ni erreur JavaScript ; inspection représentative des captures |
| Régressions | 202 tests applicatifs / 12 fichiers ; 38 E2E ; types, gate lint, build et diff whitespace | Réussis ; 12 diagnostics lint hérités et avertissements de build conservés |

Insertion après l’explication ET/OU de `/learn/network-policies`. Le modèle étend explicitement le lab avec les namespaces fictifs clients/other et TCP 443 ; il ne remplace pas les manifests. CNI filtrant supposé, connexion directe entre Pods ; DNS, NAT/Services, trafic hôte et connexions existantes hors périmètre. L’autorisation par les politiques ne garantit pas qu’une application écoute. [Détails et sources](manual-review-log.md#schéma-networkpolicies--2026-11-06). Aucun lab réel, commit, push ou déploiement.


## Timeline Init containers et Sidecars — 2026-11-06

| Insertion | Couverture FR/EN | Vérification technique | Statut |
| --- | --- | --- | --- |
| `init-sidecars`, après la note startup/readiness/arrêt | 5 scénarios, 24 étapes ; Lecture/Pause/Suivant/Reset et sélection des colonnes ; mobile et bureau | Réussite de l’init classique puis startup du sidecar avant web ; échecs bloquants ; app arrêtée avant les sidecars, ordre inverse et budget de grâce commun | Livré et vérifié localement |

Le scénario nominal reprend les trois conteneurs du manifest ; les pannes et la variante à deux sidecars sont explicitement pédagogiques. La timeline montre des étapes logiques, sans échelle de temps ni confusion avec les phases du Pod. L’arrêt gracieux et la persistance des logs ne sont pas garantis.

Preuves fraîches : **208 tests applicatifs / 13 fichiers**, TypeScript, gate lint, build SSR/Worker et **46 tests navigateur** réussis. **96 états capturés** (24 × FR/EN × 320/1 280 px), plus huit captures de contexte/hypothèses et une vérification viewport ciblée ; inspection représentative des cinq scénarios. Débordement mobile des textes accessibles corrigé, défilement horizontal limité au tableau, noms des conteneurs fixes. Aucune erreur JavaScript ni débordement global sur le parcours final. Détails, sources et limites dans le [journal](manual-review-log.md#timeline-init-containers-et-sidecars--2026-11-06). Aucun lab réel, commit, push ou déploiement.


## Schéma StatefulSets — 2026-11-06

Le comparatif statique de `/learn/statefulsets` montre le même ordinal 0 et le même nom `notebook-0` pour deux objets Pod successifs. Chaque objet a son propre UID et référence à son tour le PVC `data-notebook-0`. La lecture du fichier d’origine suppose un PVC toujours lié et un stockage accessible.

Quatre vues Chromium du Worker local inspectées en FR/EN à 320×900 et 1 280×900. Cartes empilées sur mobile et côte à côte sur bureau, sans débordement ni erreur JavaScript. Vérification de la présence de la figure dans le HTML SSR, du changement de langue au clavier et de sa conservation après rechargement. [Sources et preuves détaillées](manual-review-log.md#schéma-statefulsets--2026-11-06).


## Timeline Architecture de l’API — 2026-11-06

Six étapes dans `/learn/api-architecture`. La lecture sauvegarde l’objet et son `resourceVersion`. Un PATCH intermédiaire modifie la ConfigMap, puis l’API rejette le PUT périmé avec `409 Conflict` et conserve la valeur `two`. La relecture récupère l’état courant. Une extension pédagogique prépare et illustre une nouvelle tentative conditionnelle depuis l’objet relu.

Lecture, Pause, Suivant, retour au début et sélection directe contrôlés. Les six étapes ont été parcourues en FR/EN à 320×900 et 1 280×900 sur le Worker local. Les 24 états ont été capturés et des captures représentatives ont été inspectées, avec contrôle des explications après défilement mobile. Aucun débordement global ni erreur JavaScript. [Sources et preuves détaillées](manual-review-log.md#timeline-architecture-de-lapi--2026-11-06).

## Timeline Sauvegarde et reprise — 2026-11-06

Six étapes dans `/learn/backup-dr`, avec Lecture, Pause, Suivant, retour au début et sélection directe. L’archive conserve les deux commandes présentes à la capture. La commande A003 reste dans la source et manque à la restauration sur le PVC distinct. Le schéma distingue l’archive locale des snapshots CSI et des sauvegardes etcd.

Les six états ont été contrôlés en FR/EN à 320×900 et 1 280×900 dans Chromium. Captures représentatives inspectées dans les quatre configurations, avec vérification du texte après défilement mobile. Aucun débordement ni erreur JavaScript observés sur le parcours. [Détails et sources](manual-review-log.md#timeline-sauvegarde-et-reprise--2026-11-06).


## Graphe Observabilité — 2026-11-06

Trois branches dans `/learn/observability`. Les métriques sont collectées par Prometheus et consultées dans Grafana. Les traces et les logs applicatifs suivent deux pipelines distincts vers le même exporter debug. Les flèches suivent les données.

Quatre captures FR/EN inspectées à 320×900 et 1 280×900. Branches empilées sur mobile, disposées en colonnes sur bureau. Aucun débordement ni erreur JavaScript lors du contrôle Chromium. [Détails et sources](manual-review-log.md#graphe-observabilité--2026-11-06).


## Domaines de panne — Haute disponibilité et Multi-cluster — 2026-11-06

Un schéma partagé avec deux variantes. Haute disponibilité montre `k8s-ops-lab` et ses trois nœuds sur un hôte. Multi-cluster montre `fleet-a` et `fleet-b`, chacun à un nœud, sur le même hôte Docker. L’imbrication montre quels nœuds sont affectés par une panne de l’hôte.

Huit captures Chromium inspectées, soit les deux chapitres en FR/EN à 320×900 et 1 280×900. Imbrication, disposition et absence de débordement contrôlées. [Détails et sources](manual-review-log.md#domaines-de-panne--haute-disponibilité-et-multi-cluster--2026-11-06).


## Portée RBAC et agrégation — 2026-11-06

Graphe Subject → Binding → Role partagé entre `/learn/rbac` et `/learn/rbac-advanced`. Les deux RoleBindings des labs accordent des règles dans leur namespace. Un exemple illustratif compare la portée d’un ClusterRoleBinding. Un deuxième graphe, dans le chapitre avancé, distingue la sélection des contributeurs par label et l’écriture des règles agrégées par le contrôleur.

Les deux pages ont été vérifiées en FR/EN à 320×900 et 1 280×900. Le graphe des permissions est empilé sur mobile et en trois colonnes sur bureau. Aucun débordement ni erreur JavaScript. [Détails et sources](manual-review-log.md#portée-rbac-et-agrégation--2026-11-06).


## Timelines de snapshot etcd et CSI — 2026-11-06

Cinq étapes par chapitre avec Lecture, Pause, Suivant, retour au début et sélection directe. La simulation etcd montre la restauration de la valeur `blue` dans un nouveau magasin alors que la source contient `green`. CSI montre la relecture du marqueur depuis un volume distinct créé à partir du snapshot.

Les deux timelines ont été parcourues dans Chromium en FR/EN à 320×900 et 1 280×900. Les 40 états passent les contrôles de contenu et de débordement. Captures représentatives des huit configurations inspectées. [Détails et sources](manual-review-log.md#timelines-de-snapshot-etcd-et-csi--2026-11-06).


## Dernière passe FR/EN — 2026-11-06

Build Worker local sur le checkout `ffec215`. **60 chapitres**, 4 pages de contenu et 2 pages 404 contrôlés en FR/EN à **320×900 et 1 280×900**. Les **264 vues** se répartissent en 256 réponses 200 et 8 réponses 404. Huit contrôles séparés des redirections ont confirmé le 301 et la conservation de la langue. Les 60 liens du programme sont présents dans chaque configuration. Les indices et solutions des chapitres ont été ouverts et les 162 questions rendues dans chaque configuration. Aucun débordement horizontal global, ancre interne manquante ou erreur JavaScript observés sur ce parcours.

La passe éditoriale transversale a vérifié les textes bilingues du corpus compilé, les références internes, la cohérence des schémas avec les chapitres et des passages ciblés dans les deux langues. La lecture ligne à ligne des solutions et commandes reste documentée dans les passes précédentes. Aucun lab réel, commit ni déploiement.

### Couverture des schémas

**27 identifiants, 28 insertions, 112 captures initiales**. Le graphe des permissions RBAC est partagé entre deux chapitres. Toutes les insertions ont été contrôlées en FR/EN aux deux largeurs et leurs captures parcourues sur sept planches. Les scénarios et contrôles interactifs ont été rejoués par les E2E et des vérifications ciblées, détaillées dans le [journal](manual-review-log.md#dernière-passe-fren--2026-11-06).

| Schéma | Chapitre | Contrat ou distinction vérifiés | Suivi |
| --- | --- | --- | --- |
| `vm-vs-container` | why-kubernetes | OS invité par VM et noyau partagé côté conteneurs | — |
| `architecture` | architecture | Persistance de l’intention, actions des contrôleurs, placement et exécution | F3 |
| `reconcile` | reconciliation | Comparaison état désiré/courant, remplacement et convergence simulés | F2, F3 |
| `pod-lifecycle` | pods | Phases distinctes des états de conteneur. Running distinct de Ready | — |
| `deployment-tree` | deployments | Deux ReplicaSets et progression du rollout avec hypothèses explicites | F3 |
| `service-traffic` | services | Sélection et EndpointSlices distincts du chemin de trafic | — |
| `probe-decisions` | probes | Startup conditionne les sondes. Readiness et liveness ont des effets différents | — |
| `init-sidecar-timeline` | init-sidecars | Ordre de démarrage, attentes, échecs et arrêt inverse des sidecars | F4 |
| `persistent-storage` | storage | Référence PVC/PV distincte du provisionnement par la StorageClass | — |
| `statefulset-identity` | statefulsets | Ordinal et PVC conservés, UID du Pod remplacé | — |
| `gateway-routing` | ingress-gateway | Configuration distincte du trafic. Résultats 200, 404 et 503 selon le scénario | F4 |
| `network-policy-decisions` | network-policies | Autorisations ingress et egress, portée des sélecteurs, ET/OU et union | — |
| `rbac-permission-flow` | rbac et rbac-advanced | Sujet, binding et règles. Portée namespace ou cluster selon le binding | F4 |
| `scheduling-decisions` | scheduling | Filtrage, score et binding. Aucun score pour les nœuds inéligibles | — |
| `gitops-reconciliation` | gitops | Révision désirée et état observé. Synchronisation distincte de la santé | — |
| `autoscaling-feedback` | hpa | Effet du request CPU sur une estimation nominale, hypothèses affichées | — |
| `eviction-budget` | pdb | Éviction selon marge disponible. Acceptation distincte de la reprise | — |
| `ha-failure-domains` | ha | Trois nœuds kind dans un cluster sur un hôte partagé | — |
| `rbac-aggregation-flow` | rbac-advanced | Union des règles par label, attribution distincte via RoleBinding | — |
| `observability-flow` | observability | Métriques vers Prometheus/Grafana, traces et logs vers debug | F4 |
| `backup-recovery-timeline` | backup-dr | Archive de fichier, écriture postérieure et contrôle sur un PVC distinct | — |
| `api-conflict-timeline` | api-architecture | 409, relecture puis nouvelle tentative à partir de l’objet courant | — |
| `admission-webhook-flow` | admission-webhooks | Admission avant persistance et réponse du webhook au serveur API | — |
| `etcd-snapshot-timeline` | etcd | Clé synthétique restaurée au point de capture, lien avec l’état API | — |
| `csi-snapshot-timeline` | csi | Snapshot côté stockage, nouveau volume et relecture du fichier | F5 |
| `fleet-failure-domains` | multi-cluster | Deux clusters à un nœud chacun, hôte partagé | — |
| `fleet-promotion` | multi-cluster | Contrôles de A avant B, arrêt de la promotion après échec | — |

### Constats restants

| ID | Priorité | Périmètre et preuve | Suite proposée |
| --- | --- | --- | --- |
| F1 | P2 | Client, FR/EN. Le plus gros fichier JS du build pèse **1 371,43 kB minifiés / 437,42 kB gzip**. Vite signale le dépassement de son seuil de 500 kB. | Mesurer le chargement à froid puis évaluer le découpage du corpus par route ou niveau. |
| F2 | P3 | Réconciliation, FR. Après augmentation à 4 réplicas, le journal affiche `observe 3 / desire 4 → create 1` en anglais. Reproduit à 320 et 1 280 px. | Localiser les événements simulés en conservant les identifiants Kubernetes. |
| F3 | P3 | Architecture, Réconciliation et Déploiements, FR/EN. Les petits boutons icônes historiques sont moins faciles à toucher que les commandes des nouvelles timelines. La navigation au clavier a fonctionné lors du contrôle. | Harmoniser la zone tactile, notamment Suivant/Reset et les boutons de réplication. |
| F4 | P3 | Mobile FR/EN. Les longues figures demandent du défilement. En FR à 320 px, Init/Sidecars et Gateway font environ 1 730 et 1 590 px. Les commandes sont en haut et le texte de l’étape est en bas. Les graphes RBAC et Observabilité sont également longs. | Rapprocher l’explication de l’état courant et étudier une présentation compacte des branches. |
| F5 | P3 | CSI, dernière étape FR. « laisse l’état API Kubernetes intact » est plus large que l’anglais, alors que le parcours crée des objets API. | Préciser que la restauration du volume ne reconstitue pas l’état API Kubernetes. |
| F6 | P3 | Quiz FR/EN. Des distracteurs restent faciles, par exemple la copie de fichiers attribuée au Service headless dans StatefulSets. L’audit n’a trouvé ni doublon d’option ni biais global de position. | Remplacer progressivement les distracteurs trop éloignés des erreurs plausibles, en gardant la réponse correcte. |

Contrôles réussis avec Bun 1.4.2 : 208 tests applicatifs, 62 tests navigateur, TypeScript, lint (12 diagnostics hérités gelés), build, vérification hors ligne de 134 fichiers de lab et suites Python. Le comportement du site a été examiné en Chromium local.
