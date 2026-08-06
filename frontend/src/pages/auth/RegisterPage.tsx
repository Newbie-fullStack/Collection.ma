import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pseudo: '', nom: '', prenom: '', age: '', gsm: '', email: '',
    adresse_exacte: '', rib: '', password: '', password_confirmation: '',
    langue_preferee: isAr ? 'ar' : 'fr', cgu_acceptee: false,
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      await register({
        ...form,
        age: form.age ? parseInt(form.age) : null,
        cgu_acceptee: form.cgu_acceptee,
      });
      navigate('/compte');
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const mapped: Record<string, string> = {};
        Object.entries(errors).forEach(([field, msgs]) => {
          mapped[field] = (msgs as string[])[0];
        });
        setFieldErrors(mapped);
        const firstMsg = Object.values(mapped)[0];
        setError(firstMsg || t('commun.erreur'));
      } else {
        setError(err.response?.data?.message || t('commun.erreur'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-cream">{t('auth.inscription')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red/10 text-red rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream mb-1">{t('auth.nom')}</label>
              <input name="nom" value={form.nom} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream mb-1">{t('auth.prenom')}</label>
              <input name="prenom" value={form.prenom} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-cream mb-1">{t('auth.pseudo')}</label>
            <input name="pseudo" value={form.pseudo} onChange={handleChange} className="input-field" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream mb-1">{t('auth.age')}</label>
              <input name="age" type="number" min="18" max="120" value={form.age} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream mb-1">{t('auth.gsm')}</label>
              <input name="gsm" value={form.gsm} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-cream mb-1">{t('auth.email')}</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-cream mb-1">{t('auth.adresse')}</label>
            <input name="adresse_exacte" value={form.adresse_exacte} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-cream mb-1">{t('auth.rib')}</label>
            <input name="rib" value={form.rib} onChange={handleChange} className="input-field" placeholder="MA64 007 0700 0000 0000 0000 0503" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream mb-1">{t('auth.mot_de_passe')}</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className={cn("input-field", fieldErrors.password && 'border-red')} required minLength={8} />
              <p className="text-xs text-text-subdued mt-1">
                {isAr ? '8 أحرف على الأقل، حرف كبير + رقم' : '8 car. min, majuscule + chiffre'}
              </p>
              {fieldErrors.password && <p className="text-xs text-red mt-1">{fieldErrors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-cream mb-1">{t('auth.confirmer_mdp')}</label>
              <input name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} className="input-field" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-cream mb-1">{t('auth.langue_preferee')}</label>
            <select name="langue_preferee" value={form.langue_preferee} onChange={handleChange} className="input-field">
              <option value="fr">Francais</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input
              name="cgu_acceptee"
              type="checkbox"
              checked={form.cgu_acceptee}
              onChange={handleChange}
              className="mt-0.5 rounded"
              required
            />
            <span className="text-text-subdued">{t('auth.accepter_cgu')}</span>
          </label>

          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">
            {loading ? '...' : t('auth.creer_compte')}
          </button>
        </form>

        <p className={cn('text-center mt-6 text-sm text-text-subdued', isAr && 'text-right')}>
          {t('auth.deja_compte')}{' '}
          <Link to="/auth/login" className="text-gold hover:underline font-medium">
            {t('auth.se_connecter')}
          </Link>
        </p>
      </div>
    </div>
  );
}
