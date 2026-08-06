import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '@/api';
import { cn } from '@/lib/utils';

export function ResetPasswordPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token || !email) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="card p-8">
            <h1 className="text-2xl font-serif font-bold text-cream mb-4">
              {isAr ? 'رابط غير صالح' : 'Lien invalide'}
            </h1>
            <p className="text-text-subdued mb-6">
              {isAr
                ? 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.'
                : 'Le lien de reinitialisation est invalide ou expire.'}
            </p>
            <Link to="/auth/forgot-password" className="btn-gold">
              {isAr ? 'طلب رابط جديد' : 'Demander un nouveau lien'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, email, password, password_confirmation: passwordConfirmation });
      setSuccess(true);
      setTimeout(() => navigate('/auth/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('commun.erreur'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="card p-8">
            <div className="w-16 h-16 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-cream mb-2">
              {isAr ? 'تم التغيير بنجاح' : 'Mot de passe modifie'}
            </h1>
            <p className="text-text-subdued mb-6">
              {isAr
                ? 'تم تغيير كلمة المرور بنجاح. سيتم تحويلك إلى صفحة تسجيل الدخول.'
                : 'Votre mot de passe a ete modifie avec succes. Redirection vers la connexion...'}
            </p>
            <Link to="/auth/login" className="btn-gold">
              {t('auth.se_connecter')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-cream">
            {isAr ? 'إعادة تعيين كلمة المرور' : 'Nouveau mot de passe'}
          </h1>
          <p className="text-text-subdued mt-2">
            {isAr
              ? 'أدخل كلمة المرور الجديدة.'
              : 'Entrez votre nouveau mot de passe.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red/10 text-red rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-cream mb-1">
              {t('auth.mot_de_passe')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cream mb-1">
              {t('auth.confirmer_mdp')}
            </label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="input-field"
              required
              minLength={8}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">
            {loading ? '...' : isAr ? 'إعادة التعيين' : 'Reinitialiser'}
          </button>
        </form>

        <p className={cn('text-center mt-6 text-sm text-text-subdued', isAr && 'text-right')}>
          <Link to="/auth/login" className="text-gold hover:underline font-medium inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            {isAr ? 'العودة للتسجيل' : 'Retour a la connexion'}
          </Link>
        </p>
      </div>
    </div>
  );
}
