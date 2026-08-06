import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { authApi } from '@/api';
import { cn } from '@/lib/utils';
import { Shield, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';

export function BecomeSellerPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [rib, setRib] = useState('');
  const [loading, setLoading] = useState(false);

  const isAlreadySeller = user?.role === 'vendeur' || user?.role === 'both';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rib || rib.replace(/\s/g, '').length < 24) {
      toast('error', isAr ? 'أدخل RIB صحيح (24 حرفاً على الأقل)' : 'RIB invalide (24 caractères minimum)');
      return;
    }
    setLoading(true);
    try {
      await authApi.updateProfile({ rib, role: 'both' });
      await refreshUser();
      toast('success', isAr ? 'تم تفعيل حساب البائع' : 'Compte vendeur activé !');
      navigate('/vendeur/ajouter');
    } catch (err: any) {
      toast('error', err?.response?.data?.message || (isAr ? 'خطأ' : 'Erreur'));
    } finally {
      setLoading(false);
    }
  };

  if (isAlreadySeller) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green mx-auto mb-4" />
        <h1 className="text-2xl font-serif font-bold text-cream mb-4">
          {isAr ? 'أنت بالفعل بائع' : 'Vous êtes déjà vendeur'}
        </h1>
        <Link to="/vendeur/ajouter" className="btn-gold inline-flex items-center gap-2">
          {isAr ? 'أضف إعلان' : 'Ajouter une annonce'} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-serif font-bold text-cream mb-4">
          {isAr ? 'سجل دخولك أولاً' : 'Connectez-vous d\'abord'}
        </h1>
        <p className="text-text-subdued mb-6">
          {isAr ? 'تحتاج إلى حساب لتصبح بائعاً' : 'Vous avez besoin d\'un compte pour devenir vendeur'}
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/auth/login" className="btn-gold">
            {t('nav.connexion')}
          </Link>
          <Link to="/auth/register" className="btn-outline">
            {t('nav.inscription')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-gold" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-cream mb-3">
          {isAr ? 'أصبح بائعاً' : 'Devenir vendeur'}
        </h1>
        <p className="text-text-subdued max-w-md mx-auto">
          {isAr
            ? 'أضف ر IB حسابك البنكي لبدء البيع واستلام أموالك'
            : 'Renseignez votre RIB pour commencer à vendre et recevoir vos fonds'}
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { num: '1', label: isAr ? 'أضف RIB' : 'Ajoutez votre RIB', done: false },
          { num: '2', label: isAr ? 'أضف منتجات' : 'Créez vos annonces', done: false },
          { num: '3', label: isAr ? 'ابدأ البيع' : 'Vendez et encaissez', done: false },
        ].map((step, i) => (
          <div key={i} className="text-center">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold',
              i === 0 ? 'bg-gold text-white' : 'bg-navy-hover text-text-subdued'
            )}>
              {step.num}
            </div>
            <span className="text-xs text-text-subdued">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-cream mb-1">
            {isAr ? 'رقم الحساب البنكي (RIB)' : 'Relevé d\'Identité Bancaire (RIB)'}
          </label>
          <input
            type="text"
            value={rib}
            onChange={(e) => setRib(e.target.value)}
            className="input-field font-mono"
            placeholder="MA64 007 0700 0000 0000 0000 0503"
            required
          />
          <p className="text-xs text-text-subdued mt-1">
            {isAr ? '24 حرفاً على الأقل. بياناتك مشفرة ومحمية.' : '24 caractères minimum. Vos données sont chiffrées et protégées.'}
          </p>
        </div>

        <div className="bg-navy-hover rounded-lg p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-green shrink-0 mt-0.5" />
          <div className="text-sm text-text-subdued">
            <p className="font-medium text-cream mb-1">
              {isAr ? 'أمان بياناتك' : 'Vos données sont sécurisées'}
            </p>
            <p>
              {isAr
                ? 'يتم تشفير RIB الخاص بك ولا يظهر إلا لمسؤولي المنصة عند معالجة الدفع.'
                : 'Votre RIB est chiffré et n\'est visible que par les administrateurs pour le traitement des paiements.'}
            </p>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2">
          {loading
            ? (isAr ? 'جاري التفعيل...' : 'Activation...')
            : (isAr ? 'تفعيل حساب البائع' : 'Activer le compte vendeur')}
        </button>
      </form>
    </div>
  );
}
