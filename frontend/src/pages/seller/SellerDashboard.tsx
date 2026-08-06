import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi, walletApi, listingsApi } from '@/api';
import { formatMAD, getStatusColor, cn } from '@/lib/utils';
import type { Order, Wallet, Listing } from '@/types';
import {
  LayoutDashboard, Package, ShoppingBag, FileText, Wallet as WalletIcon,
  Star, MessageSquare, Settings, PlusCircle, Eye, Clock
} from 'lucide-react';
import { SellerListingsPage } from './SellerListingsPage';
import { SellerInvoicesPage, SellerWithdrawalsPage, SellerSalesPage, SellerOffersPage } from './SellerSubPages';
import { SellerDraftsPage, SellerStatsPage } from './SellerSubPages2';
import { AddListingPage } from './AddListingPage';

export function SellerDashboard() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user } = useAuth();
  const { section } = useParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordersApi.sellerOrders({ per_page: 5 }).then(({ data }) => setOrders(data.data)),
      walletApi.get().then(({ data }) => setWallet(data)),
      listingsApi.myListings({ per_page: 5 }).then(({ data }) => setListings(data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const menuItems = [
    { key: 'tableau_bord', icon: LayoutDashboard, path: '/vendeur' },
    { key: 'ajouter_objet', icon: PlusCircle, path: '/vendeur/ajouter' },
    { key: 'mes_objets', icon: Package, path: '/vendeur/objets' },
    { key: 'brouillons', icon: FileText, path: '/vendeur/brouillons' },
    { key: 'ventes_terminees', icon: ShoppingBag, path: '/vendeur/ventes' },
    { key: 'objets_vendus', icon: Star, path: '/vendeur/vendus' },
    { key: 'offres_recues', icon: MessageSquare, path: '/vendeur/offres' },
    { key: 'factures', icon: FileText, path: '/vendeur/factures' },
    { key: 'retraits', icon: WalletIcon, path: '/vendeur/retraits' },
    { key: 'statistiques', icon: Eye, path: '/vendeur/stats' },
    { key: 'parametres_vendeur', icon: Settings, path: '/vendeur/parametres' },
  ];

  const statCards = [
    { label: isAr ? 'إجمالي المبيعات' : 'Total ventes', value: wallet ? formatMAD(wallet.solde, i18n.language) : '0 Dh', color: 'text-gold' },
    { label: isAr ? 'متاح للسحب' : 'Disponible', value: wallet ? formatMAD(wallet.solde_disponible, i18n.language) : '0 Dh', color: 'text-green' },
    { label: isAr ? 'في الانتظار' : 'En attente', value: wallet ? formatMAD(wallet.solde_en_attente, i18n.language) : '0 Dh', color: 'text-blue' },
    { label: isAr ? 'الإعلانات النشطة' : 'Annonces actives', value: listings.length.toString(), color: 'text-cream' },
    { label: isAr ? 'الطلبات الجارية' : 'Commandes en cours', value: orders.filter(o => ['sequestre', 'expedie'].includes(o.statut)).length.toString(), color: 'text-yellow' },
  ];

  const statusLabels: Record<string, string> = {
    'attente_paiement': isAr ? 'في انتظار الدفع' : 'En attente de paiement',
    'sequestre': isAr ? 'في حجز' : "En attente d'expedition",
    'expedie': isAr ? 'تم الشحن' : 'En cours de livraison',
    'livre_confirme': isAr ? 'تم التأكيد' : 'Livre confirme',
    'vire_vendeur': isAr ? 'تم الدفع' : 'Paiement recu',
    'rembourse': isAr ? 'تم الاسترداد' : 'Rembourse',
    'litige': isAr ? 'نزاع' : 'Litige',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className={cn('flex gap-6', isAr && 'flex-row-reverse')}>
        {/* Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-navy-card border border-gold/15 rounded-lg p-4 sticky top-24">
            <div className="text-center mb-4 pb-4 border-b border-gold/20">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-gold">{user?.pseudo?.[0]?.toUpperCase()}</span>
              </div>
              <p className="text-cream font-medium">{user?.pseudo}</p>
              <p className="text-text-subdued text-xs">{isAr ? 'بائع' : 'Vendeur'}</p>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = item.path === '/vendeur' ? !section : section && item.path.includes(section);
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors',
                      active ? 'bg-gold/20 text-gold' : 'text-text-subdued hover:bg-navy-hover hover:text-cream',
                      isAr && 'flex-row-reverse'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {t(`vendeur.${item.key}`)}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {section === 'ajouter' ? (
            <AddListingPage />
          ) : section === 'objets' ? (
            <SellerListingsPage />
          ) : section === 'brouillons' ? (
            <SellerDraftsPage />
          ) : section === 'vendus' ? (
            <SellerSalesPage />
          ) : section === 'stats' ? (
            <SellerStatsPage />
          ) : section === 'factures' ? (
            <SellerInvoicesPage />
          ) : section === 'retraits' ? (
            <SellerWithdrawalsPage />
          ) : section === 'ventes' ? (
            <SellerSalesPage />
          ) : section === 'offres' ? (
            <SellerOffersPage />
          ) : (
            <>
              <h1 className={cn('text-2xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
                {t('vendeur.tableau_bord')}
              </h1>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {statCards.map((stat, i) => (
                  <div key={i} className="card p-4">
                    <p className="text-xs text-text-subdued mb-1">{stat.label}</p>
                    <p className={cn('text-xl font-bold', stat.color)}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent sales table */}
              <div className="card">
                <div className={cn('p-4 border-b border-gold/10', isAr && 'text-right')}>
                  <h2 className="font-semibold text-cream">{isAr ? 'المبيعات الأخيرة' : 'Mes ventes recentes'}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={cn('border-b border-gold/10 text-xs text-text-subdued', isAr && 'text-right')}>
                        <th className="px-4 py-3 text-left font-medium">{isAr ? 'المنتج' : 'Objet'}</th>
                        <th className="px-4 py-3 text-left font-medium">{isAr ? 'المبلغ' : 'Prix'}</th>
                        <th className="px-4 py-3 text-left font-medium">{isAr ? 'التاريخ' : 'Date'}</th>
                        <th className="px-4 py-3 text-left font-medium">{isAr ? 'الحالة' : 'Statut'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i} className="border-b border-gold/10 animate-pulse">
                            <td className="px-4 py-3"><div className="h-4 bg-navy-hover rounded w-32" /></td>
                            <td className="px-4 py-3"><div className="h-4 bg-navy-hover rounded w-16" /></td>
                            <td className="px-4 py-3"><div className="h-4 bg-navy-hover rounded w-20" /></td>
                            <td className="px-4 py-3"><div className="h-5 bg-navy-hover rounded w-24" /></td>
                          </tr>
                        ))
                      ) : orders.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-text-subdued">
                            {t('commun.aucun_resultat')}
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id} className="border-b border-gold/10 last:border-0">
                            <td className="px-4 py-3">
                              <span className="text-sm text-cream">
                                {order.listing?.titre || order.numero_commande}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-cream">
                                {formatMAD(order.prix, i18n.language)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-text-subdued">
                                {new Date(order.created_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn('badge', getStatusColor(order.statut))}>
                                {statusLabels[order.statut] || order.statut}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
