import { useTranslation } from 'react-i18next';
import { cn, formatMAD } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Heart, Search, Star, AlertTriangle, Wallet, FileText, Clock, CheckCircle,
  ShoppingBag, Package, CreditCard, Truck, Eye, MessageSquare, Bell, Send,
  Download, ArrowUpRight, ArrowDownLeft, Filter, XCircle
} from 'lucide-react';
import type { Listing, Order, WalletTransaction, Bid, Wallet as WalletType, Review, Dispute, SavedSearch } from '@/types';
import { useState, useEffect } from 'react';
import { favoritesApi, ordersApi, walletApi, bidsApi, reviewsApi, disputesApi, conversationsApi, savedSearchesApi } from '@/api';

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

// â”€â”€â”€ ACHATS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    attente_paiement: isAr ? 'ÙÙŠ Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ø¯ÙØ¹' : 'En attente de paiement',
    sequestre: isAr ? 'Ù…Ø­ØªØ¬Ø² (escrow)' : 'SÃ©questre actif',
    expedie: isAr ? 'ØªÙ… Ø§Ù„Ø´Ø­Ù†' : 'ExpÃ©diÃ©',
    livre_confirme: isAr ? 'ØªÙ… Ø§Ù„ØªÙˆØµÙŠÙ„' : 'LivrÃ© & confirmÃ©',
    vire_vendeur: isAr ? 'Ù…ÙƒØªÙ…Ù„' : 'TerminÃ©',
    rembourse: isAr ? 'Ù…Ø³ØªØ±Ø¯' : 'RemboursÃ©',
    litige: isAr ? 'Ù…ØªÙ†Ø§Ø²Ø¹' : 'En litige',
  };

  return (
    <div>
      <PageHeader title={isAr ? 'Ù…Ø´ØªØ±ÙŠØ§ØªÙŠ' : 'Mes achats'} isAr={isAr} />

      <div className={cn('flex gap-2 mb-4 flex-wrap', isAr && 'flex-row-reverse')}>
        {[
          { key: 'all', label: isAr ? 'Ø§Ù„ÙƒÙ„' : 'Tous' },
          { key: 'attente_paiement', label: isAr ? 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ø¯ÙØ¹' : 'Ã€ payer' },
          { key: 'sequestre', label: isAr ? 'Ù…Ø­ØªØ¬Ø²' : 'En sÃ©questre' },
          { key: 'expedie', label: isAr ? 'Ù…Ø´Ø­ÙˆÙ†' : 'ExpÃ©diÃ©' },
          { key: 'livre_confirme', label: isAr ? 'Ù…ÙƒØªÙ…Ù„' : 'TerminÃ©' },
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
        <EmptyState icon={ShoppingBag} message={isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø´ØªØ±ÙŠØ§Øª' : 'Aucun achat'} actionLabel={isAr ? 'ØªØµÙØ­ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª' : 'Voir les annonces'} actionPath="/listings" />
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
                <p className="text-xs text-text-subdued">{isAr ? 'Ø±Ù‚Ù… Ø§Ù„Ø·Ù„Ø¨' : 'NÂ°'} {order.numero_commande}</p>
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

// â”€â”€â”€ COMMANDES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    attente_paiement: isAr ? 'ÙÙŠ Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ø¯ÙØ¹' : 'En attente de paiement',
    sequestre: isAr ? 'ÙÙŠ Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ø´Ø­Ù†' : "En attente d'expÃ©dition",
    expedie: isAr ? 'ÙÙŠ Ø§Ù„Ø·Ø±ÙŠÙ‚' : 'En cours de livraison',
    livre_confirme: isAr ? 'ÙŠØ­ØªØ§Ø¬ ØªØ£ÙƒÙŠØ¯' : 'Ã€ confirmer',
    vire_vendeur: isAr ? 'Ù…ÙƒØªÙ…Ù„' : 'TerminÃ©',
    rembourse: isAr ? 'Ù…Ø³ØªØ±Ø¯' : 'RemboursÃ©',
    litige: isAr ? 'Ù…ØªÙ†Ø§Ø²Ø¹' : 'En litige',
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
    { key: 'attente_paiement', icon: CreditCard, label: isAr ? 'Ø§Ù„Ø¯ÙØ¹' : 'Paiement' },
    { key: 'sequestre', icon: Package, label: isAr ? 'Ø§Ù„Ø´Ø­Ù†' : 'ExpÃ©dition' },
    { key: 'expedie', icon: Truck, label: isAr ? 'Ø§Ù„ØªÙˆØµÙŠÙ„' : 'Livraison' },
    { key: 'livre_confirme', icon: CheckCircle, label: isAr ? 'Ø§Ù„ØªØ£ÙƒÙŠØ¯' : 'Confirmation' },
    { key: 'vire_vendeur', icon: CheckCircle, label: isAr ? 'Ù…ÙƒØªÙ…Ù„' : 'TerminÃ©' },
  ];

  const stepIndex = (statut: string) => steps.findIndex(s => s.key === statut);

  const handleConfirm = async (orderId: number) => {
    if (!window.confirm(isAr ? 'ØªØ£ÙƒÙŠØ¯ Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ø·Ù„Ø¨ØŸ' : 'Confirmer la rÃ©ception de la commande ?')) return;
    try {
      await ordersApi.confirmReception(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, statut: 'vire_vendeur' } : o));
    } catch (err: any) {
      alert(err.response?.data?.message || (isAr ? 'Ø®Ø·Ø£' : 'Erreur'));
    }
  };

  return (
    <div>
      <PageHeader title={isAr ? 'Ø·Ù„Ø¨Ø§ØªÙŠ' : 'Mes commandes'} isAr={isAr} />

      <div className={cn('flex gap-2 mb-4 flex-wrap', isAr && 'flex-row-reverse')}>
        {[
          { key: 'all', label: isAr ? 'Ø§Ù„ÙƒÙ„' : 'Toutes' },
          { key: 'attente_paiement', label: isAr ? 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ø¯ÙØ¹' : 'En attente' },
          { key: 'sequestre', label: isAr ? 'Ù…Ø­ØªØ¬Ø²' : 'SÃ©questre' },
          { key: 'expedie', label: isAr ? 'Ù…Ø´Ø­ÙˆÙ†' : 'ExpÃ©diÃ©' },
          { key: 'livre_confirme', label: isAr ? 'Ù„Ù„ØªØ£ÙƒÙŠØ¯' : 'Ã€ confirmer' },
          { key: 'vire_vendeur', label: isAr ? 'Ù…ÙƒØªÙ…Ù„' : 'TerminÃ©' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', filter === f.key ? 'bg-gold text-navy' : 'bg-navy-hover text-text-subdued hover:bg-gold/10')}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={Package} message={isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª' : 'Aucune commande'} actionLabel={isAr ? 'ØªØµÙØ­ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª' : 'Voir les annonces'} actionPath="/listings" />
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
                    <p className="text-xs text-text-subdued">{isAr ? 'Ø¨Ø§Ø¦Ø¹' : 'Vendeur'}: {order.seller?.pseudo}</p>
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
                    {isAr ? 'Ø±Ù‚Ù… Ø§Ù„ØªØªØ¨Ø¹' : 'Tracking'}: <span className="font-mono">{order.tracking_number}</span>
                  </p>
                )}
                {order.statut === 'expedie' && (
                  <div className={cn('mt-3', isAr && 'text-right')}>
                    <button
                      onClick={() => handleConfirm(order.id)}
                      className="btn-gold px-4 py-2 text-sm"
                    >
                      {isAr ? 'ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…' : 'J\'ai reÃ§u la commande'}
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

// â”€â”€â”€ PORTEFEUILLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    depot: isAr ? 'Ø¥ÙŠØ¯Ø§Ø¹' : 'DÃ©pÃ´t',
    encaissement: isAr ? 'ØªØ­ØµÙŠÙ„' : 'Encaissement',
    commission: isAr ? 'Ø¹Ù…ÙˆÙ„Ø©' : 'Commission',
    virement_vendeur: isAr ? 'ØªØ­ÙˆÙŠÙ„ Ù„Ù„Ø¨Ø§Ø¦Ø¹' : 'Virement vendeur',
    remboursement: isAr ? 'Ø§Ø³ØªØ±Ø¯Ø§Ø¯' : 'Remboursement',
    retrait: isAr ? 'Ø³Ø­Ø¨' : 'Retrait',
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
      <PageHeader title={isAr ? 'Ù…Ø­ÙØ¸ØªÙŠ' : 'Mon portefeuille'} isAr={isAr} />

      {loading ? <LoadingSkeleton count={2} /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card p-4 text-center">
              <Wallet className="w-8 h-8 text-gold mx-auto mb-2" />
              <p className="text-xs text-text-subdued">{isAr ? 'Ø§Ù„Ø±ØµÙŠØ¯ Ø§Ù„Ø­Ø§Ù„ÙŠ' : 'Solde actuel'}</p>
              <p className="text-xl font-bold text-cream">{wallet ? formatMAD(wallet.solde, i18n.language) : '0 MAD'}</p>
            </div>
            <div className="card p-4 text-center">
              <Clock className="w-8 h-8 text-yellow mx-auto mb-2" />
              <p className="text-xs text-text-subdued">{isAr ? 'Ø§Ù„Ø±ØµÙŠØ¯ Ø§Ù„Ù…Ø¹Ù„Ù‚' : 'Solde en attente'}</p>
              <p className="text-xl font-bold text-cream">{wallet ? formatMAD(wallet.solde_en_attente, i18n.language) : '0 MAD'}</p>
            </div>
            <div className="card p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green mx-auto mb-2" />
              <p className="text-xs text-text-subdued">{isAr ? 'Ø§Ù„Ø±ØµÙŠØ¯ Ø§Ù„Ù…ØªØ§Ø­' : 'Solde disponible'}</p>
              <p className="text-xl font-bold text-cream">{wallet ? formatMAD(wallet.solde_disponible, i18n.language) : '0 MAD'}</p>
            </div>
          </div>

          <div className="card">
            <div className={cn('p-3 border-b border-gold/10', isAr && 'text-right')}>
              <h3 className="font-semibold text-sm text-cream">{isAr ? 'Ø§Ù„Ù…Ø¹Ø§Ù…Ù„Ø§Øª' : 'Transactions'}</h3>
            </div>
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-text-subdued text-sm">{isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø¹Ø§Ù…Ù„Ø§Øª' : 'Aucune transaction'}</div>
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

// â”€â”€â”€ ENCHÃˆRES SUIVIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      <PageHeader title={isAr ? 'licitØ§Øª Ù…ØªØ§Ø¨Ø¹Ø©' : 'Mes enchÃ¨res suivies'} isAr={isAr} />

      {loading ? <LoadingSkeleton /> : bids.length === 0 ? (
        <EmptyState icon={Clock} message={isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ licitatØ§Øª' : 'Aucune enchÃ¨re suivie'} actionLabel={isAr ? 'ØªØµÙØ­ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª' : 'Voir les enchÃ¨res'} actionPath="/listings?mode=enchere" />
      ) : (
        <div className="space-y-3">
          {bids.map(bid => (
            <Link key={bid.id} to={`/listings/${bid.listing_id}`} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded bg-navy-hover shrink-0 flex items-center justify-center">
                <Clock className="w-6 h-6 text-text-subdued" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-cream truncate">{isAr ? 'Ø¥Ø¹Ù„Ø§Ù† #${bid.listing_id}' : `Annonce #${bid.listing_id}`}</p>
                <p className="text-xs text-text-subdued">{isAr ? 'Ø¹Ø±Ø¶Ùƒ' : 'Votre offre'}: <span className="font-bold text-gold">{formatMAD(bid.montant, i18n.language)}</span></p>
                {bid.auto_bid_max && (
                  <p className="text-[10px] text-text-subdued">{isAr ? 'Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰' : 'Max auto'}: {formatMAD(bid.auto_bid_max, i18n.language)}</p>
                )}
              </div>
              <span className={cn('badge text-[10px]', bid.statut === 'gagnee' ? 'badge-green' : bid.statut === 'active' ? 'badge-gold' : 'badge-red')}>
                {bid.statut === 'gagnee' ? (isAr ? 'ÙØ§Ø²' : 'Gagnee') : bid.statut === 'active' ? (isAr ? 'Ù†Ø´Ø·Ø©' : 'Active') : (isAr ? 'Ø®Ø§Ø³Ø±Ø©' : 'Perdue')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ OFFRES ENVOYÃ‰ES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      <PageHeader title={isAr ? 'Ø§Ù„Ø¹Ø±ÙˆØ¶ Ø§Ù„Ù…Ø±Ø³Ù„Ø©' : 'Offres envoyÃ©es'} isAr={isAr} />

      {loading ? <LoadingSkeleton /> : bids.length === 0 ? (
        <EmptyState
          icon={Send}
          message={isAr ? 'Ù„Ù… ØªØ±Ø³Ù„ Ø£ÙŠ Ø¹Ø±Ø¶ Ø¨Ø¹Ø¯' : 'Aucune offre envoyÃ©e'}
          actionLabel={isAr ? 'ØªØµÙØ­ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª' : 'Voir les annonces'}
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
                <p className="font-medium text-sm text-brown-dark truncate">{isAr ? `Ø¥Ø¹Ù„Ø§Ù† #${bid.listing_id}` : `Annonce #${bid.listing_id}`}</p>
                <p className="text-xs text-brown-light/60">{isAr ? 'Ø¹Ø±Ø¶Ùƒ' : 'Votre offre'}: <span className="font-bold text-gold">{formatMAD(bid.montant, i18n.language)}</span></p>
                {bid.auto_bid_max && (
                  <p className="text-[10px] text-brown-light/50">{isAr ? 'Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰' : 'Max auto'}: {formatMAD(bid.auto_bid_max, i18n.language)}</p>
                )}
              </div>
              <span className={cn('badge text-[10px]', bid.statut === 'gagnee' ? 'badge-green' : bid.statut === 'active' ? 'badge-gold' : 'badge-red')}>
                {bid.statut === 'gagnee' ? (isAr ? 'ÙØ§Ø²' : 'GagnÃ©e') : bid.statut === 'active' ? (isAr ? 'Ù†Ø´Ø·Ø©' : 'Active') : (isAr ? 'Ø®Ø§Ø³Ø±Ø©' : 'Perdue')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ OFFRES REÃ‡UES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function BuyerReceivedOffersPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div>
      <PageHeader title={isAr ? 'Ø§Ù„Ø¹Ø±ÙˆØ¶ Ø§Ù„ÙˆØ§Ø±Ø¯Ø©' : 'Offres reÃ§ues'} isAr={isAr} />
      <EmptyState
        icon={Bell}
        message={isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¹Ø±ÙˆØ¶ ÙˆØ§Ø±Ø¯Ø©' : 'Aucune offre reÃ§ue'}
        actionLabel={isAr ? 'ØªØµÙØ­ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª' : 'Voir les annonces'}
        actionPath="/listings"
      />
    </div>
  );
}

// â”€â”€â”€ ALERTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      <PageHeader title={isAr ? 'ØªÙ†Ø¨ÙŠÙ‡Ø§ØªÙŠ' : 'Mes alertes'} isAr={isAr} />

      {loading ? <LoadingSkeleton /> : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          message={isAr ? 'Ù„Ù… ØªÙ†Ø´Ø£ Ø£ÙŠ ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø¨Ø¹Ø¯' : 'Aucune alerte crÃ©Ã©e'}
          actionLabel={isAr ? 'Ø¨Ø­Ø« Ù…ØªÙ‚Ø¯Ù…' : 'Recherche avancÃ©e'}
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

// â”€â”€â”€ MESSAGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      <PageHeader title={isAr ? 'Ø±Ø³Ø§Ø¦Ù„ÙŠ' : 'Mes messages'} isAr={isAr} />

      {loading ? <LoadingSkeleton /> : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          message={isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø±Ø³Ø§Ø¦Ù„ Ø¨Ø¹Ø¯' : 'Aucun message'}
          actionLabel={isAr ? 'ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§' : 'Contacter le support'}
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
                  {conv.listing?.titre || isAr ? 'Ù…Ø­Ø§Ø¯Ø«Ø©' : 'Conversation'}
                </p>
                <p className="text-xs text-text-subdued truncate">
                  {conv.last_message?.message || isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø±Ø³Ø§Ø¦Ù„' : 'Aucun message'}
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

// â”€â”€â”€ FAVORITES (existing) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      <PageHeader title={isAr ? 'Ø§Ù„Ù…ÙØ¶Ù„Ø©' : 'Mes favoris'} isAr={isAr} />

      {loading ? <LoadingSkeleton /> : favorites.length === 0 ? (
        <EmptyState icon={Heart} message={isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…ÙØ¶Ù„Ø§Øª' : 'Aucun favori'} actionLabel={isAr ? 'ØªØµÙØ­ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª' : 'Voir les annonces'} actionPath="/listings" />
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

// â”€â”€â”€ SAVED SEARCHES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function SavedSearchesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nom: '', alerte_active: true, frequence_alerte: 'quotidienne' });

  const load = () => {
    savedSearchesApi.list()
      .then(({ data }) => setSearches(Array.isArray(data) ? data : []))
      .catch(() => setSearches([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) return;
    await savedSearchesApi.create({ ...form, nom: form.nom.trim() });
    setShowModal(false);
    setForm({ nom: '', alerte_active: true, frequence_alerte: 'quotidienne' });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(isAr ? 'Ø­Ø°Ù Ù‡Ø°Ù‡ Ø§Ù„Ø¨Ø­Ø«ØŸ' : 'Supprimer cette recherche ?')) return;
    await savedSearchesApi.remove(id);
    load();
  };

  return (
    <div>
      <div className={cn('flex items-center justify-between mb-6', isAr && 'flex-row-reverse')}>
        <h2 className="text-xl font-serif font-bold text-cream">{isAr ? 'Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø¨Ø­Ø« Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø©' : 'Recherches sauvegardÃ©es'}</h2>
        <button onClick={() => setShowModal(true)} className="btn-gold px-4 py-2 text-sm">{isAr ? 'Ø­ÙØ¸ Ø¨Ø­Ø«' : 'Sauvegarder'}</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleSave} className="card p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-cream">{isAr ? 'Ø¨Ø­Ø« Ø¬Ø¯ÙŠØ¯' : 'Nouvelle recherche'}</h3>
            <div>
              <label className="block text-sm font-medium text-cream mb-1">{isAr ? 'Nom' : 'Nom'}</label>
              <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="input-field" placeholder={isAr ? 'Ù…Ø«Ø§Ù„: Ø¹Ù…Ù„Ø§Øª Ù†Ø§Ø¯Ø±Ø©' : 'Ex: piÃ¨ces rares'} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream mb-1">{isAr ? 'ÙˆØªÙŠØ±Ø© Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡' : 'FrÃ©quence d\'alerte'}</label>
              <select value={form.frequence_alerte} onChange={(e) => setForm({ ...form, frequence_alerte: e.target.value })} className="input-field">
                <option value="instantanee">{isAr ? 'ÙÙˆØ±ÙŠØ©' : 'InstantanÃ©e'}</option>
                <option value="quotidienne">{isAr ? 'ÙŠÙˆÙ…ÙŠØ©' : 'Quotidienne'}</option>
                <option value="hebdomadaire">{isAr ? 'Ø£Ø³Ø¨ÙˆØ¹ÙŠØ©' : 'Hebdomadaire'}</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.alerte_active} onChange={(e) => setForm({ ...form, alerte_active: e.target.checked })} className="accent-gold" />
              <span className="text-sm text-cream">{isAr ? 'ØªÙØ¹ÙŠÙ„ Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡' : 'Activer l\'alerte'}</span>
            </label>
            <div className={cn('flex gap-3 justify-end', isAr && 'flex-row-reverse')}>
              <button type="button" onClick={() => setShowModal(false)} className="btn-gold-outline px-4 py-2 text-sm">{isAr ? 'Ø¥Ù„ØºØ§Ø¡' : 'Annuler'}</button>
              <button type="submit" className="btn-gold px-4 py-2 text-sm">{isAr ? 'Ø­ÙØ¸' : 'Enregistrer'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <LoadingSkeleton /> : searches.length === 0 ? (
        <EmptyState icon={Search} message={isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¹Ù…Ù„ÙŠØ§Øª Ø¨Ø­Ø« Ù…Ø­ÙÙˆØ¸Ø©' : 'Aucune recherche sauvegardÃ©e'} />
      ) : (
        <div className="space-y-3">
          {searches.map(s => (
            <div key={s.id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-navy-hover flex items-center justify-center shrink-0">
                <Search className="w-4 h-4 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-cream truncate">{s.nom}</p>
                <p className="text-xs text-text-subdued truncate">
                  {s.mot_cle || s.category?.nom_fr || ''}
                  {s.alerte_active ? ` Â· ${isAr ? 'ØªÙ†Ø¨ÙŠÙ‡ ' : 'alerte '}${s.frequence_alerte}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {s.mot_cle && (
                  <Link to={`/listings?q=${encodeURIComponent(s.mot_cle)}`} className="btn-gold-outline px-3 py-1 text-xs">
                    {isAr ? 'Ø¨Ø­Ø«' : 'Voir'}
                  </Link>
                )}
                <button onClick={() => handleDelete(s.id)} className="p-2 hover:bg-red/10 rounded" title={isAr ? 'Ø­Ø°Ù' : 'Supprimer'}>
                  <XCircle className="w-4 h-4 text-red/60" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ REVIEWS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function BuyerReviewsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ order_id: '', note: 5, commentaire: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    reviewsApi.list({ per_page: 50 })
      .then(({ data }) => setReviews(data.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  useEffect(() => {
    if (showForm) {
      ordersApi.list({ per_page: 50 })
        .then(({ data }) => setOrders(data.data || []))
        .catch(() => setOrders([]));
    }
  }, [showForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.order_id) return;
    setSaving(true);
    try {
      await reviewsApi.create({ order_id: Number(form.order_id), note: form.note, commentaire: form.commentaire || undefined });
      setShowForm(false);
      setForm({ order_id: '', note: 5, commentaire: '' });
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className={cn('flex items-center justify-between mb-6', isAr && 'flex-row-reverse')}>
        <PageHeader title={isAr ? 'ØªÙ‚ÙŠÙŠÙ…Ø§ØªÙŠ' : 'Mes avis'} isAr={isAr} />
        <button onClick={() => setShowForm(v => !v)} className="btn-gold px-4 py-2 text-sm">
          {isAr ? 'Ø¥Ø¶Ø§ÙØ© ØªÙ‚ÙŠÙŠÙ…' : 'Ajouter un avis'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-cream">{isAr ? 'Nouvel avis' : 'Nouvel avis'}</h3>
          <div>
            <label className="block text-sm font-medium text-cream mb-1">{isAr ? 'Ø·Ù„Ø¨' : 'Commande'}</label>
            <select value={form.order_id} onChange={(e) => setForm({ ...form, order_id: e.target.value })} className="input-field" required>
              <option value="">{isAr ? 'Ø§Ø®ØªØ± Ø·Ù„Ø¨Ø§Ù‹' : 'SÃ©lectionner une commande'}</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>{isAr ? 'Ø·Ù„Ø¨' : 'Commande'} #{o.numero_commande?.slice(-6) || o.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-cream mb-1">{isAr ? 'Ø§Ù„ØªÙ‚ÙŠÙŠÙ…' : 'Note'}</label>
            <div className={cn('flex items-center gap-1', isAr && 'flex-row-reverse')}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setForm({ ...form, note: star })}>
                  <Star className={cn('w-6 h-6', star <= form.note ? 'text-gold fill-gold' : 'text-text-subdued')} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-cream mb-1">{isAr ? 'ØªØ¹Ù„ÙŠÙ‚' : 'Commentaire'}</label>
            <textarea value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} rows={3} className="input-field" placeholder={isAr ? 'Ø£Ø¶Ù ØªØ¹Ù„ÙŠÙ‚Ø§Ù‹' : 'Ajoutez un commentaire'} />
          </div>
          <div className={cn('flex gap-3 justify-end', isAr && 'flex-row-reverse')}>
            <button type="button" onClick={() => setShowForm(false)} className="btn-gold-outline px-4 py-2 text-sm">{isAr ? 'Ø¥Ù„ØºØ§Ø¡' : 'Annuler'}</button>
            <button type="submit" disabled={saving} className="btn-gold px-4 py-2 text-sm">{saving ? '...' : (isAr ? 'Ø¥Ø±Ø³Ø§Ù„' : 'Envoyer')}</button>
          </div>
        </form>
      )}

      {loading ? <LoadingSkeleton /> : reviews.length === 0 ? (
        <EmptyState icon={Star} message={isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ø¨Ø¹Ø¯' : 'Aucun avis'} />
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
                      {isAr ? 'Ø·Ù„Ø¨' : 'Commande'} #{review.order_id}
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

// â”€â”€â”€ DISPUTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DISPUTE_REASONS = ['objet_non_recu', 'objet_endommage', 'objet_different', 'non_conforme', 'retard_livraison', 'arnaque', 'autre'];

export function BuyerDisputesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ order_id: '', raison: 'objet_non_recu', description: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    disputesApi.list({ per_page: 50 })
      .then(({ data }) => setDisputes(data.data || []))
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  useEffect(() => {
    if (showForm) {
      ordersApi.list({ per_page: 50 })
        .then(({ data }) => setOrders(data.data || []))
        .catch(() => setOrders([]));
    }
  }, [showForm]);

  const raisonLabel: Record<string, string> = {
    objet_non_recu: isAr ? 'Ù„Ù… Ø£Ø³ØªÙ„Ù… Ø§Ù„Ø¹Ù†ØµØ±' : 'Objet non reÃ§u',
    objet_endommage: isAr ? 'Ø¹Ù†ØµØ± ØªØ§Ù„Ù' : 'Objet endommagÃ©',
    objet_different: isAr ? 'Ø¹Ù†ØµØ± Ù…Ø®ØªÙ„Ù' : 'Objet diffÃ©rent',
    non_conforme: isAr ? 'ØºÙŠØ± Ù…Ø·Ø§Ø¨Ù‚' : 'Non conforme',
    retard_livraison: isAr ? 'ØªØ£Ø®Ø± Ø§Ù„ØªØ³Ù„ÙŠÙ…' : 'Retard de livraison',
    arnaque: isAr ? 'Ø§Ø­ØªÙŠØ§Ù„' : 'Arnaque',
    autre: isAr ? 'Ø£Ø®Ø±Ù‰' : 'Autre',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.order_id || !form.description.trim()) return;
    setSaving(true);
    try {
      await disputesApi.create({ order_id: Number(form.order_id), raison: form.raison, description: form.description.trim() });
      setShowForm(false);
      setForm({ order_id: '', raison: 'objet_non_recu', description: '' });
      load();
    } finally {
      setSaving(false);
    }
  };

  const statutLabel: Record<string, string> = {
    ouvert: isAr ? 'Ù…ÙØªÙˆØ­' : 'Ouvert',
    en_cours: isAr ? 'Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©' : 'En cours',
    resolu: isAr ? 'ØªÙ… Ø§Ù„Ø­Ù„' : 'RÃ©solu',
    ferme: isAr ? 'Ù…ØºÙ„Ù‚' : 'FermÃ©',
  };

  return (
    <div>
      <div className={cn('flex items-center justify-between mb-6', isAr && 'flex-row-reverse')}>
        <PageHeader title={isAr ? 'Ø§Ù„litiges' : 'Mes litiges'} isAr={isAr} />
        <button onClick={() => setShowForm(v => !v)} className="btn-gold px-4 py-2 text-sm">
          {isAr ? 'ÙØªØ­ Ù†Ø²Ø§Ø¹' : 'Ouvrir un litige'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-cream">{isAr ? 'ÙØªØ­ Ù†Ø²Ø§Ø¹' : 'Ouvrir un litige'}</h3>
          <div>
            <label className="block text-sm font-medium text-cream mb-1">{isAr ? 'Ø·Ù„Ø¨' : 'Commande'}</label>
            <select value={form.order_id} onChange={(e) => setForm({ ...form, order_id: e.target.value })} className="input-field" required>
              <option value="">{isAr ? 'Ø§Ø®ØªØ± Ø·Ù„Ø¨Ø§Ù‹' : 'SÃ©lectionner une commande'}</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>{isAr ? 'Ø·Ù„Ø¨' : 'Commande'} #{o.numero_commande?.slice(-6) || o.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-cream mb-1">{isAr ? 'Ø§Ù„Ø³Ø¨Ø¨' : 'Raison'}</label>
            <select value={form.raison} onChange={(e) => setForm({ ...form, raison: e.target.value })} className="input-field">
              {DISPUTE_REASONS.map(r => (
                <option key={r} value={r}>{raisonLabel[r]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-cream mb-1">{isAr ? 'Ø§Ù„ÙˆØµÙ' : 'Description'}</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field" placeholder={isAr ? 'ØµÙ Ø§Ù„Ù…Ø´ÙƒÙ„Ø©' : 'DÃ©crivez le problÃ¨me'} required />
          </div>
          <div className={cn('flex gap-3 justify-end', isAr && 'flex-row-reverse')}>
            <button type="button" onClick={() => setShowForm(false)} className="btn-gold-outline px-4 py-2 text-sm">{isAr ? 'Ø¥Ù„ØºØ§Ø¡' : 'Annuler'}</button>
            <button type="submit" disabled={saving} className="btn-gold px-4 py-2 text-sm">{saving ? '...' : (isAr ? 'Ø¥Ø±Ø³Ø§Ù„' : 'Envoyer')}</button>
          </div>
        </form>
      )}

      {loading ? <LoadingSkeleton /> : disputes.length === 0 ? (
        <EmptyState icon={AlertTriangle} message={isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø´Ø§ÙƒÙ„' : 'Aucun litige'} />
      ) : (
        <div className="space-y-3">
          {disputes.map(dispute => (
            <div key={dispute.id} className="card p-4">
              <div className={cn('flex items-center justify-between mb-2', isAr && 'flex-row-reverse')}>
                <div>
                  <p className="text-sm font-medium text-cream">{dispute.raison}</p>
                  <p className="text-[10px] text-text-subdued">
                    {isAr ? 'Ø·Ù„Ø¨' : 'Commande'} #{dispute.order_id}
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

// â”€â”€â”€ PAYMENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    depot: isAr ? 'Ø¥ÙŠØ¯Ø§Ø¹' : 'DÃ©pÃ´t',
    encaissement: isAr ? 'ØªØ­ØµÙŠÙ„' : 'Encaissement',
    commission: isAr ? 'Ø¹Ù…ÙˆÙ„Ø©' : 'Commission',
    virement_vendeur: isAr ? 'ØªØ­ÙˆÙŠÙ„ Ù„Ù„Ø¨Ø§Ø¦Ø¹' : 'Virement vendeur',
    remboursement: isAr ? 'Ø§Ø³ØªØ±Ø¯Ø§Ø¯' : 'Remboursement',
    retrait: isAr ? 'Ø³Ø­Ø¨' : 'Retrait',
  };

  return (
    <div>
      <PageHeader title={isAr ? 'Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª' : 'Mes paiements'} isAr={isAr} />

      {loading ? <LoadingSkeleton /> : transactions.length === 0 ? (
        <EmptyState icon={Wallet} message={isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø¯ÙÙˆØ¹Ø§Øª Ø¨Ø¹Ø¯' : 'Aucun paiement'} />
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
