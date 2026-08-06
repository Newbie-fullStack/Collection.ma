import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, formatMAD } from '@/lib/utils';
import { ordersApi } from '@/api';
import type { Invoice, Order } from '@/types';
import { FileText, Download, Eye, Clock, CheckCircle, Package } from 'lucide-react';

export function SellerInvoicesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.sellerInvoices({ per_page: 20 })
      .then(({ data }) => setInvoices(data.data || []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className={cn('flex items-center justify-between mb-6', isAr && 'flex-row-reverse')}>
        <h2 className="text-xl font-serif font-bold text-cream">
          {isAr ? 'الفواتير' : 'Mes factures'}
        </h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-navy-hover rounded shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-navy-hover rounded w-1/3" />
                <div className="h-3 bg-navy-hover rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="card p-8 text-center">
          <FileText className="w-12 h-12 text-text-subdued mx-auto mb-3" />
          <p className="text-text-subdued">
            {isAr ? 'لا توجد فواتير بعد' : 'Aucune facture disponible'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-cream">{invoice.numero_facture}</span>
                  <span className={cn('badge text-[10px]', invoice.type === 'vendeur' ? 'badge-green' : 'badge-gold')}>
                    {invoice.type === 'vendeur' ? (isAr ? 'بائع' : 'Vendeur') : (isAr ? 'مشتري' : 'Acheteur')}
                  </span>
                </div>
                {invoice.order && (
                  <p className="text-xs text-text-subdued mt-0.5">
                    {isAr ? 'طلب:' : 'Commande:'} {invoice.order.numero_commande}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-1 text-xs text-text-subdued">
                  <span>{new Date(invoice.created_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}</span>
                  {invoice.commission > 0 && (
                    <span>{isAr ? 'عمولة:' : 'Commission:'} {formatMAD(invoice.commission, i18n.language)}</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-cream">{formatMAD(invoice.total, i18n.language)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SellerWithdrawalsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div>
      <h2 className={cn('text-xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
        {isAr ? 'السحب' : 'Retraits'}
      </h2>

      <div className="card p-8 text-center">
        <Clock className="w-12 h-12 text-text-subdued mx-auto mb-3" />
        <p className="text-text-subdued">
          {isAr ? 'يمكنك السحب من' : 'Vous pouvez effectuer des retraits depuis'}
        </p>
        <a href="/portefeuille/retrait" className="btn-gold mt-4 inline-flex items-center gap-2">
          <Download className="w-4 h-4" />
          {isAr ? 'طلب سحب' : 'Demander un retrait'}
        </a>
      </div>
    </div>
  );
}

export function SellerSalesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.sellerOrders({ statut: 'vire_vendeur', per_page: 20 })
      .then(({ data }) => setOrders(data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const totalVentes = orders.reduce((sum, o) => sum + (Number(o.prix) || 0), 0);

  return (
    <div>
      <div className={cn('flex items-center justify-between mb-6', isAr && 'flex-row-reverse')}>
        <h2 className="text-xl font-serif font-bold text-cream">
          {isAr ? 'المبيعات المكتملة' : 'Ventes terminees'}
        </h2>
        {orders.length > 0 && (
          <span className="text-sm text-text-subdued">
            {isAr ? 'المجموع:' : 'Total:'} <span className="font-bold text-green">{formatMAD(totalVentes, i18n.language)}</span>
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-navy-hover rounded shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-navy-hover rounded w-1/3" />
                <div className="h-3 bg-navy-hover rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-8 text-center">
          <CheckCircle className="w-12 h-12 text-text-subdued mx-auto mb-3" />
          <p className="text-text-subdued">
            {isAr ? 'لا توجد مبيعات مكتملة' : 'Aucune vente terminee'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green/10 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-green" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-cream">{order.numero_commande}</span>
                  <span className="badge badge-green text-[10px]">
                    {isAr ? 'مكتمل' : 'Termine'}
                  </span>
                </div>
                <p className="text-xs text-text-subdued mt-0.5 truncate">
                  {order.listing?.titre || (isAr ? 'إعلان' : 'Annonce')}
                </p>
                <p className="text-xs text-text-subdued">
                  {isAr ? 'عمولة:' : 'Commission:'} {formatMAD(Number(order.commission_montant) || 0, i18n.language)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-green">{formatMAD(Number(order.prix) || 0, i18n.language)}</p>
                <p className="text-[10px] text-text-subdued">
                  {new Date(order.created_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SellerOffersPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div>
      <h2 className={cn('text-xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
        {isAr ? 'العروض الواردة' : 'Offres recues'}
      </h2>

      <div className="card p-8 text-center">
        <Eye className="w-12 h-12 text-text-subdued mx-auto mb-3" />
        <p className="text-text-subdued">
          {isAr ? 'ستظهر العروض هنا عندما ي-submit المشترون عروضاً على إعلاناتك' : 'Les offres apparaitront ici lorsque les acheteurs feront des propositions sur vos annonces'}
        </p>
      </div>
    </div>
  );
}
