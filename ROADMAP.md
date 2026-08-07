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

- [x] Enchères en temps réel : câbler `NewBidPlaced` event + Echo/WebSocket en live UI.
      (`routes/channels.php` + subscription sur la fiche annonce : prix/bid list/toast live.)
- [x] Compte à rebours enchères (timer live 1s sur listing) + fin d'enchère automatique.
- [x] Flux « faire une offre » côté acheteur (cohérent avec les offres reçues vendeur).
      (`OfferController` : store/myOffers/sellerOffers/accept/reject/cancel. Accept ⇒ Order + Escrow, listing `vendue`.
       UI : `ListingDetailPage` formulaire offre, `BuyerOffersPage` + `SellerOffersPage` listes & actions.)
- [x] Passerelle de paiement — abstraction `PaymentService` (driver `wallet` simulé par défaut,
      driver `cmi` préparé pour CMI/Mastercard 3DSecure en production). Config dans `config/services.php` +
      `PAYMENT_DRIVER`/`CMI_*` dans `.env`.
- [x] Notifications email/SMS — `NotificationsService` centralisé : notif in-app + email transactionnel
      (mailer `log` par défaut). Envoi par `NotificationsService::notify` (tous les anciens `Notification::create`
      y sont migrés). Vrai fournisseur SMTP + SMS à venir.

## Phase 3 — Expérience vendeur & acheteur

- [x] Alertes Saved Searches : `SavedSearchMatcher` + job `MatchSavedSearches` (toutes les 15 min) qui
      matche les nouvelles annonces vs `saved_searches` actives → notif `alert_saved_search` + email.
- [x] Upload photos par lot + recadrage/preview : grille de préviews (`URL.createObjectURL`), réordonner,
      définir la photo principale (1re), suppression, upload incrémental jusqu'à 20.
- [x] Programmation de publication (brouillon → actif planifié) : colonne `date_publication_planifiee`,
      `PublishScheduledListings` (chaque minute) + action « Programmer la publication » dans le formulaire.
- [x] Messagerie enrichie : pièces jointes (images/PDF) sur les messages + événement temps réel
      `NewConversationMessage` / canal privé `conversation.{id}` (`subscribeToConversation` côté UI).
- [x] Favoris par dossiers (listes multiples) : `favorite_folders` + `folder_id` sur favoris,
      endpoints folders (list/create/delete) + assignation en un clic.

## Phase 4 — Confiance & scaling

- [x] Vérification identité complémentaire (KYC renforcé, badge vérifié) : attribut `est_verifie` sur User
      (statut_kyc `verifie` + `vendeur_verifie_le`), exposé côté public, badge « Vérifié » sur la fiche annonce.
- [x] Avis enrichis : réponse du vendeur (`POST /reviews/{id}/reply`), signalement (`flag`), modération admin
      (`adminIndex` + `moderate` valider/masquer/reveler). Avis masqués/signalés exclus de la note moyenne.
- [x] Anti-fraude enchères : `AuctionFraudGuard` — anti-sniping (prolonge l'enchère dans les 2 dernières min,
      max 10 extensions) + détection saut de prix >50% (`suspect`/`motif_suspect` sur les bids).
- [x] Admin analytics avancés : `GET /api/admin/analytics?period=7d|30d|90d|12m` — séries ventes/commissions
      quotidiennes, ventes par catégorie, top vendeurs.

## Phase 5 — SEO & acquisition

- [x] Donnée structurée (Product, Offering) sur les listings : `useListingSeo` injecte JSON-LD
      Product + Offer (prix MAD, disponibilité, image) + meta og:title/description dans le `<head>`.
- [x] `llms.txt` & `llms-full.txt` (routes Laravel) + meta des pages publiques : hook `usePageSeo`
      (title/description/og) réutilisable, blog/info pages éligibles.
- [x] Profil public vendeur : `GET /api/vendeurs/{id}` + `SellerProfilePage` (`/vendeur/:id/profil`)
      avec badge vérifié, note moyenne, annonces actives et meta SEO. Optimisation du portefeuille
      LinkedIn/X via les skills agentkit-seo (content marketing coup d'offre externe).

## Phase 6 — Mobile & scale

- [x] PWA / responsive natif : `vite-plugin-pwa` configuré avec web manifest, service worker (Workbox),
      icônes maskable/standalone, raccourcis et mise en cache intelligente des images de listings.
- [x] CDN images, queue jobs Redis : `MediaService` + `cdn` filesystem disk (S3 compatible ou local) +
      attribut `url` auto-généré sur les photos de listing, prêt pour Redis & jobs asynchrones.
