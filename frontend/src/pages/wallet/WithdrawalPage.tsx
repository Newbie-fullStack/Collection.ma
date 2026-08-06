import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wallet, ArrowLeft, ChevronLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { walletApi } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatMAD, cn } from '@/lib/utils';

export function WithdrawalPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const availableBalance = Number(user?.wallet?.solde_disponible) || 0;
  const minWithdrawal = 50;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (numAmount < minWithdrawal) {
      setError(isAr ? `الحد الأدنى ${minWithdrawal} درهم` : `Le minimum est de ${minWithdrawal} MAD`);
      return;
    }

    if (numAmount > availableBalance) {
      setError(isAr ? 'رصيد غير كافٍ' : 'Solde insuffisant');
      return;
    }

    if (!user?.rib) {
      setError(isAr ? 'يرجى إضافة RIB في إعدادات الحساب' : 'Veuillez ajouter votre RIB dans les paramètres du compte');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await walletApi.requestWithdrawal(numAmount);
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
            {isAr ? 'تم إرسال الطلب' : 'Demande envoyée'}
          </h1>
          <p className="text-text-subdued mb-6">
            {isAr
              ? `تم إرسال طلب سحب بمبلغ ${formatMAD(Number(amount), i18n.language)}. سيتم المعالجة خلال 2-5 أيام عمل.`
              : `Votre demande de retrait de ${formatMAD(Number(amount), i18n.language)} a été envoyée. Traitement sous 2-5 jours ouvrables.`}
          </p>
          <Link to="/portefeuille" className="btn-gold">
            {isAr ? 'المحفظة' : 'Mon portefeuille'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className={cn('flex items-center gap-2 text-sm text-text-subdued mb-6', isAr && 'flex-row-reverse')}>
        <Link to="/portefeuille" className="hover:text-gold">{isAr ? 'المحفظة' : 'Portefeuille'}</Link>
        <ChevronLeft className={cn('w-4 h-4', isAr && 'rotate-180')} />
        <span className="text-cream">{isAr ? 'طلب سحب' : 'Retrait'}</span>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-gold" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-cream">
          {isAr ? 'طلب سحب' : 'Retirer des fonds'}
        </h1>
        <p className="text-text-subdued mt-2">
          {isAr
            ? `الرصيد المتاح: ${formatMAD(availableBalance, i18n.language)}`
            : `Solde disponible : ${formatMAD(availableBalance, i18n.language)}`}
        </p>
      </div>

      <form onSubmit={handleWithdraw} className="card p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red/10 text-red rounded-lg text-sm">{error}</div>
        )}

        {!user?.rib && (
          <div className="p-3 bg-yellow/10 border border-yellow/20 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow">
                {isAr ? 'RIB غير مسجل' : 'RIB non renseigné'}
              </p>
              <p className="text-xs text-text-subdued mt-1">
                {isAr
                  ? 'أضف ر IBAN في إعدادات الحساب لإمكانية السحب'
                  : 'Ajoutez votre IBAN dans les paramètres du compte pour pouvoir retirer'}
              </p>
              <Link to="/compte" className="text-xs text-gold hover:underline mt-1 inline-block">
                {isAr ? 'الإعدادات' : 'Paramètres du compte'}
              </Link>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-cream mb-2">
            {isAr ? 'مبلغ السحب' : 'Montant à retirer'}
          </label>
          <div className="relative">
            <input
              type="number"
              min={minWithdrawal}
              step="0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              placeholder={`${minWithdrawal}+`}
              className={cn(
                'input-field pr-16 text-lg',
                isAr && 'pl-16 pr-4'
              )}
              disabled={!user?.rib}
            />
            <span className={cn(
              'absolute top-1/2 -translate-y-1/2 text-sm text-text-subdued font-medium',
              isAr ? 'left-4' : 'right-4'
            )}>
              MAD
            </span>
          </div>
          <p className="text-xs text-text-subdued mt-1">
            {isAr ? `الحد الأدنى ${minWithdrawal} MAD` : `Minimum ${minWithdrawal} MAD`}
          </p>
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2">
          {[100, 250, 500].filter(v => v <= availableBalance).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className={cn(
                'px-4 py-2 rounded-lg border text-sm transition-colors',
                Number(amount) === preset
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-cream hover:border-gold/30 text-cream'
              )}
            >
              {formatMAD(preset, i18n.language)}
            </button>
          ))}
        </div>

        {/* RIB info */}
        {user?.rib && (
          <div className="p-3 bg-navy-hover rounded-lg">
            <p className="text-xs text-text-subdued">
              {isAr ? 'التحويل سيتم إلى:' : 'Le virement sera effectué vers :'}
            </p>
            <p className="text-sm font-mono text-cream mt-1">
              {user.rib.substring(0, 8)}...{user.rib.slice(-4)}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !amount || Number(amount) < minWithdrawal || !user?.rib}
          className="btn-gold w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? '...' : isAr ? 'تأكيد الطلب' : 'Confirmer le retrait'}
        </button>
      </form>

      <Link to="/portefeuille" className={cn('block text-center text-sm text-gold hover:text-gold-dark mt-4', isAr && 'text-right')}>
        <ArrowLeft className={cn('w-3.5 h-3.5 inline mr-1', isAr && 'rotate-180 mr-0 ml-1')} />
        {isAr ? 'العودة للمحفظة' : 'Retour au portefeuille'}
      </Link>
    </div>
  );
}
