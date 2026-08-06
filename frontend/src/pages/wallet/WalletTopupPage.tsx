import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wallet, CreditCard, CheckCircle, ArrowLeft, ChevronLeft } from 'lucide-react';
import { walletApi } from '@/api';
import { formatMAD, cn } from '@/lib/utils';

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

export function WalletTopupPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | string>('');
  const [customAmount, setCustomAmount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 10) {
      setError(isAr ? 'الحد الأدنى 10 درهم' : 'Le minimum est de 10 MAD');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await walletApi.topup(numAmount);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('commun.erreur'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="card p-8">
          <CheckCircle className="w-16 h-16 text-green mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-cream mb-2">
            {isAr ? 'تم الشحن بنجاح' : 'Recharge effectuée'}
          </h1>
          <p className="text-text-subdued mb-6">
            {isAr
              ? `تم شحن محفظتك بمبلغ ${formatMAD(Number(amount), i18n.language)}`
              : `Votre portefeuille a été crédité de ${formatMAD(Number(amount), i18n.language)}`}
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/portefeuille" className="btn-gold">
              {isAr ? 'المحفظة' : 'Mon portefeuille'}
            </Link>
            <Link to="/listings" className="btn-gold-outline">
              {isAr ? 'متابعة التسوق' : 'Continuer mes achats'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className={cn('flex items-center gap-2 text-sm text-text-subdued mb-6', isAr && 'flex-row-reverse')}>
        <Link to="/portefeuille" className="hover:text-gold">{isAr ? 'المحفظة' : 'Portefeuille'}</Link>
        <ChevronLeft className={cn('w-4 h-4', isAr && 'rotate-180')} />
        <span className="text-cream">{isAr ? 'شحن المحفظة' : 'Recharger'}</span>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-gold" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-cream">
          {isAr ? 'شحن المحفظة' : 'Recharger le portefeuille'}
        </h1>
        <p className="text-text-subdued mt-2">
          {isAr
            ? 'أضف أموالاً إلى محفظتك للشراء من marketplace'
            : 'Ajoutez des fonds pour acheter sur la marketplace'}
        </p>
      </div>

      <form onSubmit={handleTopup} className="card p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red/10 text-red rounded-lg text-sm">{error}</div>
        )}

        {/* Preset amounts */}
        <div>
          <label className="block text-sm font-medium text-cream mb-3">
            {isAr ? 'اختر المبلغ' : 'Choisissez un montant'}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => { setAmount(preset); setCustomAmount(false); }}
                className={cn(
                  'py-3 rounded-xl border-2 text-center font-semibold transition-all',
                  Number(amount) === preset && !customAmount
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-cream hover:border-gold/30 text-cream'
                )}
              >
                {formatMAD(preset, i18n.language)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div>
          <label className="block text-sm font-medium text-cream mb-2">
            {isAr ? 'أو أدخل مبلغاً' : 'Ou entrez un montant personnalisé'}
          </label>
          <div className="relative">
            <input
              type="number"
              min="10"
              step="0.01"
              value={customAmount ? amount : ''}
              onChange={(e) => { setAmount(e.target.value); setCustomAmount(true); }}
              onFocus={() => setCustomAmount(true)}
              placeholder={isAr ? 'المبلغ' : 'Montant'}
              className={cn(
                'input-field pr-16',
                isAr && 'pl-16 pr-4'
              )}
            />
            <span className={cn(
              'absolute top-1/2 -translate-y-1/2 text-sm text-text-subdued font-medium',
              isAr ? 'left-4' : 'right-4'
            )}>
              MAD
            </span>
          </div>
        </div>

        {/* Payment info */}
        <div className="p-3 bg-navy-hover rounded-lg">
          <div className="flex items-center gap-2 text-xs text-text-subdued">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{isAr ? 'سيتم إضافة المبلغ فوراً إلى محفظتك' : 'Le montant sera crédité instantanément'}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !amount || Number(amount) < 10}
          className="btn-gold w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Wallet className="w-4 h-4" />
          {loading ? '...' : isAr ? `شحن ${amount ? formatMAD(Number(amount), i18n.language) : ''}` : `Recharger ${amount ? formatMAD(Number(amount), i18n.language) : ''}`}
        </button>
      </form>

      <Link to="/portefeuille" className={cn('block text-center text-sm text-gold hover:text-gold-dark mt-4', isAr && 'text-right')}>
        <ArrowLeft className={cn('w-3.5 h-3.5 inline mr-1', isAr && 'rotate-180 mr-0 ml-1')} />
        {isAr ? 'العودة للمحفظة' : 'Retour au portefeuille'}
      </Link>
    </div>
  );
}
