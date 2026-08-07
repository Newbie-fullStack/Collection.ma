# Roadmap — Collection.ma

## Vision

Marketplace marocain d'objets de collection : achats, enchères sécurisées (séquestre), vendeurs
vérifiés par KYC. Cette roadmap couvre les prochaines étapes produit, en continu.

### Légende des statuts
- `[ ]` À faire
- `[~]` En cours
- `[x]` Fait

### Décisions actées (trancher / confirmées)
- **Rôle par défaut** : `acheteur` (alias de « client »). Pas de renommage en `client`.
- **Signature du contrat vendeur** : re-upload du PDF signé/scanné (par défaut). La signature
  électronique « tapez votre nom + case à cocher » reste une variante possible.
- **Stockage des documents KYC** : BLOB binaire (`bytea`) dans PostgreSQL (Fly.io). Pas de S3,
  pas de volume externe. Accès via routes authentifiées uniquement.
- **Page admin « Validation des vendeurs »** : à créer (n'existe pas encore dans l'arborescence).

---

## ⚠️ PRIORITÉ HAUTE — Rôle par défaut + KYC vendeur vérifié

### Objectif
À l'inscription, tout utilisateur reçoit uniquement le rôle `acheteur`. Le rôle `vendeur`
n'est JAMAIS attribué automatiquement : il exige une demande KYC explicite validée manuellement
par un compte admin. Aucun chemin de code ne doit permettre d'obtenir `vendeur` sans une entrée
`vendor_applications` au statut `valide`, traitée par un admin identifié. Pas de validation
automatique (seeders dédiés pour simuler des vendeurs pré-validés en dev/staging uniquement).

### Bug critique à corriger en premier
- [x] _Constat_ : `AuthController::register` force actuellement `role => 'both'` → tout nouvel
  inscrit devient acheteur+vendeur.
- [ ] Corriger `AuthController::register` → `role = acheteur` (défaut strict).

### Backend — modèle de données
- [ ] Migration `vendor_applications` :
  - `id`, `user_id` (FK), `cin_recto` (bytea), `cin_verso` (bytea), `rib` (encrypted)
  - `contrat_pdf_genere` (bytea), `version_cgv`, `date_generation`
  - `contrat_signe` (bytea)
  - `statut` (enum : `en_attente` / `complement_demande` / `valide` / `refuse`)
  - `motif_refus` (nullable), `date_soumission`, `date_traitement`, `traite_par` (FK admin)
  - `created_at`, `updated_at`
- [ ] Migration users : ajout `vendeur_verifie_le` (nullable timestamp).
- [ ] Fix défaut colonne `role` → `acheteur` (déjà le défaut migration, à confirmer).
- [ ] Modèle `VendorApplication` + relations.
- [ ] `VendorApplicationPolicy` : accès documents limité au propriétaire et aux admins.

### Backend — endpoints API
- [ ] `POST /api/vendor-applications` (soumission, upload multipart CIN + contrat signé)
- [ ] `GET /api/vendor-applications/me` (suivi de sa propre demande)
- [ ] `GET /api/admin/vendor-applications` (liste + filtres, admin only)
- [ ] `GET /api/admin/vendor-applications/{id}/document/{type}` (lecture authentifiée, admin only)
- [ ] `POST /api/admin/vendor-applications/{id}/approve` (→ rôle `vendeur` ou `both`,
      `statut=valide`, `date_validation`, `traite_par`, notification)
- [ ] `POST /api/admin/vendor-applications/{id}/reject` (motif obligatoire, notification + motif,
      nouvelle soumission possible, historique conservé)
- [ ] `POST /api/admin/vendor-applications/{id}/request-complement` (message sans clore la demande)

### Backend — génération du contrat vendeur
- [ ] Génération PDF contrat (DomPDF/Spatie) : CGV vendeur en vigueur — commission 5%,
      séquestre, délais de virement, obligations d'expédition, politique de litige.
- [ ] Route téléchargement du contrat proposé (libre) avant signature.

### Frontend — parcours utilisateur
- [ ] Formulaire multi-étapes « Devenir vendeur » (`/mon-compte/devenir-vendeur`) :
      a. Confirmation d'identité (nom, prénom pré-remplis non modifiables, date de naissance, adresse)
      b. Upload CIN recto/verso (jpg/png/pdf, max 5 Mo, validation format/taille/résolution, preview)
      c. RIB (validation IBAN + clé)
      d. Contrat vendeur : téléchargement PDF + re-upload signé
      e. Récapitulatif + soumission → `statut = en_attente`
