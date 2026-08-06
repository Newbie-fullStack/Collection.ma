import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { listingsApi } from '@/api';
import { cn, formatMAD, getStatusColor } from '@/lib/utils';
import { Package, PlusCircle, FileText, ShoppingBag, Star, MessageSquare, Eye, BarChart3, FileText as InvoiceIcon, Wallet, Settings, Upload, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Listing } from '@/types';

export function SellerListingsPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    setLoading(true);
    listingsApi.myListings({ statut: filter, per_page: 20 })
      .then(({ data }) => setListings(data.data))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const statutLabels: Record<string, string> = {
    'brouillon': isAr ? 'مسودة' : 'Brouillon',
    'active': isAr ? 'نشط' : 'Active',
    'vendue': isAr ? 'مباع' : 'Vendue',
    'expiree': isAr ? 'منتهي' : 'Expirée',
    'suspendue': isAr ? 'معلق' : 'Suspendue',
  };

  const filters = [
    { key: 'active', label: isAr ? 'نشط' : 'Actives' },
    { key: 'brouillon', label: isAr ? 'مسودات' : 'Brouillons' },
    { key: 'vendue', label: isAr ? 'مباع' : 'Vendues' },
    { key: 'expiree', label: isAr ? 'منتهية' : 'Expirées' },
  ];

  return (
    <div>
      <div className={cn('flex items-center justify-between mb-6', isAr && 'flex-row-reverse')}>
        <h2 className="text-xl font-serif font-bold text-cream">{t('vendeur.mes_objets')}</h2>
        <Link to="/vendeur/ajouter" className="btn-gold flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          {t('vendeur.ajouter_objet')}
        </Link>
      </div>

      <div className={cn('flex gap-2 mb-6', isAr && 'flex-row-reverse')}>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-4 py-2 rounded text-sm font-medium transition-colors',
              filter === f.key ? 'bg-gold text-white' : 'bg-navy-hover text-text-subdued hover:bg-navy-hover/80'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex gap-4">
              <div className="w-16 h-16 bg-navy-hover rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-navy-hover rounded w-1/3" />
                <div className="h-3 bg-navy-hover rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="card p-8 text-center">
          <Package className="w-12 h-12 text-text-subdued mx-auto mb-3" />
          <p className="text-text-subdued">{t('commun.aucun_resultat')}</p>
          <Link to="/vendeur/ajouter" className="btn-gold mt-4 inline-block">
            {t('vendeur.ajouter_objet')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div key={listing.id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded bg-navy-hover overflow-hidden shrink-0">
                {listing.photos?.[0] ? (
                  <img src={`/storage/${listing.photos[0].path}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-subdued">
                    <Package className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-subdued font-mono">{listing.numero_auto}</span>
                  <span className={cn('badge', getStatusColor(listing.statut))}>
                    {statutLabels[listing.statut]}
                  </span>
                  <span className="badge badge-gold text-[10px]">
                    {listing.mode === 'enchere' ? (isAr ? 'مزيد' : 'Enchère') : (isAr ? 'بيع مباشر' : 'Achat')}
                  </span>
                </div>
                <h3 className="font-medium text-sm text-cream truncate mt-1">{listing.titre}</h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-text-subdued">
                  <span>{formatMAD(listing.prix_actuel || listing.prix_vente, i18n.language)}</span>
                  <span>{listing.nb_vues} {isAr ? 'مشاهدة' : 'vues'}</span>
                  <span>{listing.nb_favoris} {isAr ? 'مفضل' : 'favoris'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/listings/${listing.numero_auto}`} className="p-2 hover:bg-navy-hover rounded">
                  <Eye className="w-4 h-4 text-text-subdued" />
                </Link>
                <button className="p-2 hover:bg-navy-hover rounded">
                  <FileText className="w-4 h-4 text-text-subdued" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
