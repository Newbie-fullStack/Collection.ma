import { useTranslation } from 'react-i18next';
import { cn, formatMAD } from '@/lib/utils';
import {
  Users, Package, Settings, DollarSign,
  AlertTriangle, FileText, CheckCircle, XCircle,
  Search, Eye, Ban, Shield, ShieldOff
} from 'lucide-react';
import type { User, Listing, Dispute, Invoice, Category, Advertisement } from '@/types';
import { useState, useEffect } from 'react';
import api from '@/api/client';

function PageHeader({ title, isAr }: { title: string; isAr: boolean }) {
  return (
    <h2 className={cn('text-xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
      {title}
    </h2>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="card p-8 text-center">
      <Icon className="w-12 h-12 text-text-subdued mx-auto mb-3" />
      <p className="text-text-subdued">{message}</p>
    </div>
  );
}

function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 animate-pulse flex gap-4">
          <div className="w-12 h-12 bg-navy-hover rounded shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-navy-hover rounded w-1/3" />
            <div className="h-3 bg-navy-hover rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── USERS ───────────────────────────────────────────────
export function AdminUsersPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const params: Record<string, string> = { per_page: '50' };
    if (search) params.q = search;
    if (roleFilter) params.role = roleFilter;
    api.get('/admin/users', { params })
      .then(({ data }) => setUsers(data.data || []))
      .catch((err) => { setUsers([]); setError(err.response?.data?.message || 'Erreur'); })
      .finally(() => setLoading(false));
  }, [search, roleFilter]);

  const toggleStatus = async (userId: number) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle-status`);
      setUsers(prev => prev.map(u => u.id === userId ? data : u));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const suspendUser = async (userId: number) => {
    if (!confirm(isAr ? 'هل أنت متأكد؟' : 'Confirmer la suspension?')) return;
    try {
      const { data } = await api.post(`/admin/users/${userId}/suspend`);
      setUsers(prev => prev.map(u => u.id === userId ? data : u));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const roleLabel: Record<string, string> = {
    acheteur: isAr ? 'مشتري' : 'Acheteur',
    vendeur: isAr ? 'بائع' : 'Vendeur',
    both: isAr ? 'مشتري/بائع' : 'A/V',
    admin: isAr ? 'مدير' : 'Admin',
  };

  const kycLabel: Record<string, string> = {
    verifie: isAr ? 'موثق' : 'Verifie',
    non_verifie: isAr ? 'غير موثق' : 'Non verifie',
    en_cours: isAr ? 'قيد المراجعة' : 'En cours',
    rejete: isAr ? 'مرفوض' : 'Rejete',
  };

  return (
    <div>
      <PageHeader title={isAr ? 'المستخدمون' : 'Utilisateurs'} isAr={isAr} />
      {error && <div className="mb-4 p-3 bg-red/10 border border-red/30 rounded text-sm text-red">{error}</div>}
      <div className={cn('flex gap-3 mb-4 flex-wrap', isAr && 'flex-row-reverse')}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subdued" />
          <input type="text" placeholder={isAr ? '...' : 'Rechercher...'} value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gold/15 bg-navy-hover text-sm text-cream focus:outline-none focus:border-gold" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gold/15 bg-navy-hover text-sm text-cream focus:outline-none focus:border-gold">
          <option value="">{isAr ? 'الكل' : 'Tous les roles'}</option>
          <option value="acheteur">Acheteur</option>
          <option value="vendeur">Vendeur</option>
          <option value="both">A/V</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {loading ? <LoadingSkeleton /> : users.length === 0 ? (
        <EmptyState icon={Users} message={isAr ? 'لا يوجد مستخدمون' : 'Aucun utilisateur'} />
      ) : (
        <div className="card">
          <div className="divide-y divide-gold/10">
            {users.map(user => (
              <div key={user.id} className={cn('p-4 flex items-center gap-4', isAr && 'flex-row-reverse')}>
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-gold">{user.pseudo?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-cream">{user.pseudo}</p>
                  <p className="text-xs text-text-subdued truncate">{user.email}</p>
                  <div className={cn('flex items-center gap-2 mt-1', isAr && 'flex-row-reverse')}>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-navy-hover text-cream">{roleLabel[user.role]}</span>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full', user.statut_kyc === 'verifie' ? 'bg-green/10 text-green' : user.statut_kyc === 'rejete' ? 'bg-red/10 text-red' : 'bg-yellow/10 text-yellow')}>
                      {kycLabel[user.statut_kyc] || user.statut_kyc}
                    </span>
                  </div>
                </div>
                <div className={cn('flex items-center gap-1 shrink-0', isAr && 'flex-row-reverse')}>
                  {user.role !== 'admin' && (
                    <>
                      <button onClick={() => toggleStatus(user.id)} title={isAr ? 'تبديل KYC' : 'Toggle KYC'}
                        className={cn('p-1.5 rounded transition-colors', user.statut_kyc === 'verifie' ? 'text-red hover:bg-red/10' : 'text-green hover:bg-green/10')}>
                        {user.statut_kyc === 'verifie' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button onClick={() => suspendUser(user.id)} title={isAr ? '_suspendre' : 'Suspendre'}
                        className="p-1.5 rounded text-red hover:bg-red/10 transition-colors">
                        <Ban className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LISTINGS ────────────────────────────────────────────
export function AdminListingsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statutFilter, setStatutFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { per_page: '50' };
    if (statutFilter) params.statut = statutFilter;
    api.get('/admin/listings', { params })
      .then(({ data }) => setListings(data.data || []))
      .catch((err) => { setListings([]); setError(err.response?.data?.message || 'Erreur'); })
      .finally(() => setLoading(false));
  }, [statutFilter]);

  const approve = async (id: number) => {
    try {
      const { data } = await api.post(`/admin/listings/${id}/approve`);
      setListings(prev => prev.map(l => l.id === id ? data : l));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const suspend = async (id: number) => {
    try {
      const { data } = await api.post(`/admin/listings/${id}/suspend`);
      setListings(prev => prev.map(l => l.id === id ? data : l));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const statutLabel: Record<string, string> = {
    active: isAr ? 'نشط' : 'Active',
    brouillon: isAr ? 'مسودة' : 'Brouillon',
    vendue: isAr ? 'مباع' : 'Vendue',
    suspendue: isAr ? 'معلق' : 'Suspendue',
    expiree: isAr ? 'منتهي' : 'Expiree',
  };

  const statutColor: Record<string, string> = {
    active: 'badge-green',
    brouillon: 'badge-gold',
    vendue: 'badge-blue',
    suspendue: 'badge-red',
    expiree: 'badge-red',
  };

  return (
    <div>
      <PageHeader title={isAr ? 'الإعلانات' : 'Annonces'} isAr={isAr} />
      {error && <div className="mb-4 p-3 bg-red/10 border border-red/30 rounded text-sm text-red">{error}</div>}
      <div className={cn('flex gap-2 mb-4 flex-wrap', isAr && 'flex-row-reverse')}>
        {['', 'active', 'brouillon', 'vendue', 'suspendue', 'expiree'].map(s => (
          <button key={s} onClick={() => setStatutFilter(s)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', statutFilter === s ? 'bg-gold text-navy' : 'bg-navy-hover text-text-subdued hover:bg-gold/10')}>
            {s ? statutLabel[s] : (isAr ? 'الكل' : 'Toutes')}
          </button>
        ))}
      </div>
      {loading ? <LoadingSkeleton /> : listings.length === 0 ? (
        <EmptyState icon={Package} message={isAr ? 'لا توجد إعلانات' : 'Aucune annonce'} />
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div key={listing.id} className="card p-4">
              <div className={cn('flex items-center gap-4', isAr && 'flex-row-reverse')}>
                <div className="w-14 h-14 rounded bg-navy-hover overflow-hidden shrink-0">
                  {listing.photos?.[0] ? (
                    <img src={`/storage/${listing.photos[0].path}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-subdued"><Package className="w-5 h-5" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-cream truncate">{listing.titre}</p>
                  <p className="text-xs text-text-subdued">{isAr ? 'بائع' : 'Vendeur'}: {listing.seller?.pseudo || 'N/A'}</p>
                  <p className="text-[10px] text-text-subdued">{listing.category?.nom_fr || 'N/A'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-cream">{formatMAD(listing.prix_actuel || listing.prix_vente, i18n.language)}</p>
                  <span className={cn('badge text-[10px]', statutColor[listing.statut] || 'badge-gold')}>
                    {statutLabel[listing.statut] || listing.statut}
                  </span>
                </div>
              </div>
              <div className={cn('flex gap-2 mt-3 pt-3 border-t border-gold/10', isAr && 'flex-row-reverse')}>
                {listing.statut !== 'active' && (
                  <button onClick={() => approve(listing.id)} className="px-3 py-1 rounded text-xs text-green hover:bg-green/10 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {isAr ? 'موافقة' : 'Approuver'}
                  </button>
                )}
                {listing.statut !== 'suspendue' && (
                  <button onClick={() => suspend(listing.id)} className="px-3 py-1 rounded text-xs text-red hover:bg-red/10 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> {isAr ? 'تعليق' : 'Suspendre'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CATEGORIES ──────────────────────────────────────────
export function AdminCategoriesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/categories')
      .then(({ data }) => setCategories(data || []))
      .catch((err) => { setCategories([]); setError(err.response?.data?.message || 'Erreur'); })
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (cat: Category) => {
    try {
      const { data } = await api.put(`/admin/categories/${cat.id}`, { active: !cat.active });
      setCategories(prev => prev.map(c => c.id === cat.id ? data : c));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div>
      <PageHeader title={isAr ? 'الفئات' : 'Categories'} isAr={isAr} />
      {error && <div className="mb-4 p-3 bg-red/10 border border-red/30 rounded text-sm text-red">{error}</div>}
      {loading ? <LoadingSkeleton /> : categories.length === 0 ? (
        <EmptyState icon={Settings} message={isAr ? 'لا توجد فئات' : 'Aucune categorie'} />
      ) : (
        <div className="card">
          <div className="divide-y divide-gold/10">
            {categories.map(cat => (
              <div key={cat.id} className={cn('p-4 flex items-center gap-4', isAr && 'flex-row-reverse')}>
                <div className="w-10 h-10 rounded bg-gold/10 flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-cream">{cat.nom_fr}</p>
                  <p className="text-xs text-text-subdued">{cat.nom_ar}</p>
                </div>
                <div className={cn('flex items-center gap-2', isAr && 'flex-row-reverse')}>
                  <span className={cn('badge text-[10px]', cat.active ? 'badge-green' : 'badge-red')}>
                    {cat.active ? (isAr ? 'نشط' : 'Actif') : (isAr ? 'معطل' : 'Inactif')}
                  </span>
                  <button onClick={() => toggleActive(cat)}
                    className={cn('px-3 py-1 rounded text-xs font-medium transition-colors', cat.active ? 'bg-red/10 text-red hover:bg-red/20' : 'bg-green/10 text-green hover:bg-green/20')}>
                    {cat.active ? (isAr ? 'تعطيل' : 'Desactiver') : (isAr ? 'تفعيل' : 'Activer')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADVERTISEMENTS ──────────────────────────────────────
export function AdminAdvertisementsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/advertisements')
      .then(({ data }) => setAds(data || []))
      .catch((err) => { setAds([]); setError(err.response?.data?.message || 'Erreur'); })
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (ad: Advertisement) => {
    try {
      await api.put(`/admin/advertisements/${ad.id}`, { active: !ad.active });
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, active: !a.active } : a));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const positionLabel: Record<string, string> = {
    top_gauche: 'Top Gauche', top_droite: 'Top Droite',
    bottom_gauche: 'Bottom Gauche', bottom_droite: 'Bottom Droite',
  };

  return (
    <div>
      <PageHeader title={isAr ? 'الإعلانات المدفوعة' : 'Publicites'} isAr={isAr} />
      {error && <div className="mb-4 p-3 bg-red/10 border border-red/30 rounded text-sm text-red">{error}</div>}
      {loading ? <LoadingSkeleton /> : ads.length === 0 ? (
        <EmptyState icon={FileText} message={isAr ? 'لا توجد إعلانات' : 'Aucune publicite'} />
      ) : (
        <div className="space-y-3">
          {ads.map(ad => (
            <div key={ad.id} className="card p-4">
              <div className={cn('flex items-center gap-4', isAr && 'flex-row-reverse')}>
                <div className="w-14 h-14 rounded bg-navy-hover overflow-hidden shrink-0">
                  <img src={`/storage/${ad.image_path}`} alt={ad.titre} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-cream">{ad.titre}</p>
                  <p className="text-xs text-text-subdued">{positionLabel[ad.position]}</p>
                  {ad.lien && <p className="text-[10px] text-gold truncate">{ad.lien}</p>}
                </div>
                <div className={cn('flex items-center gap-2', isAr && 'flex-row-reverse')}>
                  <span className={cn('badge text-[10px]', ad.active ? 'badge-green' : 'badge-red')}>
                    {ad.active ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={() => toggleActive(ad)}
                    className={cn('px-3 py-1 rounded text-xs font-medium transition-colors', ad.active ? 'bg-red/10 text-red hover:bg-red/20' : 'bg-green/10 text-green hover:bg-green/20')}>
                    {ad.active ? 'Desactiver' : 'Activer'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── COMMISSIONS ─────────────────────────────────────────
export function AdminCommissionsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [taux, setTaux] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/commissions')
      .then(({ data }) => setTaux(data.taux || 10))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await api.put('/admin/commissions', { taux });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={isAr ? 'العمولات' : 'Commissions'} isAr={isAr} />
      {error && <div className="mb-4 p-3 bg-red/10 border border-red/30 rounded text-sm text-red">{error}</div>}
      <div className="card p-6 max-w-md">
        <div className="mb-4">
          <p className="text-sm text-cream font-medium mb-2">{isAr ? 'نسبة العمولة (%)' : 'Taux de commission (%)'}</p>
          <input type="number" min="0" max="50" step="0.5" value={taux} onChange={e => setTaux(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 rounded-lg border border-gold/15 bg-navy-hover text-sm text-cream focus:outline-none focus:border-gold" />
        </div>
        <div className="flex items-center gap-4 mb-4 p-3 bg-navy-hover rounded-lg">
          <DollarSign className="w-8 h-8 text-gold" />
          <div>
            <p className="text-xs text-text-subdued">{isAr ? 'مثال على بيع 1000 MAD' : 'Ex: vente a 1000 MAD'}</p>
            <p className="text-lg font-bold text-cream">{formatMAD(1000 * taux / 100, i18n.language)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? '...' : (isAr ? 'حفظ' : 'Enregistrer')}
          </button>
          {saved && <span className="text-sm text-green font-medium">{isAr ? 'تم الحفظ' : 'Sauvegarde'}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── DISPUTES ────────────────────────────────────────────
export function AdminDisputesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statutFilter, setStatutFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { per_page: '50' };
    if (statutFilter) params.statut = statutFilter;
    api.get('/admin/disputes', { params })
      .then(({ data }) => setDisputes(data.data || []))
      .catch((err) => { setDisputes([]); setError(err.response?.data?.message || 'Erreur'); })
      .finally(() => setLoading(false));
  }, [statutFilter]);

  const resolve = async (id: number, decision: 'acheteur' | 'vendeur') => {
    try {
      const { data } = await api.post(`/admin/disputes/${id}/resolve`, { decision });
      setDisputes(prev => prev.map(d => d.id === id ? data : d));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const raisonLabel: Record<string, string> = {
    objet_non_recu: isAr ? 'لم يوصل' : 'Objet non recu',
    objet_endommage: isAr ? 'تالف' : 'Objet endommage',
    objet_different: isAr ? 'مختلف' : 'Objet different',
    non_conforme: isAr ? 'غير مطابق' : 'Non conforme',
    retard_livraison: isAr ? 'تأخير التوصيل' : 'Retard livraison',
    arnaque: isAr ? 'احتيال' : 'Arnaque',
    autre: isAr ? 'أخرى' : 'Autre',
  };

  const statutLabel: Record<string, string> = {
    ouverte: isAr ? 'مفتوح' : 'Ouverte',
    en_examen: isAr ? 'قيد المراجعة' : 'En examen',
    en_attente_vendeur: isAr ? 'بانتظار البائع' : 'En attente vendeur',
    en_attente_acheteur: isAr ? 'بانتظار المشتري' : 'En attente acheteur',
    resolue_acheteur: isAr ? 'حل (مشتري)' : 'Resolu (A)',
    resolue_vendeur: isAr ? 'حل (بائع)' : 'Resolu (V)',
    cloturee: isAr ? 'مغلق' : 'Cloturee',
  };

  const statutColor: Record<string, string> = {
    ouverte: 'badge-red',
    en_examen: 'badge-gold',
    en_attente_vendeur: 'badge-blue',
    en_attente_acheteur: 'badge-blue',
    resolue_acheteur: 'badge-green',
    resolue_vendeur: 'badge-green',
    cloturee: 'badge-gold',
  };

  const isResolved = (s: string) => ['resolue_acheteur', 'resolue_vendeur', 'cloturee'].includes(s);

  return (
    <div>
      <PageHeader title={isAr ? 'النزاعات' : 'Litiges'} isAr={isAr} />
      {error && <div className="mb-4 p-3 bg-red/10 border border-red/30 rounded text-sm text-red">{error}</div>}
      <div className={cn('flex gap-2 mb-4 flex-wrap', isAr && 'flex-row-reverse')}>
        {['', 'ouverte', 'en_examen', 'resolue_acheteur', 'resolue_vendeur', 'cloturee'].map(s => (
          <button key={s} onClick={() => setStatutFilter(s)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', statutFilter === s ? 'bg-gold text-navy' : 'bg-navy-hover text-text-subdued hover:bg-gold/10')}>
            {s ? statutLabel[s] : (isAr ? 'الكل' : 'Toutes')}
          </button>
        ))}
      </div>
      {loading ? <LoadingSkeleton /> : disputes.length === 0 ? (
        <EmptyState icon={AlertTriangle} message={isAr ? 'لا توجد نزاعات' : 'Aucun litige'} />
      ) : (
        <div className="space-y-3">
          {disputes.map(dispute => (
            <div key={dispute.id} className="card p-4">
              <div className={cn('flex items-center justify-between mb-2', isAr && 'flex-row-reverse')}>
                <div>
                  <p className="font-medium text-sm text-cream">{raisonLabel[dispute.raison] || dispute.raison}</p>
                  <p className="text-xs text-text-subdued">#{dispute.order?.numero_commande} - {dispute.initiator?.pseudo}</p>
                </div>
                <span className={cn('badge text-[10px]', statutColor[dispute.statut] || 'badge-gold')}>
                  {statutLabel[dispute.statut] || dispute.statut}
                </span>
              </div>
              <p className="text-sm text-text-subdued mb-3">{dispute.description}</p>
              {!isResolved(dispute.statut) && (
                <div className={cn('flex gap-2 pt-3 border-t border-gold/10', isAr && 'flex-row-reverse')}>
                  <button onClick={() => resolve(dispute.id, 'acheteur')} className="px-3 py-1 rounded text-xs text-green hover:bg-green/10 border border-green/30">
                    {isAr ? 'حل لصالح المشتري' : "Donner a l'acheteur"}
                  </button>
                  <button onClick={() => resolve(dispute.id, 'vendeur')} className="px-3 py-1 rounded text-xs text-gold hover:bg-gold/10 border border-gold/30">
                    {isAr ? 'حل لصالح البائع' : 'Donner au vendeur'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── INVOICES ────────────────────────────────────────────
export function AdminInvoicesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { per_page: '50' };
    if (typeFilter) params.type = typeFilter;
    api.get('/admin/invoices', { params })
      .then(({ data }) => setInvoices(data.data || []))
      .catch((err) => { setInvoices([]); setError(err.response?.data?.message || 'Erreur'); })
      .finally(() => setLoading(false));
  }, [typeFilter]);

  const typeLabel: Record<string, string> = {
    acheteur: isAr ? 'مشتري' : 'Acheteur',
    vendeur: isAr ? 'بائع' : 'Vendeur',
    plateforme: isAr ? 'منصة' : 'Plateforme',
  };

  return (
    <div>
      <PageHeader title={isAr ? 'الفواتير' : 'Factures'} isAr={isAr} />
      {error && <div className="mb-4 p-3 bg-red/10 border border-red/30 rounded text-sm text-red">{error}</div>}
      <div className={cn('flex gap-2 mb-4 flex-wrap', isAr && 'flex-row-reverse')}>
        {['', 'acheteur', 'vendeur', 'plateforme'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', typeFilter === t ? 'bg-gold text-navy' : 'bg-navy-hover text-text-subdued hover:bg-gold/10')}>
            {t ? typeLabel[t] : (isAr ? 'الكل' : 'Toutes')}
          </button>
        ))}
      </div>
      {loading ? <LoadingSkeleton /> : invoices.length === 0 ? (
        <EmptyState icon={FileText} message={isAr ? 'لا توجد فواتير' : 'Aucune facture'} />
      ) : (
        <div className="card">
          <div className="divide-y divide-gold/10">
            {invoices.map(inv => (
              <div key={inv.id} className={cn('p-4 flex items-center gap-4', isAr && 'flex-row-reverse')}>
                <div className="w-10 h-10 rounded bg-gold/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-cream">{inv.numero_facture}</p>
                  <p className="text-xs text-text-subdued">{inv.user?.pseudo || 'N/A'} - #{inv.order?.numero_commande || `CMD-${inv.order_id}`}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-navy-hover text-cream">{typeLabel[inv.type]}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-cream">{formatMAD(inv.total, i18n.language)}</p>
                  <p className="text-[10px] text-text-subdued">{new Date(inv.created_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MESSAGES ────────────────────────────────────────────
export function AdminMessagesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/messages', { params: { per_page: 50 } })
      .then(({ data }) => setMessages(data.data || []))
      .catch((err) => { setMessages([]); setError(err.response?.data?.message || 'Erreur'); })
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: number) => {
    try {
      await api.put(`/admin/messages/${id}/read`);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, lu: true } : m));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div>
      <PageHeader title={isAr ? 'الرسائل' : 'Messages'} isAr={isAr} />
      {error && <div className="mb-4 p-3 bg-red/10 border border-red/30 rounded text-sm text-red">{error}</div>}
      {loading ? <LoadingSkeleton /> : messages.length === 0 ? (
        <EmptyState icon={FileText} message={isAr ? 'لا توجد رسائل' : 'Aucun message'} />
      ) : (
        <div className="space-y-3">
          {messages.map((msg: any) => (
            <div key={msg.id} className={cn('card p-4', !msg.lu && 'border-l-4 border-gold')}>
              <div className={cn('flex items-center gap-3', isAr && 'flex-row-reverse')}>
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-gold">{msg.sender?.pseudo?.[0]?.toUpperCase() || '?'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn('flex items-center gap-2', isAr && 'flex-row-reverse')}>
                    <p className="font-medium text-sm text-cream">{msg.sender?.pseudo || 'Utilisateur'}</p>
                    {msg.listing_id && <span className="text-[10px] px-2 py-0.5 rounded-full bg-navy-hover text-cream">#{msg.listing_id}</span>}
                  </div>
                  <p className="text-xs text-text-subdued">{msg.contenu}</p>
                </div>
                <div className={cn('flex items-center gap-2 shrink-0', isAr && 'flex-row-reverse')}>
                  <p className="text-[10px] text-text-subdued">{new Date(msg.created_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}</p>
                  {!msg.lu && (
                    <button onClick={() => markRead(msg.id)} className="text-[10px] text-gold hover:underline">
                      {isAr ? 'مقروء' : 'Lu'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
