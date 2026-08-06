import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '@/api';
import { cn } from '@/lib/utils';

export function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('commun.erreur'));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="card p-8">
            <div className="w-16 h-16 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-cream mb-2">
              {isAr ? 'تم الإرسال' : 'Email envoye'}
            </h1>
            <p className="text-text-subdued mb-6">
              {isAr
                ? 'تحقق من بريدك الإلكتروني לקבלת رابط إعادة تعيين كلمة المرور.'
                : 'Verifiez votre boite de reception pour le lien de reinitialisation du mot de passe.'}
            </p>
            <Link to="/auth/login" className="btn-gold inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {isAr ? 'العودة للتسجيل' : 'Retour a la connexion'}
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
            <Mail className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-cream">
            {isAr ? 'نسيت كلمة المرور' : 'Mot de passe oublie'}
          </h1>
          <p className="text-text-subdued mt-2">
            {isAr
              ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.'
              : 'Entrez votre email et nous vous enverrons un lien pour reinitialiser votre mot de passe.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red/10 text-red rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-cream mb-1">
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder={isAr ? 'email@exemple.com' : 'votre@email.com'}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">
            {loading ? '...' : isAr ? 'إرسال الرابط' : 'Envoyer le lien'}
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
