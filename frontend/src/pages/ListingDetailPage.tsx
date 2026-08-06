import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Share2, Flag, Clock, User, ChevronLeft, ShoppingCart, MessageSquare } from 'lucide-react';
import { listingsApi, bidsApi, favoritesApi, conversationsApi } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { formatMAD, getRemainingTime, cn } from '@/lib/utils';
import type { Listing } from '@/types';

export function ListingDetailPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { numero_auto } = useParams<{ numero_auto: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isFavori, setIsFavori] = useState(false);

  const handleContactSeller = async () => {
    if (!isAuthenticated || !listing?.seller) return;
    try {
      const { data } = await conversationsApi.create({
        user_id: listing.seller.id,
        listing_id: listing.id,
      });
      navigate(`/messages/${data.id}`);
    } catch { /* ignore */ }
  };
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemainingTime>>(null);

  useEffect(() => {
    if (!numero_auto) return;
    setLoading(true);
    listingsApi.list({ q: numero_auto })
      .then(({ data }) => {
        if (data.data.length > 0) {
          setListing(data.data[0]);
        }
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [numero_auto]);

  useEffect(() => {
    if (!listing?.date_expiration) return;
    const interval = setInterval(() => {
      setRemaining(getRemainingTime(listing.date_expiration));
    }, 60000);
    setRemaining(getRemainingTime(listing.date_expiration));
    return () => clearInterval(interval);
  }, [listing?.date_expiration]);

  const handleBid = async () => {
    if (!listing || !bidAmount) return;
    try {
      await bidsApi.place(listing.id, { montant: parseFloat(bidAmount) });
      const { data } = await listingsApi.get(listing.id);
      setListing(data);
      setBidAmount('');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavori = async () => {
    if (!listing) return;
    try {
      const { data } = await favoritesApi.toggle(listing.id);
      setIsFavori(data.favori);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-navy-hover rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-navy-hover rounded w-3/4" />
            <div className="h-12 bg-navy-hover rounded w-1/2" />
            <div className="h-24 bg-navy-hover rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-text-subdued text-lg">{t('commun.aucun_resultat')}</p>
        <Link to="/listings" className="btn-gold mt-4 inline-block">
          {t('commun.retour')}
        </Link>
      </div>
    );
  }

  const mainPhoto = listing.photos?.find((p) => p.is_principale) || listing.photos?.[0];
  const photoUrl = mainPhoto ? `/storage/${mainPhoto.path}` : '/placeholder-listing.jpg';
  const minBid = (listing.prix_actuel || listing.prix_vente) + 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className={cn('flex items-center gap-2 text-sm text-text-subdued mb-6', isAr && 'flex-row-reverse')}>
        <Link to="/" className="hover:text-gold">{t('nav.accueil')}</Link>
        <ChevronLeft className={cn('w-4 h-4', isAr && 'rotate-180')} />
        <Link to="/listings" className="hover:text-gold">{t('nav.encheres')}</Link>
        <ChevronLeft className={cn('w-4 h-4', isAr && 'rotate-180')} />
        <span className="text-cream">{listing.numero_auto}</span>
      </div>

      <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-8', isAr && 'md:direction-rtl')}>
        {/* Photos */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden bg-navy-hover">
            <img src={photoUrl} alt={listing.titre} className="w-full h-full object-cover" />
          </div>
          {listing.photos && listing.photos.length > 1 && (
            <div className="flex gap-2 mt-3">
              {listing.photos.map((photo) => (
                <div key={photo.id} className="w-16 h-16 rounded overflow-hidden border border-gold/20">
                  <img
                    src={`/storage/${photo.path}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className={cn(isAr && 'direction-rtl')}>
          {/* Mode badge */}
          <span className={cn(
            'badge mb-3',
            listing.mode === 'enchere' ? 'badge-gold' : 'badge-green'
          )}>
            {listing.mode === 'enchere' ? '⏱ ' + t('listing.encherir') : t('listing.acheter_maintenant')}
          </span>

          <h1 className="text-2xl font-serif font-bold text-cream mb-2">
            {listing.titre}
          </h1>

          <p className="text-sm text-text-subdued mb-4">
            {t('listing.numero_auto')}: {listing.numero_auto}
          </p>

          {/* Price */}
          <div className="bg-navy-card border border-gold/15 rounded-lg p-4 mb-4">
            <div className="text-sm text-text-subdued mb-1">
              {listing.mode === 'enchere' ? t('listing.offre_actuelle') : t('listing.prix')}
            </div>
            <div className="text-3xl font-bold text-gold">
              {formatMAD(listing.prix_actuel || listing.prix_vente, i18n.language)}
            </div>
            {listing.frais_port > 0 && (
              <div className="text-sm text-text-subdued mt-1">
                + {formatMAD(listing.frais_port, i18n.language)} {t('listing.frais_port')}
              </div>
            )}
          </div>

          {/* Countdown for auctions */}
          {listing.mode === 'enchere' && remaining && (
            <div className={cn('flex items-center gap-2 mb-4 text-red font-medium', isAr && 'flex-row-reverse')}>
              <Clock className="w-5 h-5" />
              <span>
                {t('listing.temps_restant')}: {remaining.jours}j {remaining.heures}h {remaining.minutes}min
              </span>
            </div>
          )}

          {/* Bid form */}
          {listing.mode === 'enchere' && (
            <div className="mb-4">
              <label className="text-sm font-medium text-cream mb-1 block">
                {t('listing.votre_offre')} (min: {formatMAD(minBid, i18n.language)})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={minBid.toString()}
                  className="input-field flex-1"
                  min={minBid}
                />
                <button onClick={handleBid} className="btn-gold">
                  {t('listing.encherir')}
                </button>
              </div>
              <p className="text-xs text-text-subdued mt-1">
                {listing.bids ? t('listing.nb_offres', { count: listing.bids.length }) : ''}
              </p>
            </div>
          )}

          {/* Buy now */}
          {listing.mode === 'achat_immediat' && (
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => addItem(listing)}
                className="btn-gold-outline flex-1 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                {isAr ? 'أضف للسلة' : 'Ajouter au panier'}
              </button>
              <Link
                to="/checkout"
                onClick={() => addItem(listing)}
                className="btn-gold flex-1 flex items-center justify-center gap-2"
              >
                {isAr ? 'شراء الآن' : 'Acheter maintenant'}
              </Link>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={toggleFavori}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                isFavori ? 'border-red bg-red/5 text-red' : 'border-gold/20 text-text-subdued hover:border-gold'
              )}
            >
              <Heart className={cn('w-4 h-4', isFavori && 'fill-current')} />
              {isFavori ? t('listing.retirer_favori') : t('listing.ajouter_favori')}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/20 text-text-subdued hover:border-gold transition-colors">
              <Share2 className="w-4 h-4" />
              {t('listing.partager')}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/20 text-text-subdued hover:border-red transition-colors">
              <Flag className="w-4 h-4" />
              {t('listing.signaler')}
            </button>
          </div>

          {/* Seller info */}
          {listing.seller && (
            <div className="border border-gold/15 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-cream">{listing.seller.pseudo}</div>
                  <div className="text-xs text-text-subdued">
                    {isAr ? 'البائع' : 'Vendeur'} • ⭐ {listing.nb_vues} {t('listing.nb_vues', { count: listing.nb_vues })}
                  </div>
                </div>
                {isAuthenticated && user?.id !== listing.seller.id && (
                  <button
                    onClick={handleContactSeller}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gold border border-gold/30 rounded-lg hover:bg-gold/5 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {isAr ? 'تواصل' : 'Contacter'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mt-6">
            <h3 className="font-semibold text-cream mb-2">{t('listing.description')}</h3>
            <p className="text-text-subdued whitespace-pre-line leading-relaxed">
              {listing.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
