import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi, walletApi, listingsApi, bidsApi, favoritesApi, conversationsApi } from '@/api';
import { formatMAD, cn } from '@/lib/utils';
import type { Order, Wallet, Listing, Bid } from '@/types';
import {
  LayoutDashboard, ShoppingBag, Heart, Search, MessageSquare,
  Star, AlertTriangle, Settings, Package, Wallet as WalletIcon,
  CreditCard, Truck, CheckCircle, XCircle, Clock, Bell,
  HelpCircle, Eye
} from 'lucide-react';
import {
  FavoritesPage, SavedSearchesPage, BuyerReviewsPage, BuyerDisputesPage, BuyerPaymentsPage,
  BuyerPurchasesPage, BuyerOrdersPage, BuyerWalletPage, BuyerAuctionsPage,
  BuyerOffersPage, BuyerReceivedOffersPage, BuyerAlertsPage, BuyerMessagesPage
} from './BuyerSubPages';

export function BuyerDashboard() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user } = useAuth();
  const { section } = useParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordersApi.list({ per_page: 50 }).then(({ data }) => setOrders(data.data || [])),
      walletApi.get().then(({ data }) => setWallet(data)),
      favoritesApi.list({ per_page: 20 }).then(({ data }) => setFavorites(data.data || [])),
      bidsApi.myBids({ per_page: 20 }).then(({ data }) => setBids(data.data || [])),
      conversationsApi.unreadCount().then(({ data }) => setUnreadMessages(data.count || 0)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const menuItems = [
    { key: 'tableau_bord', icon: LayoutDashboard, path: '/acheteur' },
    { key: 'profil', icon: Settings, path: '/compte' },
    { key: 'portefeuille', icon: WalletIcon, path: '/acheteur/portefeuille' },
  ];

  const buyerMenu = [
    { key: 'achats', icon: ShoppingBag, path: '/acheteur/achats' },
    { key: 'commandes', icon: Package, path: '/acheteur/commandes' },
    { key: 'paiements', icon: CreditCard, path: '/acheteur/paiements' },
    { key: 'objets_suivis', icon: Eye, path: '/acheteur/favoris' },
    { key: 'encheres_suivees', icon: Clock, path: '/acheteur/encheres' },
    { key: 'offres_envoyees', icon: MessageSquare, path: '/acheteur/offres' },
    { key: 'offres_recues', icon: Bell, path: '/acheteur/offres-recues' },
    { key: 'alertes', icon: Bell, path: '/acheteur/alertes' },
    { key: 'evaluations', icon: Star, path: '/acheteur/evaluations' },
    { key: 'favoris', icon: Heart, path: '/acheteur/favoris' },
    { key: 'recherches', icon: Search, path: '/acheteur/recherches' },
  ];

  const quickActions = [
    { icon: ShoppingBag, label: isAr ? 'مشترياتي' : 'Mes achats', path: '/acheteur/achats' },
    { icon: CreditCard, label: isAr ? 'المدفوعات' : 'Paiements', path: '/acheteur/paiements' },
    { icon: Eye, label: isAr ? 'المتابعة' : 'Objets suivis', path: '/acheteur/favoris', badge: favorites.length || undefined },
    { icon: Clock, label: isAr ? 'licitات متابعة' : 'Encheres suivies', path: '/acheteur/encheres', badge: bids.length || undefined },
    { icon: MessageSquare, label: isAr ? 'عروض واردة' : 'Offres recues', path: '/acheteur/offres-recues' },
    { icon: Heart, label: isAr ? 'المفضلة' : 'Mes favoris', path: '/acheteur/favoris', badge: favorites.length || undefined },
    { icon: Search, label: isAr ? 'بحث محفوظ' : 'Recherches', path: '/acheteur/recherches' },
    { icon: Bell, label: isAr ? 'تنبيهاتي' : 'Mes alertes', path: '/acheteur/alertes' },
    { icon: MessageSquare, label: isAr ? 'رسائلي' : 'Messages', path: '/messages', badge: unreadMessages || undefined },
  ];

  const statusLabels: Record<string, string> = {
    'attente_paiement': isAr ? 'في انتظار الدفع' : 'En attente de paiement',
    'sequestre': isAr ? 'في انتظار الشحن' : "En attente d'expedition",
    'expedie': isAr ? 'في طريق التوصيل' : 'En cours de livraison',
    'livre_confirme': isAr ? 'يحتاج تأكيد' : 'A confirmer (reception)',
    'vire_vendeur': isAr ? 'مكتمل' : 'Termines',
    'rembourse': isAr ? 'ملغى' : 'Annules',
    'litige': isAr ? 'ملغى' : 'Annules',
  };

  const statusCounts = {
    attente_paiement: orders.filter(o => o.statut === 'attente_paiement').length,
    sequestre: orders.filter(o => o.statut === 'sequestre').length,
    expedie: orders.filter(o => o.statut === 'expedie').length,
    livre_confirme: orders.filter(o => o.statut === 'livre_confirme').length,
    termine: orders.filter(o => o.statut === 'vire_vendeur').length,
    annule: orders.filter(o => ['rembourse', 'litige'].includes(o.statut)).length,
  };

  const isActive = (path: string) => {
    if (path === '/acheteur') return !section;
    return section && path.includes(section);
  };

  const renderContent = () => {
    if (section === 'achats') return <BuyerPurchasesPage />;
    if (section === 'commandes') return <BuyerOrdersPage />;
    if (section === 'portefeuille') return <BuyerWalletPage />;
    if (section === 'favoris') return <FavoritesPage />;
    if (section === 'recherches') return <SavedSearchesPage />;
    if (section === 'evaluations') return <BuyerReviewsPage />;
    if (section === 'litiges') return <BuyerDisputesPage />;
    if (section === 'paiements') return <BuyerPaymentsPage />;
    if (section === 'encheres') return <BuyerAuctionsPage />;
    if (section === 'offres') return <BuyerOffersPage />;
    if (section === 'offres-recues') return <BuyerReceivedOffersPage />;
    if (section === 'alertes') return <BuyerAlertsPage />;
    if (section === 'messages') return <BuyerMessagesPage />;

    return (
      <>
        <div className={cn('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6', isAr && 'sm:flex-row-reverse')}>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-cream">
              {isAr ? `! ${user?.pseudo}` : `Bonjour, ${user?.pseudo || 'Collectionneur'} !`}
            </h1>
            <p className="text-xs sm:text-sm text-text-subdued mt-1">
              {isAr ? 'عضو منذ 12 يناير 2023' : `Membre depuis le ${user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-MA') : '12 janvier 2023'}`}
            </p>
          </div>
          <div className={cn('grid grid-cols-4 gap-2 sm:gap-4', isAr && 'sm:flex-row-reverse')}>
            <div className="text-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-1">
                <WalletIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
              </div>
              <p className="text-[10px] sm:text-xs text-text-subdued">{isAr ? 'المحفظة' : 'Portefeuille'}</p>
              <p className="text-xs sm:text-sm font-bold text-cream">{wallet ? formatMAD(wallet.solde_disponible, i18n.language) : '0 MAD'}</p>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-1">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
              </div>
              <p className="text-[10px] sm:text-xs text-text-subdued">{isAr ? 'الطلبات' : 'Commandes'}</p>
              <p className="text-xs sm:text-sm font-bold text-cream">{orders.length}</p>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-1">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
              </div>
              <p className="text-[10px] sm:text-xs text-text-subdued">{isAr ? 'المفضلة' : 'Favoris'}</p>
              <p className="text-xs sm:text-sm font-bold text-cream">{favorites.length}</p>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-1">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
              </div>
              <p className="text-[10px] sm:text-xs text-text-subdued">{isAr ? 'licitات' : 'Encheres'}</p>
              <p className="text-xs sm:text-sm font-bold text-cream">{bids.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {[
              { icon: CreditCard, count: statusCounts.attente_paiement, label: isAr ? 'في انتظار الدفع' : 'En attente de paiement', color: 'text-blue' },
              { icon: Package, count: statusCounts.sequestre, label: isAr ? 'في انتظار الشحن' : "En attente d'expedition", color: 'text-yellow' },
              { icon: Truck, count: statusCounts.expedie, label: isAr ? 'في طريق التوصيل' : 'En cours de livraison', color: 'text-blue' },
              { icon: CheckCircle, count: statusCounts.livre_confirme, label: isAr ? 'يحتاج تأكيد' : 'A confirmer (reception)', color: 'text-green' },
              { icon: CheckCircle, count: statusCounts.termine, label: isAr ? 'مكتمل' : 'Termines', color: 'text-green' },
              { icon: XCircle, count: statusCounts.annule, label: isAr ? 'ملغى' : 'Annules', color: 'text-red' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="text-center">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1', `bg-${item.color}/10`)}>
                    <Icon className={cn('w-5 h-5', item.color)} />
                  </div>
                  <p className="text-xl font-bold text-cream">{item.count}</p>
                  <p className="text-[10px] text-text-subdued leading-tight">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card">
            <div className={cn('p-3 border-b border-gold/10 flex items-center justify-between', isAr && 'flex-row-reverse')}>
              <h3 className="font-semibold text-sm text-cream">{isAr ? 'طلباتي الأخيرة' : 'Mes dernieres commandes'}</h3>
              <Link to="/acheteur/commandes" className="text-xs text-gold">{isAr ? 'عرض الكل' : 'Voir toutes'}</Link>
            </div>
            <div className="p-3 space-y-3">
              {orders.length === 0 ? (
                <p className="text-xs text-text-subdued text-center py-4">{isAr ? 'لا توجد طلبات' : 'Aucune commande'}</p>
              ) : orders.slice(0, 3).map(order => (
                <Link key={order.id} to={`/listings/${order.listing?.numero_auto}`} className={cn('flex items-center gap-3', isAr && 'flex-row-reverse')}>
                  <div className="w-12 h-12 rounded bg-navy-hover overflow-hidden shrink-0">
                    {order.listing?.photos?.[0] ? (
                      <img src={`/storage/${order.listing.photos[0].path}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-subdued"><Package className="w-4 h-4" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-cream truncate">{order.listing?.titre || order.numero_commande}</p>
                    <p className="text-[10px] text-text-subdued">{order.numero_commande}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-cream">{formatMAD(order.total, i18n.language)}</p>
                    <span className={cn('badge text-[8px]', order.statut === 'vire_vendeur' ? 'badge-green' : order.statut === 'attente_paiement' ? 'badge-blue' : 'badge-gold')}>
                      {statusLabels[order.statut]?.substring(0, 15)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <div className={cn('p-3 border-b border-gold/10 flex items-center justify-between', isAr && 'flex-row-reverse')}>
              <h3 className="font-semibold text-sm text-cream">{isAr ? 'licitات متابعة' : 'Mes encheres suivies'}</h3>
              <Link to="/acheteur/encheres" className="text-xs text-gold">{isAr ? 'عرض الكل' : 'Voir toutes'}</Link>
            </div>
            <div className="p-3 space-y-3">
              {bids.length === 0 ? (
                <p className="text-xs text-text-subdued text-center py-4">{isAr ? 'لا توجد licitatات' : 'Aucune enchere'}</p>
              ) : bids.slice(0, 3).map(bid => (
                <Link key={bid.id} to={`/listings/${bid.listing_id}`} className={cn('flex items-center gap-3', isAr && 'flex-row-reverse')}>
                  <div className="w-12 h-12 rounded bg-navy-hover shrink-0 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-text-subdued" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-cream truncate">{isAr ? `إعلان #${bid.listing_id}` : `Annonce #${bid.listing_id}`}</p>
                    <p className="text-[10px] text-text-subdued">{isAr ? 'عرضك' : 'Votre offre'}: {formatMAD(bid.montant, i18n.language)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn('badge text-[8px]', bid.statut === 'gagnee' ? 'badge-green' : bid.statut === 'active' ? 'badge-gold' : 'badge-red')}>
                      {bid.statut === 'active' ? (isAr ? 'نشطة' : 'Active') : (isAr ? 'خاسرة' : 'Perdue')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <div className={cn('p-3 border-b border-gold/10 flex items-center justify-between', isAr && 'flex-row-reverse')}>
              <h3 className="font-semibold text-sm text-cream">{isAr ? 'منتجات أتابعها' : 'Objets que je suis'}</h3>
              <Link to="/acheteur/favoris" className="text-xs text-gold">{isAr ? 'عرض الكل' : 'Voir tous'}</Link>
            </div>
            <div className="p-3 space-y-3">
              {favorites.length === 0 ? (
                <p className="text-xs text-text-subdued text-center py-4">{isAr ? 'لا توجد مفضلات' : 'Aucun favori'}</p>
              ) : favorites.slice(0, 3).map(listing => (
                <Link key={listing.id} to={`/listings/${listing.numero_auto}`} className={cn('flex items-center gap-3', isAr && 'flex-row-reverse')}>
                  <div className="w-12 h-12 rounded bg-navy-hover overflow-hidden shrink-0">
                    {listing.photos?.[0] ? (
                      <img src={`/storage/${listing.photos[0].path}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-subdued"><Heart className="w-4 h-4" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-cream truncate">{listing.titre}</p>
                    <p className="text-[10px] text-text-subdued">{formatMAD(listing.prix_actuel || listing.prix_vente, i18n.language)}</p>
                  </div>
                  <Heart className="w-4 h-4 text-red fill-red shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-4 mb-6">
          <h3 className="font-semibold text-sm text-cream mb-3">{isAr ? 'إجراءات سريعة' : 'Acces rapides'}</h3>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <Link
                  key={i}
                  to={action.path}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-navy-hover transition-colors relative"
                >
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center relative">
                    <Icon className="w-5 h-5 text-gold" />
                    {action.badge && action.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-navy text-[8px] font-bold rounded-full flex items-center justify-center">
                        {action.badge > 9 ? '9+' : action.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-cream text-center leading-tight">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6 text-gold" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-cream">{isAr ? ' besoin d\'aide ?' : 'Besoin d\'aide ?'}</p>
            <p className="text-xs text-text-subdued">{isAr ? 'نحن هنا لمساعدتك' : 'Notre equipe est a votre disposition 24/7'}</p>
          </div>
          <Link to="/aide" className="btn-gold text-sm">
            {isAr ? 'مركز المساعدة' : "Centre d'aide"}
          </Link>
        </div>
      </>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className={cn('flex gap-6', isAr && 'flex-row-reverse')}>
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-navy-card border border-gold/15 rounded-lg p-4 sticky top-24">
            <div className="text-center mb-4 pb-4 border-b border-gold/20">
              <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold text-gold">{user?.pseudo?.[0]?.toUpperCase()}</span>
              </div>
              <p className="text-cream font-medium text-sm">{user?.pseudo}</p>
              <p className="text-text-subdued text-xs">{isAr ? 'مشتري' : 'Acheteur'}</p>
            </div>

            <nav className="space-y-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors',
                      isActive(item.path) ? 'bg-gold/20 text-gold' : 'text-text-subdued hover:bg-navy-hover hover:text-cream',
                      isAr && 'flex-row-reverse'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {t(`compte.${item.key}`)}
                  </Link>
                );
              })}
            </nav>

            <p className="text-[10px] text-gold/60 uppercase tracking-wider mt-4 mb-2 px-3">
              {isAr ? 'شراء' : 'ACHETER'}
            </p>
            <nav className="space-y-0.5">
              {buyerMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors',
                      isActive(item.path) ? 'bg-gold/20 text-gold' : 'text-text-subdued hover:bg-navy-hover hover:text-cream',
                      isAr && 'flex-row-reverse'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t(`compte.${item.key}`)}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
