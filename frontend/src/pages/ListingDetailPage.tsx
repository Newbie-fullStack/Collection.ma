import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Share2, Flag, Clock, User, ChevronLeft, ShoppingCart, MessageSquare, Trophy, BadgeCheck } from 'lucide-react';
import { listingsApi, bidsApi, favoritesApi, conversationsApi, offersApi } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { subscribeToListing, subscribeToListingWon } from '@/lib/echo';
import { useListingSeo } from '@/lib/seo';
import { formatMAD, getRemainingTime, cn } from '@/lib/utils';
import type { Listing } from '@/types';

export function ListingDetailPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { numero_auto } = useParams<{ numero_auto: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isFavori, setIsFavori] = useState(false);
  const [liveBids, setLiveBids] = useState<{ id: number; pseudo: string; montant: number }[]>([]);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  useListingSeo(listing);

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
    listingsApi.getByNumero(numero_auto)
      .then(({ data }) => setListing(data))
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [numero_auto]);

  const isExpired = listing ? !!listing.date_expiration && new Date(listing.date_expiration).getTime() <= Date.now() : false;

  useEffect(() => {
    if (!listing?.date_expiration) return;
    const interval = setInterval(() => {
      setRemaining(getRemainingTime(listing.date_expiration));
    }, 1000);
    setRemaining(getRemainingTime(listing.date_expiration));
    return () => clearInterval(interval);
  }, [listing?.date_expiration]);

  useEffect(() => {
    if (!listing || listing.mode !== 'enchere' || !isAuthenticated) return;

    const listingId = listing.id;
    const channel = subscribeToListing(listingId, (data) => {
      const bidderPseudo = String(data.bidder_pseudo ?? '');
      if (bidderPseudo === user?.pseudo) return;

      const newPrice = Number(data.montant ?? listing.prix_actuel);
      setListing((prev) => prev ? { ...prev, prix_actuel: newPrice } : prev);
      setLiveBids((prev) => [
        { id: Number(data.bid_id), pseudo: bidderPseudo, montant: newPrice },
        ...prev,
      ]);
      setRemaining(getRemainingTime(listing.date_expiration));
      toast('info', `${bidderPseudo} ${t('listing.offre_vivante')} ${formatMAD(newPrice, i18n.language)}`);
    });

    subscribeToListingWon(listingId, (data) => {
      const prix = Number(data.prix_final ?? listing.prix_actuel);
      toast('success', `${isAr ? 'انتهى المزاد!' : t('listing.enchere_terminee')} — ${formatMAD(prix, i18n.language)}`);
      setListing((prev) => prev ? { ...prev, statut: 'vendue', prix_actuel: prix } : prev);
    });

    return () => {
      channel.stopListening('.bid.placed');
    };
  }, [listing?.id, listing?.mode, isAuthenticated, user?.pseudo]);

  const handleBid = async () => {
    if (!listing || !bidAmount) return;
    try {
      await bidsApi.place(listing.id, { montant: parseFloat(bidAmount) });
      const { data } = await listingsApi.get(listing.id);
      setListing(data);
      setBidAmount('');
    } catch (err: any) {
      toast('error', err?.response?.data?.message ?? 'Erreur');
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

  const submitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing || !offerAmount) return;
    setSubmittingOffer(true);
    try {
      await offersApi.create(listing.id, {
        montant: parseFloat(offerAmount),
        message: offerMessage.trim() || undefined,
      });
      toast('success', isAr ? 'تم إرسال عرضك' : t('listing.offre_envoyee'));
      setOfferAmount('');
      setOfferMessage('');
      setOfferOpen(false);
    } catch (err: any) {
      toast('error', err?.response?.data?.message ?? 'Erreur');
    } finally {
      setSubmittingOffer(false);
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
          {listing.mode === 'enchere' && (
            <div className={cn('flex items-center gap-2 mb-4 font-medium', isExpired ? 'text-text-subdued' : 'text-red', isAr && 'flex-row-reverse')}>
              <Clock className="w-5 h-5" />
              {remaining ? (
                <span>
                  {t('listing.temps_restant')}: {remaining.jours}j {remaining.heures}h {remaining.minutes}min {remaining.secondes}s
                </span>
              ) : (
                <Trophy className="w-5 h-5" />
              )}
              {!remaining && (
                <span>
                  {listing.statut === 'vendue'
                    ? (isAr ? 'انتهى المزاد' : t('listing.enchere_terminee'))
                    : (isAr ? 'انتهى الوقت' : t('listing.enchere_terminee'))}
                </span>
              )}
            </div>
          )}

          {/* Live bids history */}
          {(liveBids.length > 0 || (listing.bids && listing.bids.length > 0)) && (
            <div className="mb-4 border border-gold/15 rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="text-xs font-medium text-text-subdued uppercase tracking-wide mb-2">
                {isAr ? 'آخر العروض' : t('listing.historique_offres')}
              </div>
              <ul className="space-y-1.5">
                {[...liveBids, ...(listing.bids ?? []).map((b) => ({
                  id: b.id,
                  pseudo: b.bidder?.pseudo ?? '—',
                  montant: Number(b.montant),
                }))].slice(0, 10).map((b) => (
                  <li key={b.id} className="flex items-center justify-between text-sm">
                    <span className="text-cream">{b.pseudo}</span>
                    <span className="text-gold font-medium">{formatMAD(b.montant, i18n.language)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bid form */}
          {listing.mode === 'enchere' && (
            <div className="mb-4">
              {!remaining ? (
                <div className="flex items-center gap-2 text-text-subdued font-medium">
                  <Trophy className="w-5 h-5" />
                  {t('listing.enchere_terminee')}
                </div>
              ) : (
                <>
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
                </>
              )}
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

          {/* Make an offer (negotiation) */}
          {listing.mode === 'achat_immediat' && (
            <div className="mb-4 border border-gold/15 rounded-lg p-4">
              <div className={cn('flex items-center justify-between', isAr && 'flex-row-reverse')}>
                <div className="text-sm font-semibold text-cream">
                  {isAr ? 'تقديم عرض' : t('listing.faire_offre')}
                </div>
                <button
                  onClick={() => setOfferOpen(v => !v)}
                  className="text-xs text-gold hover:underline"
                >
                  {offerOpen ? (isAr ? 'إخفاء' : 'Fermer') : (isAr ? 'عرض' : 'Ouvrir')}
                </button>
              </div>
              {offerOpen && (
                <form
                  onSubmit={submitOffer}
                  className="mt-3 space-y-3"
                >
                  <div>
                    <label className="block text-xs text-text-subdued mb-1">
                      {isAr ? 'مبلغ عرضك' : 'Montant de votre offre'} (max: {formatMAD(listing.prix_vente, i18n.language)})
                    </label>
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      min={1}
                      max={listing.prix_vente}
                      className="input-field w-full"
                      placeholder={isAr ? 'أدخل المبلغ' : 'Saisissez le montant'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-subdued mb-1">
                      {isAr ? 'رسالة (اختياري)' : 'Message (optionnel)'}
                    </label>
                    <textarea
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      className="input-field w-full"
                      rows={2}
                      maxLength={500}
                      placeholder={isAr ? 'أضف رسالة للبائع' : 'Ajoutez un message au vendeur'}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!offerAmount || submittingOffer}
                    className="btn-gold-outline w-full"
                  >
                    {submittingOffer ? '...' : (isAr ? 'إرسال العرض' : 'Envoyer l\'offre')}
                  </button>
                </form>
              )}
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
                  <div className="font-medium text-cream flex items-center gap-1.5">
                    {listing.seller.pseudo}
                    {listing.seller.est_verifie && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] text-green">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {isAr ? 'متحقق' : 'Vérifié'}
                      </span>
                    )}
                  </div>
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
