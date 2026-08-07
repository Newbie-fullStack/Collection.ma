import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';
import { User, Lock, Globe, Save, Eye, EyeOff, Trash2, BadgeCheck } from 'lucide-react';

export function ProfileSettingsPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const { user, refreshUser, deleteAccount } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences'>('profile');
  const [loading, setLoading] = useState(false);
  const isSeller = user?.role === 'vendeur' || user?.role === 'both';

  const [profileForm, setProfileForm] = useState({
    pseudo: '',
    nom: '',
    prenom: '',
    age: '',
    gsm: '',
    email: '',
    adresse_exacte: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        pseudo: user.pseudo || '',
        nom: user.nom || '',
        prenom: user.prenom || '',
        age: user.age?.toString() || '',
        gsm: user.gsm || '',
        email: user.email || '',
        adresse_exacte: user.adresse_exacte || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.updateProfile({
        ...profileForm,
        age: profileForm.age ? parseInt(profileForm.age) : null,
      });
      await refreshUser();
      toast('success', isAr ? 'تم تحديث الملف الشخصي' : 'Profil mis a jour');
    } catch (err: any) {
      toast('error', err?.response?.data?.message || (isAr ? 'خطأ في التحديث' : 'Erreur de mise a jour'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast('error', isAr ? 'كلمتا المرور غير متطابقتين' : 'Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword({
        current_password: passwordForm.current_password,
        password: passwordForm.password,
      });
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
      toast('success', isAr ? 'تم تغيير كلمة المرور' : 'Mot de passe modifie');
    } catch (err: any) {
      toast('error', err?.response?.data?.message || (isAr ? 'خطأ في التغيير' : 'Erreur de modification'));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'profile' as const, icon: User, label: isAr ? 'الملف الشخصي' : 'Profil' },
    { key: 'password' as const, icon: Lock, label: isAr ? 'كلمة المرور' : 'Mot de passe' },
    { key: 'preferences' as const, icon: Globe, label: isAr ? 'التفضيلات' : 'Preferences' },
  ];

  const sellerTab = !isSeller
    ? { key: 'vendeur' as const, icon: BadgeCheck, label: isAr ? 'كن بائعاً' : 'Devenir vendeur' }
    : null;
  const allTabs = sellerTab ? [...tabs, sellerTab] : tabs;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className={cn('text-2xl sm:text-3xl font-serif font-bold text-cream mb-6 sm:mb-8', isAr && 'text-right')}>
        {isAr ? 'إعدادات الحساب' : 'Parametres du compte'}
      </h1>

      <div className={cn('flex flex-col sm:flex-row gap-4 sm:gap-8', isAr && 'sm:flex-row-reverse')}>
        {/* Tabs */}
        <div className="w-full sm:w-56 shrink-0">
          <nav className="flex sm:flex-col gap-1 overflow-x-auto">
            {allTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    if (tab.key === 'vendeur') {
                      navigate('/devenir-vendeur');
                      return;
                    }
                    setActiveTab(tab.key);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors text-left',
                    activeTab === tab.key
                      ? 'bg-gold/10 text-gold'
                      : 'text-text-subdued hover:bg-navy-hover hover:text-cream'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="card p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h2 className="text-lg font-semibold text-cream mb-4">
                {isAr ? 'المعلومات الشخصية' : 'Informations personnelles'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cream mb-1">
                    {isAr ? 'الاسم المستعار' : 'Pseudo'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.pseudo}
                    onChange={(e) => setProfileForm((p) => ({ ...p, pseudo: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-1">
                    {isAr ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-1">
                    {isAr ? 'اللقب' : 'Nom'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.nom}
                    onChange={(e) => setProfileForm((p) => ({ ...p, nom: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-1">
                    {isAr ? 'الاسم' : 'Prenom'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.prenom}
                    onChange={(e) => setProfileForm((p) => ({ ...p, prenom: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-1">
                    {isAr ? 'العمر' : 'Age'}
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="120"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm((p) => ({ ...p, age: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-1">
                    {isAr ? 'رقم الهاتف' : 'GSM'}
                  </label>
                  <input
                    type="tel"
                    value={profileForm.gsm}
                    onChange={(e) => setProfileForm((p) => ({ ...p, gsm: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream mb-1">
                  {isAr ? 'العنوان' : 'Adresse exacte'}
                </label>
                <textarea
                  value={profileForm.adresse_exacte}
                  onChange={(e) => setProfileForm((p) => ({ ...p, adresse_exacte: e.target.value }))}
                  rows={3}
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-gold flex items-center gap-2">
                <Save className="w-4 h-4" />
                {loading ? (isAr ? 'جاري الحفظ...' : 'Enregistrement...') : (isAr ? 'حفظ' : 'Enregistrer')}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="card p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h2 className="text-lg font-semibold text-cream mb-4">
                {isAr ? 'تغيير كلمة المرور' : 'Changer le mot de passe'}
              </h2>

              <div>
                <label className="block text-sm font-medium text-cream mb-1">
                  {isAr ? 'كلمة المرور الحالية' : 'Mot de passe actuel'}
                </label>
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cream mb-1">
                  {isAr ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, password: e.target.value }))}
                    className="input-field pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subdued hover:text-cream"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream mb-1">
                  {isAr ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}
                </label>
                <input
                  type="password"
                  value={passwordForm.password_confirmation}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, password_confirmation: e.target.value }))}
                  className="input-field"
                  required
                  minLength={8}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-gold flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {loading ? (isAr ? 'جاري التغيير...' : 'Modification...') : (isAr ? 'تغيير' : 'Modifier')}
              </button>
            </form>
          )}

          {activeTab === 'preferences' && (
            <div className="card p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h2 className="text-lg font-semibold text-cream mb-4">
                {isAr ? 'التفضيلات' : 'Preferences'}
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gold/10">
                  <div>
                    <p className="font-medium text-cream text-sm">{isAr ? 'اللغة' : 'Langue'}</p>
                    <p className="text-xs text-text-subdued">{isAr ? 'اللغة الافتراضية للواجهة' : 'Langue par defaut de l\'interface'}</p>
                  </div>
                  <select
                    value={i18n.language}
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    className="input-field w-32"
                  >
                    <option value="fr">Francais</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gold/10">
                  <div>
                    <p className="font-medium text-cream text-sm">{isAr ? 'الإشعارات' : 'Notifications'}</p>
                    <p className="text-xs text-text-subdued">{isAr ? 'إدارة إشعارات البريد الإلكتروني' : 'Gerer les notifications email'}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-navy-hover rounded-full peer peer-checked:bg-gold peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-cream text-sm">{isAr ? 'حذف الحساب' : 'Supprimer le compte'}</p>
                    <p className="text-xs text-text-subdued">{isAr ? 'حذف حسابك نهائياً' : 'Supprimer definitivement votre compte'}</p>
                  </div>
                  <button
                    onClick={async () => {
                      const confirmed = window.confirm(
                        isAr
                          ? 'هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.'
                          : 'Etes-vous sur de vouloir supprimer votre compte ? Cette action est irreversible.'
                      );
                      if (confirmed) {
                        try {
                          await deleteAccount();
                          toast('success', isAr ? 'تم حذف الحساب' : 'Compte supprime');
                          navigate('/');
                        } catch {
                          toast('error', t('commun.erreur'));
                        }
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red border border-red/30 rounded-lg hover:bg-red/5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isAr ? 'حذف' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
