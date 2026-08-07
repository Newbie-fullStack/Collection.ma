import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Star, Package } from 'lucide-react';
import { listingsApi } from '@/api';
import { useProfileSeo } from '@/lib/seo';
import { formatMAD, cn } from '@/lib/utils';
import type { User, Listing } from '@/types';

export function SellerProfilePage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { userId } = useParams<{ userId: string }>();
  const [seller, setSeller] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    listingsApi.sellerProfile(Number(userId))
      .then(({ data }) => {
        setSeller(data.vendeur);
        setListings((data.listings as any)?.data ?? []);
      })
      .catch(() => setError(t('commun.erreur')))
      .finally(() => setLoading(false));
  }, [userId, t]);

  useProfileSeo(
    seller
      ? `${seller.pseudo} — ${t('commun.vendeur')} sur collection.ma`
      : undefined
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-24 bg-navy-hover rounded-lg mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-navy-hover rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-text-subdued text-lg">{t('commun.aucun_resultat')}</p>
        <Link to="/listings" className="btn-gold mt-4 inline-block">{t('commun.retour')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="card p-6 mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-2xl font-bold text-gold">
          {seller.pseudo?.charAt(0).toUpperCase() ?? 'V'}
        </div>
        <div className="flex-1">
          <div className={cn('flex items-center gap-2', isAr && 'flex-row-reverse justify-end')}>
            <h1 className="text-2xl font-serif font-bold text-cream">{seller.pseudo}</h1>
            {seller.est_verifie && (
              <span className="inline-flex items-center gap-1 text-xs text-green">
                <BadgeCheck className="w-4 h-4" />
                {isAr ? 'متحقق' : 'Vérifié'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-text-subdued mt-1">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-gold" />
              {seller.note_moyenne ? Number(seller.note_moyenne).toFixed(1) : '—'}
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              {listings.length} {isAr ? 'إعلان' : 'annonces'}
            </span>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-serif font-bold text-cream mb-4">
        {isAr ? 'المنتجات المتاحة' : 'Annonces actives'}
      </h2>

      {listings.length === 0 ? (
        <p className="text-text-subdued">{isAr ? 'لا توجد إعلانات حالياً' : 'Aucune annonce pour le moment'}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <Link key={listing.id} to={`/listings/${listing.numero_auto}`} className="card p-3 group">
              <div className="aspect-square rounded-lg overflow-hidden bg-navy-hover mb-3">
                {listing.photos?.[0] ? (
                  <img src={`/storage/${listing.photos[0].path}`} alt={listing.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-subdued text-xs">
                    <Package className="w-6 h-6" />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-cream line-clamp-2">{listing.titre}</h3>
              <p className="text-gold font-semibold mt-1">{formatMAD(listing.prix_vente, i18n.language)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}