import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Trash2, CreditCard, Lock, CheckCircle, ChevronLeft, Wallet, AlertTriangle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi, walletApi } from '@/api';
import { formatMAD, cn } from '@/lib/utils';

export function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeItem, total, count, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [missingAmount, setMissingAmount] = useState(0);

  useEffect(() => {
    walletApi.get().then(({ data }) => {
      setWalletBalance(Number(data.solde_disponible));
    }).catch(() => {});
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError('');
    setInsufficientFunds(false);

    try {
      for (const item of items) {
        await ordersApi.create({
          listing_id: item.listing.id,
        });
      }
      clearCart();
      setSuccess(true);
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.insufficient_funds) {
        setInsufficientFunds(true);
        setMissingAmount(data.manque);
        setWalletBalance(data.solde);
      } else {
        setError(data?.message || t('commun.erreur'));
      }
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
            {isAr ? '! تم الطلب بنجاح' : 'Commande confirmée !'}
          </h1>
          <p className="text-text-subdued mb-6">
            {isAr
              ? 'تم إنشاء طلبك بنجاح. يمكنك متابعة حالته من حسابك.'
              : 'Votre commande a été créée avec succès. Vous pouvez suivre son état depuis votre compte.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/acheteur/commandes" className="btn-gold">
              {isAr ? 'طلباتي' : 'Mes commandes'}
            </Link>
            <Link to="/listings" className="btn-gold-outline">
              {isAr ? 'متابعة التسوق' : 'Continuer mes achats'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="card p-8">
          <ShoppingBag className="w-12 h-12 text-text-subdued mx-auto mb-3" />
          <p className="text-text-subdued mb-4">{isAr ? 'السلة فارغة' : 'Votre panier est vide'}</p>
          <Link to="/listings" className="btn-gold inline-block">
            {isAr ? 'تصفح الإعلانات' : 'Voir les annonces'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className={cn('flex items-center gap-2 text-sm text-text-subdued mb-6', isAr && 'flex-row-reverse')}>
        <Link to="/" className="hover:text-gold">{t('nav.accueil')}</Link>
        <ChevronLeft className={cn('w-4 h-4', isAr && 'rotate-180')} />
        <span className="text-cream">{isAr ? 'إتمام الشراء' : 'Checkout'}</span>
      </div>

      <h1 className={cn('text-2xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
        {isAr ? 'إتمام الشراء' : 'Passer la commande'}
      </h1>

      {error && (
        <div className="p-3 bg-red/10 text-red rounded-lg text-sm mb-4">{error}</div>
      )}

      <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-6', isAr && 'direction-rtl')}>
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {items.map(item => {
            const photoPath = item.listing.photos?.[0]?.path || `placeholders/listing_${item.listing.id}.png`;
            const photoUrl = `/storage/${photoPath}`;
            const price = item.listing.prix_actuel || item.listing.prix_vente;
            return (
              <div key={item.listing.id} className="card p-4 flex items-center gap-4">
                <div className="w-20 h-20 rounded bg-navy-hover overflow-hidden shrink-0">
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/listings/${item.listing.numero_auto}`} className="font-medium text-cream hover:text-gold truncate block">
                    {item.listing.titre}
                  </Link>
                  <p className="text-xs text-text-subdued">
                    {item.listing.seller?.pseudo || (isAr ? 'بائع' : 'Vendeur')}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-subdued">
                    <span className={cn('badge', item.listing.mode === 'enchere' ? 'badge-gold' : 'badge-green')}>
                      {item.listing.mode === 'enchere' ? (isAr ? 'licitat' : 'Enchère') : (isAr ? 'شراء مباشر' : 'Achat immédiat')}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-cream">{formatMAD(Number(price) || 0, i18n.language)}</p>
                  {item.listing.frais_port > 0 && (
                    <p className="text-[10px] text-text-subdued">+ {formatMAD(Number(item.listing.frais_port) || 0, i18n.language)} port</p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.listing.id)}
                  className="text-text-subdued hover:text-red shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="card p-4 h-fit sticky top-24">
          <h3 className="font-semibold text-cream mb-4">
            {isAr ? 'ملخص الطلب' : 'Récapitulatif'}
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-subdued">{isAr ? 'المشتريات' : 'Sous-total'} ({count})</span>
              <span className="text-cream">{formatMAD(total, i18n.language)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-subdued">{isAr ? 'الشحن' : 'Livraison'}</span>
              <span className="text-green">{isAr ? 'مشمول' : 'Inclus'}</span>
            </div>
            <hr className="border-cream" />
            <div className="flex justify-between text-lg font-bold">
              <span>{isAr ? 'المجموع' : 'Total'}</span>
              <span className="text-cream">{formatMAD(total, i18n.language)}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-navy-hover rounded-lg">
            <div className="flex items-center gap-2 text-xs text-text-subdued">
              <Lock className="w-3.5 h-3.5" />
              <span>{isAr ? 'دفع آمن عبر Escrow' : 'Paiement sécurisé via Escrow'}</span>
            </div>
            <p className="text-[10px] text-text-subdued mt-1">
              {isAr
                ? 'سيتم خصم المبلغ من محفظتك والاحتفاظ به حتى تأكيد استلام الطلب'
                : 'Le montant sera déduit de votre portefeuille et conservé jusqu\'à confirmation de réception'}
            </p>
          </div>

          {/* Wallet balance */}
          {walletBalance !== null && (
            <div className={cn(
              'mt-3 p-3 rounded-lg flex items-center justify-between',
              walletBalance >= total ? 'bg-green/5 border border-green/20' : 'bg-red/5 border border-red/20'
            )}>
              <div className="flex items-center gap-2">
                <Wallet className={cn('w-4 h-4', walletBalance >= total ? 'text-green' : 'text-red')} />
                <span className="text-xs text-text-subdued">
                  {isAr ? 'رصيد المحفظة' : 'Solde portefeuille'}
                </span>
              </div>
              <span className={cn('text-sm font-semibold', walletBalance >= total ? 'text-green' : 'text-red')}>
                {formatMAD(walletBalance, i18n.language)}
              </span>
            </div>
          )}

          {/* Insufficient funds warning */}
          {insufficientFunds && (
            <div className="mt-3 p-3 bg-red/5 border border-red/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red" />
                <span className="text-sm font-medium text-red">
                  {isAr ? 'رصيد غير كافٍ' : 'Solde insuffisant'}
                </span>
              </div>
              <p className="text-xs text-text-subdued mb-3">
                {isAr
                  ? `تحتاج إلى ${formatMAD(missingAmount, i18n.language)} إضافية`
                  : `Il vous manque ${formatMAD(missingAmount, i18n.language)}`}
              </p>
              <Link
                to="/portefeuille/recharger"
                className="btn-gold text-sm inline-flex items-center gap-2 py-2"
              >
                <Wallet className="w-4 h-4" />
                {isAr ? 'شحن المحفظة' : 'Recharger le portefeuille'}
              </Link>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="btn-gold w-full mt-4 flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            {loading ? '...' : (isAr ? 'تأكيد الطلب' : 'Confirmer la commande')}
          </button>

          <Link to="/listings" className={cn('block text-center text-sm text-gold hover:text-gold-dark mt-3', isAr && 'text-right')}>
            {isAr ? '← متابعة التسوق' : '← Continuer mes achats'}
          </Link>
        </div>
      </div>
    </div>
  );
}
