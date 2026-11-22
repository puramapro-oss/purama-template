# ERRORS.md — Registry of Bugs & Fixes

| Date | Bug | Cause | Fix |
|------|-----|-------|-----|
| 2026-11-22 | Callback et récupération inaccessibles ou destination externe | Route group sans segment, alias absent, garde de destination insuffisante | Alias unique, destinations locales validées, erreurs récupérables et cookies SSR/cache conservés ; régressions réelles. |
| 2026-11-22 | Formulaires bloqués ou doublés après erreur, confirmation tardive incorrecte | Promesses sans catch, absence de verrou synchrone et de garde de démontage | Hook de soumission commun, réessais, exclusion OAuth/mot de passe, adresse soumise conservée et navigation de session ; tests React/DOM. |
| 2026-11-22 | Lecture de session tardive écrasait un événement récent | Lecture initiale avant abonnement, effets retirés non isolés | Abonnement en premier, erreurs gérées et priorité aux événements ; six tests unitaires du hook. |
| 2026-11-22 | Administrateur établi bloqué par le middleware et lectures de service sans garde locale | Flag de profil différent du contrat d’identité des API/layout | Identité vérifiée commune, refus sur erreur et garde avant chaque client privilégié ; aucune promotion ou migration de rôle. |
| 2026-11-22 | Cron pouvait supprimer une identité commune sur une demande locale sans délai appliqué | Date absente, seuil ignoré et erreurs de base interprétées comme zéro demande | Horodatage serveur additif, comptage exact après 30 jours et garde 503 sans effacement ; 33 tests locaux. Service central restant à qualifier. |
| 2026-11-22 | Projection partielle de profils ne compilait pas | Annotation de profil complet sur une sélection réduite | Type inféré de la sélection ; compilation complète vérifiée. |
| 2026-11-22 | Option Next obsolète et avertissements de lint | Ancienne clé expérimentale vide, variables/arguments inutilisés et image sans composant dédié | Clé retirée, variables supprimées, Image avec dimensions explicites et même transfert direct ; règles de lint conservées. |

---

**RÈGLE**: Chaque bug fixé → ligne IMMÉDIATE ici.
**WORKFLOW**: Bug → 1. ERRORS.md (fix connu?) 2. `grep -r` 3. `tsc --noEmit` 4. console.log temp→fix→supprimer 5. context7 lib doc 6. 3 échecs→`/clear`