- [ ] Bandeau persistant d'état de demande (en_attente / complement / refuse + motif / valide)
      dans « Mon Compte ».
- [ ] Item menu « Devenir vendeur » visible seulement si `role = acheteur` et aucune demande
      en cours. Item « Suivi de ma demande vendeur » si en_attente/refuse.
- [ ] CTA « Devenir vendeur » sur toute tentative d'accès à « Ajouter un objet » / « Espace
      Vendeur » par un simple acheteur (redirection vers le formulaire).

### Frontend — gating vendeur
- [ ] « Espace Vendeur » + « Ajouter un objet » masqués/grisés (tooltip « Devenez vendeur
      vérifié pour publier ») tant que le rôle ne contient pas `vendeur`.
- [ ] Vérifier toutes les routes backend vendeur (listings store, seller-orders, seller-invoices,
      seller-stats, withdrawals, my-listing-bids…) → middleware/autorisation `role` requis.

### Frontend — back-office
- [ ] Page admin « Validation des vendeurs » : tableau des demandes filtrable par statut.
- [ ] Panneau latéral : infos utilisateur + visionneuse documents (lecture in-app, pas de
      téléchargement forcé).
- [ ] Boutons Approuver / Refuser (motif) / Demander complément.
- [ ] Compteur de demandes en attente dans le dashboard admin global.
- [ ] Audit : horodatage + `traite_par` sur toute action (traçabilité litiges).

### Notifications
- [ ] Notification email/in-app à la soumission.
- [ ] Notification à la décision (approuvé / refusé avec motif / complément demandé).

### Tests
- [ ] Pest : un `acheteur` ne peut pas accéder aux routes vendeur avant validation.
- [ ] Pest : upload fichier trop lourd / mauvais format rejeté.
- [ ] Pest : approbation change le rôle et débloque l'accès.
- [ ] Pest : refus n'altère pas le rôle et permet une nouvelle soumission.
- [ ] Playwright E2E : inscription client → accès vendeur bloqué → demande KYC complète →
      validation admin → accès vendeur débloqué.

---

## Phase 1 — Fondations & robustesse

- [ ] Code-splitting du bundle JS (découper `api/index.ts` + pages lourdes, chunk > 500 kB).
- [ ] Tests E2E réactivés (`e2e/critical-paths.spec.ts`) — les 500 register sont corrigés.
- [ ] Gestion d'erreurs API globale (handler axios centralisé : 401 → logout, messages).

## Phase 2 — Commerce & paiements

- [ ] Enchères en temps réel : câbler `NewBidPlaced` event + Echo/WebSocket en live UI.
- [ ] Compte à rebours enchères (timer live sur listing) + fin d'enchère automatique.
- [ ] Paiement bancaire réel (CMI/Mastercard) — aujourd'hui simulé via wallet `topup`.
- [ ] Flux « faire une offre » côté acheteur (cohérent avec les offres reçues vendeur).
- [ ] Notifications email/SMS (les `frequence_alerte` sont déjà en DB, pas d'envoi).

## Phase 3 — Expérience vendeur & acheteur

- [ ] Alertes Saved Searches : scanner/job qui matche les nouvelles annonces vs `saved_searches`.
- [ ] Upload photos par lot + recadrage/preview.
- [ ] Programmation de publication (brouillon → actif planifié).
- [ ] Messagerie enrichie : pièces jointes, notifications temps réel.
- [ ] Favoris par dossiers (listes multiples).

## Phase 4 — Confiance & scaling

- [ ] Vérification identité complémentaire (KYC renforcé, badge vérifié).
- [ ] Avis enrichis : réponse à un avis, modération/signalement.
- [ ] Anti-fraude enchères : détection sniping, prix anormaux.
- [ ] Admin analytics avancés : graphes ventes/commissions (data dashboard).

## Phase 5 — SEO & acquisition

- [ ] Donnée structurée (Product, Offering) sur les listings.
- [ ] `llms.txt`, meta des pages publiques / blog.
- [ ] Profil public, LinkedIn, etc. via les skills SEO.

## Phase 6 — Mobile & scale

- [ ] PWA / responsive natif, app mobile Flutter/React Native.
- [ ] CDN images, queue jobs Redis.
