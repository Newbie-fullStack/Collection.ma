export interface User {
  id: number;
  pseudo: string;
  nom: string;
  prenom: string;
  age: number;
  gsm: string;
  email: string;
  adresse_exacte: string;
  rib?: string;
  wallet?: Wallet;
  role: 'acheteur' | 'vendeur' | 'both' | 'admin';
  statut_kyc: 'non_verifie' | 'en_cours' | 'verifie' | 'rejete';
  note_moyenne: number;
  langue_preferee: string;
  created_at: string;
}

export interface Category {
  id: number;
  nom_fr: string;
  nom_ar: string;
  slug: string;
  icon: string;
  ordre_affichage: number;
  active: boolean;
}

export interface ListingPhoto {
  id: number;
  path: string;
  ordre: number;
  is_principale: boolean;
}

export interface Listing {
  id: number;
  numero_auto: string;
  seller_id: number;
  category_id: number;
  titre: string;
  description: string;
  prix_vente: number;
  frais_port: number;
  total: number;
  mode: 'enchere' | 'achat_immediat';
  statut: 'brouillon' | 'active' | 'vendue' | 'expiree' | 'suspendue';
  prix_actuel: number;
  date_publication: string;
  date_expiration: string;
  nb_republications: number;
  nb_vues: number;
  nb_favoris: number;
  seller?: Pick<User, 'id' | 'pseudo' | 'nom' | 'prenom'>;
  category?: Category;
  photos?: ListingPhoto[];
  bids?: Bid[];
  created_at: string;
}

export interface Bid {
  id: number;
  listing_id: number;
  bidder_id: number;
  montant: number;
  auto_bid_max: number | null;
  is_auto_bid: boolean;
  statut: 'active' | 'gagnee' | 'perdue' | 'annulee';
  bidder?: Pick<User, 'id' | 'pseudo'>;
  listing?: {
    id: number;
    numero_auto: string;
    titre: string;
    mode: string;
    statut: string;
    prix_vente: number;
    prix_actuel: number | null;
    date_expiration: string | null;
  };
  created_at: string;
}

export interface Order {
  id: number;
  numero_commande: string;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  prix: number;
  frais_port: number;
  commission_montant: number;
  commission_taux: number;
  total: number;
  statut: 'attente_paiement' | 'sequestre' | 'expedie' | 'livre_confirme' | 'litige' | 'rembourse' | 'vire_vendeur';
  tracking_number: string | null;
  transporteur: string | null;
  date_expedition: string | null;
  date_confirmation_limite: string | null;
  date_confirmation: string | null;
  date_virement: string | null;
  listing?: Listing;
  buyer?: Pick<User, 'id' | 'pseudo' | 'nom' | 'prenom'>;
  seller?: Pick<User, 'id' | 'pseudo' | 'nom' | 'prenom'>;
  created_at: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  solde: number;
  solde_disponible: number;
  solde_en_attente: number;
  devise: string;
}

export interface WalletTransaction {
  id: number;
  wallet_id: number;
  order_id: number | null;
  type: 'depot' | 'encaissement' | 'commission' | 'virement_vendeur' | 'remboursement' | 'retrait';
  montant: number;
  devise: string;
  description: string;
  reference: string | null;
  statut: 'en_attente' | 'complete' | 'echouee';
  order?: { numero_commande: string };
  created_at: string;
}

export interface Review {
  id: number;
  order_id: number;
  reviewer_id: number;
  reviewed_id: number;
  note: number;
  commentaire: string | null;
  reviewer?: Pick<User, 'pseudo'>;
  created_at: string;
}

export interface Dispute {
  id: number;
  order_id: number;
  initiator_id: number;
  raison: string;
  description: string;
  statut: string;
  order?: { id: number; numero_commande: string; buyer_id: number; seller_id: number };
  initiator?: User;
  created_at: string;
}

export interface SavedSearch {
  id: number;
  user_id: number;
  nom: string;
  mot_cle?: string | null;
  category_id?: number | null;
  prix_min?: number | null;
  prix_max?: number | null;
  mode?: string | null;
  alerte_active: boolean;
  frequence_alerte: string;
  created_at: string;
  category?: { id: number; nom_fr: string; nom_ar: string; slug: string } | null;
}

export interface Advertisement {
  id: number;
  titre: string;
  image_path: string;
  lien: string | null;
  position: 'top_gauche' | 'top_droite' | 'bottom_gauche' | 'bottom_droite';
  largeur: number;
  hauteur: number;
  active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  title_ar: string;
  message: string;
  message_ar: string;
  link: string | null;
  read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface Invoice {
  id: number;
  numero_facture: string;
  order_id: number;
  user_id: number;
  type: 'acheteur' | 'vendeur' | 'plateforme';
  sous_total: number;
  commission: number;
  total: number;
  devise: string;
  pdf_path: string | null;
  telechargee: boolean;
  created_at: string;
  order?: { numero_commande: string };
  user?: User;
}

export interface SellerStats {
  total_ventes: number;
  chiffre_affaires: number;
  commission_totale: number;
  annonces_actives: number;
  vues_totales: number;
  top_annonces: { id: number; titre: string; nb_vues: number; prix_vente: number }[];
}
