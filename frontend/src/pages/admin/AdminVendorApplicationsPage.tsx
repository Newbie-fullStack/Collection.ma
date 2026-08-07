import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { adminVendorApplicationsApi, type AdminVendorApplication } from '@/api';
import { XCircle, CheckCircle, ShieldAlert, ExternalLink, Loader2 } from 'lucide-react';

const STATUT_LABEL: Record<string, { fr: string; ar: string; color: string }> = {
  en_attente: { fr: 'En attente', ar: 'قيد الانتظار', color: 'bg-gold/10 text-gold' },
  complement_demande: { fr: 'Complément', ar: 'استكمال', color: 'bg-yellow/10 text-yellow' },
  valide: { fr: 'Validé', ar: 'مقبول', color: 'bg-green/10 text-green' },
  refuse: { fr: 'Refusé', ar: 'مرفوض', color: 'bg-red/10 text-red' },
};

export function AdminVendorApplicationsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [apps, setApps] = useState<AdminVendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<AdminVendorApplication | null>(null);
  const [actioning, setActioning] = useState(false);
  const [rejectMotif, setRejectMotif] = useState('');
  const [complementMsg, setComplementMsg] = useState('');

  const load = (statut = filter) => {
    setLoading(true);
    adminVendorApplicationsApi.list(statut ? { statut, per_page: 30 } : { per_page: 30 })
      .then(({ data }) => setApps(data.data || []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => load(), []);
  const changeFilter = (s: string) => { setFilter(s); load(s); };

  const select = (app: AdminVendorApplication) => {
    setSelected(app);
    setRejectMotif('');
    setComplementMsg('');
  };

  const doAction = async (fn: () => Promise<unknown>) => {
    if (!selected) return;
    setActioning(true);
    try {
      await fn();
      setSelected(null);
      load(filter);
    } finally {
      setActioning(false);
    }
  };

  const l = (fr: string, ar: string) => (isAr ? ar : fr);

  return (
    <div>
      <div className={cn('flex flex-wrap items-center justify-between gap-3 mb-6', isAr && 'flex-row-reverse')}>
        <h2 className="text-xl font-serif font-bold text-cream">{l('Validation des vendeurs', 'التحقق من البائعين')}</h2>
        <div className="flex gap-2 overflow-x-auto">
          {[['', 'Tous'], ['en_attente', 'En attente'], ['complement_demande', 'Complément'], ['valide', 'Validés'], ['refuse', 'Refusés']].map(([v, label]) => (
            <button
              key={v}
              onClick={() => changeFilter(v)}
              className={cn('px-3 py-1.5 rounded-full text-xs whitespace-nowrap', filter === v ? 'bg-gold text-navy' : 'bg-navy-hover text-text-subdued')}
            >
              {isAr ? STATUT_LABEL[v]?.ar : label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="card p-4 animate-pulse"><div className="h-4 bg-navy-hover rounded w-1/3" /></div>)}</div>
      ) : apps.length === 0 ? (
        <div className="card p-8 text-center text-text-subdued">
          <ShieldAlert className="w-10 h-10 text-text-subdued mx-auto mb-3" />
          {l('Aucune demande.', 'لا توجد طلبات.')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/10 text-xs text-text-subdued">
                <th className="px-3 py-3 text-left font-medium">{l('Utilisateur', 'المستخدم')}</th>
                <th className="px-3 py-3 text-left font-medium">{l('Soumise le', 'أُرسل في')}</th>
                <th className="px-3 py-3 text-left font-medium">{l('Statut', 'الحالة')}</th>
                <th className="px-3 py-3 text-left font-medium">{l('Action', 'إجراء')}</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => {
                const st = STATUT_LABEL[app.statut] || STATUT_LABEL.en_attente;
                return (
                  <tr key={app.id} className="border-b border-gold/10 last:border-0 hover:bg-navy-hover/50">
                    <td className="px-3 py-3">
                      <p className="text-sm text-cream font-medium">{app.user?.pseudo}</p>
                      <p className="text-xs text-text-subdued">{app.user?.prenom} {app.user?.nom}</p>
                    </td>
                    <td className="px-3 py-3 text-sm text-text-subdued">
                      {app.date_soumission ? new Date(app.date_soumission).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA') : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('badge text-[10px]', st.color)}>{isAr ? st.ar : st.fr}</span>
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => select(app)} className="btn-gold-outline px-3 py-1 text-xs">
                        {l('Détails', 'التفاصيل')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cream">{l('Demande de vendeur', 'طلب بائع')}</h3>
              <button onClick={() => setSelected(null)} className="text-text-subdued hover:text-cream text-xl">×</button>
            </div>

            {/* Infos utilisateur */}
            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div className="bg-navy-hover rounded p-3">
                <p className="text-xs text-text-subdued">{l('Utilisateur', 'المستخدم')}</p>
                <p className="text-cream font-medium">{selected.user?.pseudo}</p>
              </div>
              <div className="bg-navy-hover rounded p-3">
                <p className="text-xs text-text-subdued">{l('Email', 'البريد')}</p>
                <p className="text-cream truncate">{selected.user?.email}</p>
              </div>
              {selected.date_naissance && (
                <div className="bg-navy-hover rounded p-3">
                  <p className="text-xs text-text-subdued">{l('Naissance', 'تاريخ الميلاد')}</p>
                  <p className="text-cream">{new Date(selected.date_naissance).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}</p>
                </div>
              )}
              {selected.adresse_confirmee && (
                <div className="bg-navy-hover rounded p-3">
                  <p className="text-xs text-text-subdued">{l('Adresse', 'العنوان')}</p>
                  <p className="text-cream">{selected.adresse_confirmee}</p>
                </div>
              )}
            </div>

            {/* Documents viewer */}
            <div className="mb-4">
              <p className="text-sm font-medium text-cream mb-2">{l('Documents', 'الوثائق')}</p>
              <div className="grid grid-cols-3 gap-3">
                {(['cin_recto', 'cin_verso', 'contrat_signe'] as const).map((t) => (
                  <a
                    key={t}
                    href={adminVendorApplicationsApi.documentUrl(selected.id, t)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-navy-hover hover:bg-navy rounded p-3 flex flex-col items-center gap-2 text-center"
                  >
                    <ExternalLink className="w-5 h-5 text-gold" />
                    <span className="text-xs text-text-subdued">
                      {t === 'cin_recto' ? (isAr ? 'CIN وجه' : 'CIN recto') : t === 'cin_verso' ? (isAr ? 'CIN ظهر' : 'CIN verso') : (isAr ? 'العقد الموقع' : 'Contrat signé')}
                    </span>
                  </a>
                ))}
              </div>
              <p className="text-xs text-text-subdued mt-2">{l('Les documents s\'ouvrent dans un nouvel onglet (lecture sécurisée).', 'تفتح الوثائق في نافذة جديدة (قراءة آمنة).')}</p>
            </div>

            {/* Contract download (generated) */}
            <div className="mb-6">
              <a href={adminVendorApplicationsApi.contractUrl(selected.id)} target="_blank" rel="noopener noreferrer" className="text-sm text-gold hover:underline">
                {l('Télécharger le contrat proposé', 'تحميل العقد المقترح')} ↓
              </a>
            </div>

            {/* Actions */}
            {['en_attente', 'complement_demande'].includes(selected.statut) && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => doAction(() => adminVendorApplicationsApi.approve(selected.id))}
                    disabled={actioning}
                    className="btn-gold flex items-center gap-2 px-4 py-2 text-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> {l('Approuver', 'قبول')}
                  </button>
                  <button
                    onClick={() => doAction(() => {
                      if (!rejectMotif.trim()) { alert(l('Motif de refus obligatoire', 'سبب الرفض مطلوب')); return Promise.reject(); }
                      return adminVendorApplicationsApi.reject(selected.id, rejectMotif.trim());
                    })}
                    disabled={actioning}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-red/10 text-red hover:bg-red/20"
                  >
                    <XCircle className="w-4 h-4" /> {l('Refuser', 'رفض')}
                  </button>
                </div>
                <div>
                  <textarea value={rejectMotif} onChange={(e) => setRejectMotif(e.target.value)} rows={2} className="input-field" placeholder={l('Motif de refus', 'سبب الرفض')} />
                </div>
                <div>
                  <div className="text-sm font-medium text-cream mb-1">{l('Demander complément', 'طلب استكمال')}</div>
                  <div className="flex gap-2">
                    <input value={complementMsg} onChange={(e) => setComplementMsg(e.target.value)} className="input-field" placeholder={l('Message au demandeur', 'رسالة إلى مقدم الطلب')} />
                    <button
                      onClick={() => doAction(() => {
                        if (!complementMsg.trim()) { alert('Message obligatoire'); return Promise.reject(); }
                        return adminVendorApplicationsApi.requestComplement(selected.id, complementMsg.trim());
                      })}
                      disabled={actioning}
                      className="btn-gold-outline px-4 py-2 text-sm shrink-0"
                    >
                      {l('Envoyer', 'إرسال')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {actioning && (
              <div className="flex items-center gap-2 text-gold mt-4"><Loader2 className="w-4 h-4 animate-spin" /> {l('Traitement...', 'جارٍ المعالجة...')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}