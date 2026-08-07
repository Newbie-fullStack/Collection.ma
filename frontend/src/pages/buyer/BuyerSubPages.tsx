import { useTranslation } from 'react-i18next';
import { cn, formatMAD } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Heart, Search, Star, AlertTriangle, Wallet, FileText, Clock, CheckCircle,
  ShoppingBag, Package, CreditCard, Truck, Eye, MessageSquare, Bell, Send,
  Download, ArrowUpRight, ArrowDownLeft, Filter, XCircle
} from 'lucide-react';
import type { Listing, Order, WalletTransaction, Bid, Wallet as WalletType, Review, Dispute } from '@/types';
import { useState, useEffect } from 'react';
import { favoritesApi, ordersApi, walletApi, bidsApi, reviewsApi, disputesApi, conversationsApi } from '@/api';

function PageHeader({ title, isAr }: { title: string; isAr: boolean }) {
  return (
    <h2 className={cn('text-xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
      {title}
    </h2>
  );
}

function EmptyState({ icon: Icon, message, actionLabel, actionPath }: { icon: React.ElementType; message: string; actionLabel?: string; actionPath?: string }) {
  return (
    <div className="card p-8 text-center">
      <Icon className="w-12 h-12 text-text-subdued mx-auto mb-3" />
      <p className="text-text-subdued">{message}</p>
      {actionLabel && actionPath && (
        <Link to={actionPath} className="btn-gold mt-4 inline-block">{actionLabel}</Link>
      )}
    </div>
  );
}

function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 animate-pulse flex gap-4">
          <div className="w-16 h-16 bg-navy-hover rounded shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-navy-hover rounded w-1/3" />
            <div className="h-3 bg-navy-hover rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ACHATS ──────────────────────────────────────────────
export function BuyerPurchasesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    ordersApi.list({ per_page: 50 })
      .then(({ data }) => setOrders(data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.statut === filter);

  const statutLabel: Record<string, string> = {
    attente_paiement: isAr ? 'في انتظار الدفع' : 'En attente de paiement',
    sequestre: isAr ? 'محتجز (escrow)' : 'Séquestre actif',
    expedie: isAr ? 'تم الشحن' : 'Expédié',
    livre_confirme: isAr ? 'تم التوصيل' : 'Livré & confirmé',
    vire_vendeur: isAr ? 'مكتمل' : 'Terminé',
    rembourse: isAr ? 'مسترد' : 'Remboursé',
    litige: isAr ? 'متنازع' : 'En litige',
  };

  return (
    <div>
      <PageHeader title={isAr ? 'مشترياتي' : 'Mes achats'} isAr={isAr} />

      <div className={cn('flex gap-2 mb-4 flex-wrap', isAr && 'flex-row-reverse')}>
        {[
          { key: 'all', label: isAr ? 'الكل' : 'Tous' },
          { key: 'attente_paiement', label: isAr ? 'بانتظار الدفع' : 'À payer' },
          { key: 'sequestre', label: isAr ? 'محتجز' : 'En séquestre' },
          { key: 'expedie', label: isAr ? 'مشحون' : 'Expédié' },
          { key: 'livre_confirme', label: isAr ? 'مكتمل' : 'Terminé' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', filter === f.key ? 'bg-gold text-navy' : 'bg-navy-hover text-text-subdued hover:bg-gold/10')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={ShoppingBag} message={isAr ? 'لا توجد مشتريات' : 'Aucun achat'} actionLabel={isAr ? 'تصفح الإعلانات' : 'Voir les annonces'} actionPath="/listings" />
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <Link key={order.id} to={`/listings/${order.listing?.numero_auto}`} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded bg-navy-hover overflow-hidden shrink-0">
                {order.listing?.photos?.[0] ? (
                  <img src={`/storage/${order.listing.photos[0].path}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-subdued"><Package className="w-6 h-6" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-cream truncate">{order.listing?.titre || order.numero_commande}</h3>
                <p className="text-xs text-text-subdued">{isAr ? 'رقم الطلب' : 'N°'} {order.numero_commande}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-cream">{formatMAD(order.total, i18n.language)}</p>
                <span className={cn('badge text-[10px]', order.statut === 'vire_vendeur' ? 'badge-green' : order.statut === 'attente_paiement' ? 'badge-blue' : 'badge-gold')}>
                  {statutLabel[order.statut]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── COMMANDES ───────────────────────────────────────────
export function BuyerOrdersPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    ordersApi.list({ per_page: 50 })
      .then(({ data }) => setOrders(data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.statut === filter);

  const statutLabel: Record<string, string> = {
    attente_paiement: isAr ? 'في انتظار الدفع' : 'En attente de paiement',
    sequestre: isAr ? 'في انتظار الشحن' : "En attente d'expédition",
    expedie: isAr ? 'في الطريق' : 'En cours de livraison',
    livre_confirme: isAr ? 'يحتاج تأكيد' : 'À confirmer',
    vire_vendeur: isAr ? 'مكتمل' : 'Terminé',
    rembourse: isAr ? 'مسترد' : 'Remboursé',
    litige: isAr ? 'متنازع' : 'En litige',
  };

  const statutColor: Record<string, string> = {
    attente_paiement: 'badge-blue',
    sequestre: 'badge-gold',
    expedie: 'badge-blue',
    livre_confirme: 'badge-green',
    vire_vendeur: 'badge-green',
    rembourse: 'badge-red',
    litige: 'badge-red',
  };

  const steps = [
    { key: 'attente_paiement', icon: CreditCard, label: isAr ? 'الدفع' : 'Paiement' },
    { key: 'sequestre', icon: Package, label: isAr ? 'الشحن' : 'Expédition' },
    { key: 'expedie', icon: Truck, label: isAr ? 'التوصيل' : 'Livraison' },
    { key: 'livre_confirme', icon: CheckCircle, label: isAr ? 'التأكيد' : 'Confirmation' },
    { key: 'vire_vendeur', icon: CheckCircle, label: isAr ? 'مكتمل' : 'Terminé' },
  ];

  const stepIndex = (statut: string) => steps.findIndex(s => s.key === statut);

  const handleConfirm = async (orderId: number) => {
    if (!window.confirm(isAr ? 'تأكيد استلام الطلب؟' : 'Confirmer la réception de la commande ?')) return;
    try {
      await ordersApi.confirmReception(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, statut: 'vire_vendeur' } : o));
    } catch (err: any) {
      alert(err.response?.data?.message || (isAr ? 'خطأ' : 'Erreur'));
    }
  };

  return (
    <div>
      <PageHeader title={isAr ? 'طلباتي' : 'Mes commandes'} isAr={isAr} />

      <div className={cn('flex gap-2 mb-4 flex-wrap', isAr && 'flex-row-reverse')}>
        {[
          { key: 'all', label: isAr ? 'الكل' : 'Toutes' },
          { key: 'attente_paiement', label: isAr ? 'بانتظار الدفع' : 'En attente' },
          { key: 'sequestre', label: isAr ? 'محتجز' : 'Séquestre' },
          { key: 'expedie', label: isAr ? 'مشحون' : 'Expédié' },
          { key: 'livre_confirme', label: isAr ? 'للتأكيد' : 'À confirmer' },
          { key: 'vire_vendeur', label: isAr ? 'مكتمل' : 'Terminé' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', filter === f.key ? 'bg-gold text-navy' : 'bg-navy-hover text-text-subdued hover:bg-gold/10')}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={Package} message={isAr ? 'لا توجد طلبات' : 'Aucune commande'} actionLabel={isAr ? 'تصفح الإعلانات' : 'Voir les annonces'} actionPath="/listings" />
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const idx = stepIndex(order.statut);
            return (
              <div key={order.id} className="card p-4">
                <div className={cn('flex items-center gap-4 mb-3', isAr && 'flex-row-reverse')}>
                  <div className="w-14 h-14 rounded bg-navy-hover overflow-hidden shrink-0">
                    {order.listing?.photos?.[0] ? (
                      <img src={`/storage/${order.listing.photos[0].path}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-subdued"><Package className="w-5 h-5" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/listings/${order.listing?.numero_auto}`} className="font-medium text-sm text-cream hover:text-gold truncate block">{order.listing?.titre}</Link>
                    <p className="text-xs text-text-subdued">{isAr ? 'بائع' : 'Vendeur'}: {order.seller?.pseudo}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-cream">{formatMAD(order.total, i18n.language)}</p>
                    <span className={cn('badge text-[10px]', statutColor[order.statut])}>{statutLabel[order.statut]}</span>
                  </div>
                </div>
                <div className={cn('flex items-center gap-1', isAr && 'flex-row-reverse')}>
                  {steps.map((step, si) => {
                    const StepIcon = step.icon;
                    const done = si < idx;
                    const current = si === idx;
                    return (
                      <div key={step.key} className="flex-1 flex flex-col items-center">
                        <div className={cn('w-7 h-7 rounded-full flex items-center justify-center mb-1', done ? 'bg-gold text-navy' : current ? 'bg-gold/20 text-gold ring-2 ring-gold' : 'bg-navy-hover text-text-subdued')}>
                          <StepIcon className="w-3.5 h-3.5" />
                        </div>
                        <p className={cn('text-[9px] text-center', current ? 'text-gold font-medium' : 'text-text-subdued')}>{step.label}</p>
                      </div>
                    );
                  })}
                </div>
                {order.tracking_number && (
                  <p className={cn('text-xs text-text-subdued mt-2', isAr && 'text-right')}>
                    {isAr ? 'رقم التتبع' : 'Tracking'}: <span className="font-mono">{order.tracking_number}</span>
                  </p>
                )}
                {order.statut === 'expedie' && (
                  <div className={cn('mt-3', isAr && 'text-right')}>
                    <button
                      onClick={() => handleConfirm(order.id)}
                      className="btn-gold px-4 py-2 text-sm"
                    >
                      {isAr ? 'تأكيد الاستلام' : 'J\'ai reçu la commande'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PORTEFEUILLE ────────────────────────────────────────
export function BuyerWalletPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      walletApi.get().then(({ data }) => setWallet(data)),
      walletApi.transactions({ per_page: 50 }).then(({ data }) => setTransactions(data.data || [])),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const txLabel: Record<string, string> = {
    depot: isAr ? 'إيداع' : 'Dépôt',
    encaissement: isAr ? 'تحصيل' : 'Encaissement',
    commission: isAr ? 'عمولة' : 'Commission',
    virement_vendeur: isAr ? 'تحويل للبائع' : 'Virement vendeur',
    remboursement: isAr ? 'استرداد' : 'Remboursement',
    retrait: isAr ? 'سحب' : 'Retrait',
  };

  const txIcon: Record<string, React.ElementType> = {
    depot: ArrowDownLeft,
    encaissement: ArrowDownLeft,
    commission: ArrowUpRight,
    virement_vendeur: ArrowUpRight,
    remboursement: ArrowDownLeft,
    retrait: ArrowUpRight,
  };

  return (
    <div>
      <PageHeader title={isAr ? 'محفظتي' : 'Mon portefeuille'} isAr={isAr} />

      {loading ? <LoadingSkeleton count={2} /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card p-4 text-center">
              <Wallet className="w-8 h-8 text-gold mx-auto mb-2" />
              <p className="text-xs text-text-subdued">{isAr ? 'الرصيد الحالي' : 'Solde actuel'}</p>
              <p className="text-xl font-bold text-cream">{wallet ? formatMAD(wallet.solde, i18n.language) : '0 MAD'}</p>
            </div>
            <div className="card p-4 text-center">
              <Clock className="w-8 h-8 text-yellow mx-auto mb-2" />
              <p className="text-xs text-text-subdued">{isAr ? 'الرصيد المعلق' : 'Solde en attente'}</p>
              <p className="text-xl font-bold text-cream">{wallet ? formatMAD(wallet.solde_en_attente, i18n.language) : '0 MAD'}</p>
            </div>
            <div className="card p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green mx-auto mb-2" />
              <p className="text-xs text-text-subdued">{isAr ? 'الرصيد المتاح' : 'Solde disponible'}</p>
              <p className="text-xl font-bold text-cream">{wallet ? formatMAD(wallet.solde_disponible, i18n.language) : '0 MAD'}</p>
            </div>
          </div>

          <div className="card">
            <div className={cn('p-3 border-b border-gold/10', isAr && 'text-right')}>
              <h3 className="font-semibold text-sm text-cream">{isAr ? 'المعاملات' : 'Transactions'}</h3>
            </div>
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-text-subdued text-sm">{isAr ? 'لا توجد معاملات' : 'Aucune transaction'}</div>
            ) : (
              <div className="divide-y divide-gold/10">
                {transactions.map(tx => {
                  const Icon = txIcon[tx.type] || ArrowDownLeft;
                  const isCredit = ['depot', 'encaissement', 'remboursement'].includes(tx.type);
                  return (
                    <div key={tx.id} className={cn('p-3 flex items-center gap-3', isAr && 'flex-row-reverse')}>
                      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', isCredit ? 'bg-green/10' : 'bg-red/10')}>
                        <Icon className={cn('w-4 h-4', isCredit ? 'text-green' : 'text-red')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-cream">{txLabel[tx.type]}</p>
                        <p className="text-xs text-text-subdued truncate">{tx.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn('text-sm font-bold', isCredit ? 'text-green' : 'text-red')}>
                          {isCredit ? '+' : '-'}{formatMAD(tx.montant, i18n.language)}
                        </p>
                        <p className="text-[10px] text-text-subdued">{new Date(tx.created_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── ENCHÈRES SUIVIES ────────────────────────────────────
export function BuyerAuctionsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bidsApi.myBids({ per_page: 50 })
      .then(({ data }) => setBids(data.data || []))
      .catch(() => setBids([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={isAr ? 'licitات متابعة' : 'Mes enchères suivies'} isAr={isAr} />

      {loading ? <LoadingSkeleton /> : bids.length === 0 ? (
        <EmptyState icon={Clock} message={isAr ? 'لا توجد licitatات' : 'Aucune enchère suivie'} actionLabel={isAr ? 'تصفح الإعلانات' : 'Voir les enchères'} actionPath="/listings?mode=enchere" />
      ) : (
        <div className="space-y-3">
          {bids.map(bid => (
            <Link key={bid.id} to={`/listings/${bid.listing_id}`} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded bg-navy-hover shrink-0 flex items-center justify-center">
                <Clock className="w-6 h-6 text-text-subdued" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-cream truncate">{isAr ? 'إعلان #${bid.listing_id}' : `Annonce #${bid.listing_id}`}</p>
                <p className="text-xs text-text-subdued">{isAr ? 'عرضك' : 'Votre offre'}: <span className="font-bold text-gold">{formatMAD(bid.montant, i18n.language)}</span></p>
                {bid.auto_bid_max && (
                  <p className="text-[10px] text-text-subdued">{isAr ? 'الحد الأقصى' : 'Max auto'}: {formatMAD(bid.auto_bid_max, i18n.language)}</p>
                )}
              </div>
              <span className={cn('badge text-[10px]', bid.statut === 'gagnee' ? 'badge-green' : bid.statut === 'active' ? 'badge-gold' : 'badge-red')}>
                {bid.statut === 'gagnee' ? (isAr ? 'فاز' : 'Gagnee') : bid.statut === 'active' ? (isAr ? 'نشطة' : 'Active') : (isAr ? 'خاسرة' : 'Perdue')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── OFFRES ENVOYÉES ─────────────────────────────────────
export function BuyerOffersPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bidsApi.myBids({ per_page: 50 })
      .then(({ data }) => setBids(data.data || []))
      .catch(() => setBids([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={isAr ? 'العروض المرسلة' : 'Offres envoyées'} isAr={isAr} />

      {loading ? <LoadingSkeleton /> : bids.length === 0 ? (
        <EmptyState
          icon={Send}
          message={isAr ? 'لم ترسل أي عرض بعد' : 'Aucune offre envoyée'}
          actionLabel={isAr ? 'تصفح الإعلانات' : 'Voir les annonces'}
          actionPath="/listings"
        />
      ) : (
        <div className="space-y-3">
          {bids.map(bid => (
            <Link key={bid.id} to={`/listings/${bid.listing_id}`} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded bg-cream shrink-0 flex items-center justify-center">
                <Clock className="w-6 h-6 text-brown-light/30" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-brown-dark truncate">{isAr ? `إعلان #${bid.listing_id}` : `Annonce #${bid.listing_id}`}</p>
                <p className="text-xs text-brown-light/60">{isAr ? 'عرضك' : 'Votre offre'}: <span className="font-bold text-gold">{formatMAD(bid.montant, i18n.language)}</span></p>
                {bid.auto_bid_max && (
                  <p className="text-[10px] text-brown-light/50">{isAr ? 'الحد الأقصى' : 'Max auto'}: {formatMAD(bid.auto_bid_max, i18n.language)}</p>
                )}
              </div>
              <span className={cn('badge text-[10px]', bid.statut === 'gagnee' ? 'badge-green' : bid.statut === 'active' ? 'badge-gold' : 'badge-red')}>
                {bid.statut === 'gagnee' ? (isAr ? 'فاز' : 'Gagnée') : bid.statut === 'active' ? (isAr ? 'نشطة' : 'Active') : (isAr ? 'خاسرة' : 'Perdue')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── OFFRES REÇUES ───────────────────────────────────────
export function BuyerReceivedOffersPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div>
      <PageHeader title={isAr ? 'العروض الواردة' : 'Offres reçues'} isAr={isAr} />
      <EmptyState
        icon={Bell}
        message={isAr ? 'لا توجد عروض واردة' : 'Aucune offre reçue'}
        actionLabel={isAr ? 'تصفح الإعلانات' : 'Voir les annonces'}
        actionPath="/listings"
      />
    </div>
  );
}

// ─── ALERTES ─────────────────────────────────────────────
export function BuyerAlertsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch notifications as alerts
    import('@/api').then(({ notificationsApi }) =>
      notificationsApi.list({ per_page: 50 })
        .then(({ data }) => setNotifications(data.data || []))
        .catch(() => setNotifications([]))
        .finally(() => setLoading(false))
    );
  }, []);

  return (
    <div>
      <PageHeader title={isAr ? 'تنبيهاتي' : 'Mes alertes'} isAr={isAr} />

      {loading ? <LoadingSkeleton /> : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          message={isAr ? 'لم تنشأ أي تنبيهات بعد' : 'Aucune alerte créée'}
          actionLabel={isAr ? 'بحث متقدم' : 'Recherche avancée'}
          actionPath="/recherche"
        />
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <div key={notif.id} className="card p-4">
              <div className={cn('flex items-start gap-3', isAr && 'flex-row-reverse')}>
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', notif.read ? 'bg-navy-hover' : 'bg-gold/10')}>
                  <Bell className={cn('w-4 h-4', notif.read ? 'text-text-subdued' : 'text-gold')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium text-cream', isAr && 'text-right')}>{notif.title}</p>
                  <p className={cn('text-xs text-text-subdued', isAr && 'text-right')}>{notif.message}</p>
                  <p className={cn('text-[10px] text-text-subdued mt-1', isAr && 'text-right')}>
                    {new Date(notif.created_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MESSAGES ────────────────────────────────────────────
export function BuyerMessagesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    conversationsApi.list({ per_page: 20 })
      .then(({ data }) => setConversations(data.data || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={isAr ? 'رسائلي' : 'Mes messages'} isAr={isAr} />

      {loading ? <LoadingSkeleton /> : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          message={isAr ? 'لا توجد رسائل بعد' : 'Aucun message'}
          actionLabel={isAr ? 'تواصل معنا' : 'Contacter le support'}
          actionPath="/aide"
        />
      ) : (
        <div className="space-y-3">
          {conversations.map(conv => (
            <Link
              key={conv.id}
              to={`/messages/${conv.id}`}
              className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-cream truncate">
                  {conv.listing?.titre || isAr ? 'محادثة' : 'Conversation'}
                </p>
                <p className="text-xs text-text-subdued truncate">
                  {conv.last_message?.message || isAr ? 'لا توجد رسائل' : 'Aucun message'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-text-subdued">
                  {conv.last_message?.created_at ? new Date(conv.last_message.created_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA') : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FAVORITES (existing) ────────────────────────────────
export function FavoritesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoritesApi.list({ per_page: 20 })
      .then(({ data }) => setFavorites(data.data || []))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={isAr ? 'المفضلة' : 'Mes favoris'} isAr={isAr} />

      {loading ? <LoadingSkeleton /> : favorites.length === 0 ? (
        <EmptyState icon={Heart} message={isAr ? 'لا توجد مفضلات' : 'Aucun favori'} actionLabel={isAr ? 'تصفح الإعلانات' : 'Voir les annonces'} actionPath="/listings" />
      ) : (
        <div className="space-y-3">
          {favorites.map(listing => (
            <Link key={listing.id} to={`/listings/${listing.numero_auto}`} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded bg-navy-hover overflow-hidden shrink-0">
                {listing.photos?.[0] ? (
                  <img src={`/storage/${listing.photos[0].path}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-subdued"><Heart className="w-6 h-6" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-cream truncate">{listing.titre}</h3>
                <span className="text-gold font-semibold text-sm">{formatMAD(listing.prix_actuel || listing.prix_vente, i18n.language)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SAVED SEARCHES ─────────────────────────────────────
export function SavedSearchesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div>
      <PageHeader title={isAr ? 'عمليات البحث المحفوظة' : 'Recherches sauvegardées'} isAr={isAr} />
      <EmptyState icon={Search} message={isAr ? 'لا توجد عمليات بحث محفوظة' : 'Aucune recherche sauvegardée'} actionLabel={isAr ? 'بحث متقدم' : 'Recherche avancée'} actionPath="/recherche" />
    </div>
  );
}

// ─── REVIEWS ─────────────────────────────────────────────
export function BuyerReviewsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewsApi.list({ per_page: 50 })
      .then(({ data }) => setReviews(data.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={isAr ? 'تقييماتي' : 'Mes avis'} isAr={isAr} />

      {loading ? <LoadingSkeleton /> : reviews.length === 0 ? (
        <EmptyState icon={Star} message={isAr ? 'لا توجد تقييمات بعد' : 'Aucun avis'} />
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className="card p-4">
              <div className={cn('flex items-center justify-between mb-2', isAr && 'flex-row-reverse')}>
                <div className={cn('flex items-center gap-2', isAr && 'flex-row-reverse')}>
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <Star className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cream">{review.reviewer?.pseudo || 'Utilisateur'}</p>
                    <p className="text-[10px] text-text-subdued">
                      {isAr ? 'طلب' : 'Commande'} #{review.order_id}
                    </p>
                  </div>
                </div>
                <div className={cn('flex items-center gap-1', isAr && 'flex-row-reverse')}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={cn('w-4 h-4', star <= review.note ? 'text-gold fill-gold' : 'text-text-subdued')}
                    />
                  ))}
                </div>
              </div>
              {review.commentaire && (
                <p className={cn('text-sm text-text-subdued', isAr && 'text-right')}>
                  {review.commentaire}
                </p>
              )}
              <p className={cn('text-[10px] text-text-subdued mt-2', isAr && 'text-right')}>
                {new Date(review.created_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DISPUTES ────────────────────────────────────────────
export function BuyerDisputesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    disputesApi.list({ per_page: 50 })
      .then(({ data }) => setDisputes(data.data || []))
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false));
  }, []);

  const statutLabel: Record<string, string> = {
    ouvert: isAr ? 'مفتوح' : 'Ouvert',
    en_cours: isAr ? 'قيد المعالجة' : 'En cours',
    resolu: isAr ? 'تم الحل' : 'Résolu',
    ferme: isAr ? 'مغلق' : 'Fermé',
  };

  return (
    <div>
      <PageHeader title={isAr ? 'الlitiges' : 'Mes litiges'} isAr={isAr} />

      {loading ? <LoadingSkeleton /> : disputes.length === 0 ? (
        <EmptyState icon={AlertTriangle} message={isAr ? 'لا توجد مشاكل' : 'Aucun litige'} />
      ) : (
        <div className="space-y-3">
          {disputes.map(dispute => (
            <div key={dispute.id} className="card p-4">
              <div className={cn('flex items-center justify-between mb-2', isAr && 'flex-row-reverse')}>
                <div>
                  <p className="text-sm font-medium text-cream">{dispute.raison}</p>
                  <p className="text-[10px] text-text-subdued">
                    {isAr ? 'طلب' : 'Commande'} #{dispute.order_id}
                  </p>
                </div>
                <span className={cn('badge text-[10px]', dispute.statut === 'resolu' ? 'badge-green' : dispute.statut === 'ouvert' ? 'badge-red' : 'badge-gold')}>
                  {statutLabel[dispute.statut] || dispute.statut}
                </span>
              </div>
              <p className={cn('text-sm text-text-subdued line-clamp-2', isAr && 'text-right')}>
                {dispute.description}
              </p>
              <p className={cn('text-[10px] text-text-subdued mt-2', isAr && 'text-right')}>
                {new Date(dispute.created_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PAYMENTS ────────────────────────────────────────────
export function BuyerPaymentsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    walletApi.transactions({ per_page: 50 })
      .then(({ data }) => setTransactions(data.data || []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  const txLabel: Record<string, string> = {
    depot: isAr ? 'إيداع' : 'Dépôt',
    encaissement: isAr ? 'تحصيل' : 'Encaissement',
    commission: isAr ? 'عمولة' : 'Commission',
    virement_vendeur: isAr ? 'تحويل للبائع' : 'Virement vendeur',
    remboursement: isAr ? 'استرداد' : 'Remboursement',
    retrait: isAr ? 'سحب' : 'Retrait',
  };

  return (
    <div>
      <PageHeader title={isAr ? 'المدفوعات' : 'Mes paiements'} isAr={isAr} />

      {loading ? <LoadingSkeleton /> : transactions.length === 0 ? (
        <EmptyState icon={Wallet} message={isAr ? 'لا توجد مدفوعات بعد' : 'Aucun paiement'} />
      ) : (
        <div className="card">
          <div className="divide-y divide-gold/10">
            {transactions.map(tx => {
              const isCredit = ['depot', 'encaissement', 'remboursement'].includes(tx.type);
              return (
                <div key={tx.id} className={cn('p-3 flex items-center gap-3', isAr && 'flex-row-reverse')}>
                  <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', isCredit ? 'bg-green/10' : 'bg-red/10')}>
                    {isCredit ? <ArrowDownLeft className="w-4 h-4 text-green" /> : <ArrowUpRight className="w-4 h-4 text-red" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cream">{txLabel[tx.type]}</p>
                    <p className="text-xs text-text-subdued truncate">{tx.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn('text-sm font-bold', isCredit ? 'text-green' : 'text-red')}>
                      {isCredit ? '+' : '-'}{formatMAD(tx.montant, i18n.language)}
                    </p>
                    <p className="text-[10px] text-text-subdued">{new Date(tx.created_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
