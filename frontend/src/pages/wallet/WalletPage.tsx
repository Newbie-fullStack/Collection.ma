import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wallet, ArrowUpRight, ArrowDownLeft, ChevronLeft, Plus, Minus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { walletApi } from '@/api';
import type { WalletTransaction } from '@/types';
import { formatMAD, cn } from '@/lib/utils';

const TYPE_LABELS: Record<string, Record<string, string>> = {
  depot: { fr: 'Dépôt', ar: 'إيداع' },
  retrait: { fr: 'Retrait', ar: 'سحب' },
  paiement: { fr: 'Paiement', ar: 'دفع' },
  encaissement: { fr: 'Encaissement', ar: 'قبض' },
  commission: { fr: 'Commission', ar: 'عمولة' },
  remboursement: { fr: 'Remboursement', ar: 'استرداد' },
  bonus: { fr: 'Bonus', ar: 'مكافأة' },
};

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  complete: CheckCircle,
  pending: Clock,
  failed: XCircle,
};

export function WalletPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<{ solde: number; solde_disponible: number; solde_en_attente: number } | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      walletApi.get(),
      walletApi.transactions({ per_page: 20 }),
    ]).then(([walletRes, transRes]) => {
      setWallet(walletRes.data);
      setTransactions(transRes.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-text-subdued">{isAr ? 'جاري التحميل...' : 'Chargement...'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className={cn('flex items-center gap-2 text-sm text-text-subdued mb-6', isAr && 'flex-row-reverse')}>
        <Link to="/acheteur" className="hover:text-gold">{isAr ? 'حسابي' : 'Mon compte'}</Link>
        <ChevronLeft className={cn('w-4 h-4', isAr && 'rotate-180')} />
        <span className="text-cream">{isAr ? 'المحفظة' : 'Portefeuille'}</span>
      </div>

      <h1 className={cn('text-2xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
        {isAr ? 'المحفظة' : 'Mon portefeuille'}
      </h1>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-gold" />
            </div>
            <span className="text-sm text-text-subdued">{isAr ? 'الرصيد الكلي' : 'Solde total'}</span>
          </div>
          <p className="text-2xl font-bold text-cream">{formatMAD(wallet?.solde || 0, i18n.language)}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green" />
            </div>
            <span className="text-sm text-text-subdued">{isAr ? 'متاح' : 'Disponible'}</span>
          </div>
          <p className="text-2xl font-bold text-green">{formatMAD(wallet?.solde_disponible || 0, i18n.language)}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-yellow/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow" />
            </div>
            <span className="text-sm text-text-subdued">{isAr ? 'في الانتظار' : 'En attente'}</span>
          </div>
          <p className="text-2xl font-bold text-yellow">{formatMAD(wallet?.solde_en_attente || 0, i18n.language)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        <Link to="/portefeuille/recharger" className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {isAr ? 'شحن المحفظة' : 'Recharger'}
        </Link>
        <Link to="/portefeuille/retrait" className="btn-gold-outline flex items-center gap-2">
          <Minus className="w-4 h-4" />
          {isAr ? 'طلب سحب' : 'Retirer'}
        </Link>
      </div>

      {/* Transactions */}
      <div className="card">
        <div className="p-4 border-b border-cream">
          <h2 className="font-semibold text-cream">
            {isAr ? 'آخر المعاملات' : 'Historique des transactions'}
          </h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-text-subdued">
            <Wallet className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>{isAr ? 'لا توجد معاملات بعد' : 'Aucune transaction pour le moment'}</p>
          </div>
        ) : (
          <div className="divide-y divide-cream">
            {transactions.map((tx) => {
              const isCredit = tx.montant > 0;
              const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
              const StatusIcon = STATUS_ICONS[tx.statut] || Clock;

              return (
                <div key={tx.id} className={cn('flex items-center gap-4 p-4', isAr && 'flex-row-reverse')}>
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                    isCredit ? 'bg-green/10' : 'bg-red/10'
                  )}>
                    <Icon className={cn('w-5 h-5', isCredit ? 'text-green' : 'text-red')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cream truncate">
                      {TYPE_LABELS[tx.type]?.[isAr ? 'ar' : 'fr'] || tx.type}
                    </p>
                    <p className="text-xs text-text-subdued truncate">{tx.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn('text-sm font-semibold', isCredit ? 'text-green' : 'text-red')}>
                      {isCredit ? '+' : ''}{formatMAD(tx.montant, i18n.language)}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      <StatusIcon className="w-3 h-3 text-text-subdued" />
                      <span className="text-[10px] text-text-subdued">
                        {new Date(tx.created_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
