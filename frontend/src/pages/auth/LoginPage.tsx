import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('remember_me_email') !== null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate('/compte');
    } catch (err: any) {
      setError(err.response?.data?.message || t('commun.erreur'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-cream">{t('auth.connexion')}</h1>
          <p className="text-text-subdued mt-2">{t('accueil.sous_titre')}</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red/10 text-red rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-cream mb-1">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cream mb-1">{t('auth.mot_de_passe')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-text-subdued cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gold/30 text-gold focus:ring-gold"
              />
              {isAr ? 'تذكرني' : 'Se souvenir de moi'}
            </label>
            <Link to="/auth/forgot-password" className="text-sm text-gold hover:underline">
              {t('auth.mot_de_passe_oublie')}
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">
            {loading ? '...' : t('auth.se_connecter')}
          </button>
        </form>

        <p className={cn('text-center mt-6 text-sm text-text-subdued', isAr && 'text-right')}>
          {t('auth.pas_de_compte')}{' '}
          <Link to="/auth/register" className="text-gold hover:underline font-medium">
            {t('auth.inscription')}
          </Link>
        </p>
      </div>
    </div>
  );
}
