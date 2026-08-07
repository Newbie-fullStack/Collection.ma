import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { vendorApplicationsApi } from '@/api';
import { cn } from '@/lib/utils';
import { Shield, Upload, FileText, CheckCircle, XCircle, Clock, Loader2, Download, ChevronLeft, ChevronRight, PenLine } from 'lucide-react';
import type { VendorApplicationStatus } from '@/api';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf'];

export function BecomeSellerPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [application, setApplication] = useState<VendorApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const isSeller = user?.role === 'vendeur' || user?.role === 'both';

  useEffect(() => {
    vendorApplicationsApi.me()
      .then(({ data }) => setApplication(data))
      .catch(() => setApplication(null))
      .finally(() => setLoading(false));
  }, []);

  const l = (fr: string, ar: string) => (isAr ? ar : fr);

  // Guard states
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (isSeller) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green mx-auto mb-4" />
        <h1 className="text-2xl font-serif font-bold text-cream mb-4">{l('Vous êtes déjà vendeur vérifié', 'أنت بائع مُتحقق منه بالفعل')}</h1>
        <Link to="/vendeur/ajouter" className="btn-gold inline-flex items-center gap-2">
          {l('Ajouter une annonce', 'أضف إعلان')} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-serif font-bold text-cream mb-4">{l('Connectez-vous d\'abord', 'سجل دخولك أولاً')}</h1>
        <p className="text-text-subdued mb-6">{l('Vous avez besoin d\'un compte pour devenir vendeur', 'تحتاج إلى حساب لتصبح بائعاً')}</p>
        <div className="flex gap-4 justify-center">
          <Link to="/auth/login" className="btn-gold">{l('Connexion', 'دخول')}</Link>
          <Link to="/auth/register" className="btn-outline">{l('Inscription', 'تسجيل')}</Link>
        </div>
      </div>
    );
  }

  // Existing application → show status banner
  if (application) {
    return <ApplicationStatus app={application} isAr={isAr} l={l} onResubmit={async () => {
      await vendorApplicationsApi.resubmit(application.id);
      const { data } = await vendorApplicationsApi.me();
      setApplication(data);
    }} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-gold" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-cream mb-3">{l('Devenir vendeur vérifié', 'كن بائعاً مُتحققاً')}</h1>
        <p className="text-text-subdued max-w-md mx-auto">
          {l('Votre identité est vérifiée par notre administration avant activation du compte vendeur.', 'يتم التحقق من هويتك من طرف الإدارة قبل تفعيل حساب البائع.')}
        </p>
      </div>

      <VendorApplicationForm user={user} l={l} isAr={isAr} toast={toast} onDone={async () => {
        const { data } = await vendorApplicationsApi.me();
        setApplication(data);
        await refreshUser();
      }} />
    </div>
  );
}

function ApplicationStatus({ app, isAr, l, onResubmit }: {
  app: VendorApplicationStatus;
  isAr: boolean;
  l: (fr: string, ar: string) => string;
  onResubmit: () => Promise<void>;
}) {
  const [resubmitting, setResubmitting] = useState(false);

  const config: Record<string, { icon: React.ElementType; color: string; text: string }> = {
    en_attente: {
      icon: Clock,
      color: 'bg-gold/10 text-gold',
      text: l('Votre demande vendeur est en cours de vérification (délai estimé : quelques jours ouvrés).', 'طلبك قيد التحقق (المدة التقريبية: بضعة أيام عمل).'),
    },
    complement_demande: {
      icon: FileText,
      color: 'bg-yellow/10 text-yellow',
      text: l('Un complément est demandé pour votre dossier.', 'مطلوب استكمال ملفك.'),
    },
    valide: {
      icon: CheckCircle,
      color: 'bg-green/10 text-green',
      text: l('Votre demande vendeur a été approuvée. Votre espace vendeur est actif.', 'تمت الموافقة على طلبك. مساحة البائع متاحة الآن.'),
    },
    refuse: {
      icon: XCircle,
      color: 'bg-red/10 text-red',
      text: l('Votre demande vendeur a été refusée.', 'تم رفض طلبك.'),
    },
  };

  const cfg = config[app.statut] || config.en_attente;
  const Icon = cfg.icon;

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className={cn('card p-6 text-center')}>
        <div className={cn('w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4', cfg.color)}>
          <Icon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif font-bold text-cream mb-3">{cfg.text}</h2>

        {app.statut === 'complement_demande' && app.message_complement && (
          <p className="text-sm text-text-subdued mb-4">{app.message_complement}</p>
        )}
        {app.statut === 'refuse' && app.motif_refus && (
          <p className="text-sm text-red/80 mb-4">{l('Motif', 'السبب')} : {app.motif_refus}</p>
        )}

        {app.date_soumission && (
          <p className="text-xs text-text-subdued mb-6">
            {l('Soumise le', 'أُرسل في')} {new Date(app.date_soumission).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}
          </p>
        )}

        {app.statut === 'refuse' && (
          <button
            onClick={async () => { setResubmitting(true); try { await onResubmit(); } finally { setResubmitting(false); } }}
            disabled={resubmitting}
            className="btn-gold w-full"
          >
            {resubmitting ? '...' : l('Soumettre une nouvelle demande', 'إعادة التقديم')}
          </button>
        )}
        {app.statut === 'valide' && (
          <Link to="/vendeur/ajouter" className="btn-gold w-full block">{l('Accéder à l\'espace vendeur', 'الدخول إلى مساحة البائع')}</Link>
        )}
      </div>
    </div>
  );
}

function VendorApplicationForm({ user, l, isAr, toast, onDone }: {
  user: any;
  l: (fr: string, ar: string) => string;
  isAr: boolean;
  toast: any;
  onDone: () => Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [dateNaissance, setDateNaissance] = useState('');
  const [adresse, setAdresse] = useState(user.adresse_exacte || '');
  const [rib, setRib] = useState(user.rib || '');
  const [cinRecto, setCinRecto] = useState<File | null>(null);
  const [cinVerso, setCinVerso] = useState<File | null>(null);
  const [contrat, setContrat] = useState<File | null>(null);

  const steps = [
    { key: 'identite', label: l('Identité', 'الهوية') },
    { key: 'cin', label: l('CIN', 'بطاقة التعريف') },
    { key: 'rib', label: l('RIB', 'رقم الحساب') },
    { key: 'contrat', label: l('Contrat', 'العقد') },
    { key: 'recap', label: l('Récap', 'الملخص') },
  ];

  const validateFile = (f: File | null): boolean => {
    if (!f) return false;
    if (!ALLOWED.includes(f.type)) {
      toast('error', l('Format non autorisé (jpg, png, pdf)', 'صيغة غير مسموحة (jpg, png, pdf)'));
      return false;
    }
    if (f.size > MAX_SIZE) {
      toast('error', l('Fichier trop volumineux (max 5 Mo)', 'ملف كبير جداً (الحد الأقصى 5 م.ب)'));
      return false;
    }
    return true;
  };

  const canNext = (): boolean => {
    if (step === 0) return dateNaissance.length > 0 && adresse.trim().length > 0;
    if (step === 1) return validateFile(cinRecto) && validateFile(cinVerso);
    if (step === 2) return rib.replace(/\s/g, '').length >= 24;
    if (step === 3) return validateFile(contrat);
    return true;
  };

  const downloadContract = async () => {
    try {
      const { data } = await vendorApplicationsApi.contract();
      const url = URL.createObjectURL(data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contrat-vendeur.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast('error', l('Erreur lors du téléchargement', 'خطأ في التنزيل'));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFile(cinRecto) || !validateFile(cinVerso) || !validateFile(contrat)) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('date_naissance', dateNaissance);
      fd.append('adresse_confirmee', adresse.trim());
      fd.append('rib', rib.trim());
      fd.append('cin_recto', cinRecto!);
      fd.append('cin_verso', cinVerso!);
      fd.append('contrat_signe', contrat!);
      await vendorApplicationsApi.submit(fd);
      toast('success', l('Demande envoyée. En attente de validation.', 'تم إرسال الطلب. بانتظار التحقق.'));
      await onDone();
    } catch (err: any) {
      toast('error', err?.response?.data?.message || l('Erreur lors de l\'envoi', 'خطأ في الإرسال'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1 min-w-[70px]">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                i < step ? 'bg-green text-white' : i === step ? 'bg-gold text-white' : 'bg-navy-hover text-text-subdued'
              )}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-[10px] text-text-subdued whitespace-nowrap">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={cn('h-0.5 flex-1 mt-[-14px]', i < step ? 'bg-green' : 'bg-navy-hover')} />}
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="card p-6 space-y-5">
        {/* Step 0: Identity */}
        {step === 0 && (
          <>
            <h3 className="text-lg font-semibold text-cream">{l('Confirmation d\'identité', 'تأكيد الهوية')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cream mb-1">{l('Nom', 'الاسم')}</label>
                <input value={user.nom || ''} disabled className="input-field opacity-60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-cream mb-1">{l('Prénom', 'الاسم الأول')}</label>
                <input value={user.prenom || ''} disabled className="input-field opacity-60" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-cream mb-1">{l('Date de naissance', 'تاريخ الميلاد')}</label>
              <input type="date" value={dateNaissance} max={new Date(Date.now() - 18 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0]} onChange={(e) => setDateNaissance(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream mb-1">{l('Adresse exacte', 'العنوان الدقيق')}</label>
              <input value={adresse} onChange={(e) => setAdresse(e.target.value)} className="input-field" required />
            </div>
            <p className="text-xs text-text-subdued flex items-center gap-1">
              <Shield className="w-3 h-3 text-green" />
              {l('Nom et prénom pré-remplis, non modifiables sans revérification.', 'الاسم واللقب مُعبّآن مسبقاً ولا يمكن تغييرهما دون إعادة تحقق.')}
            </p>
          </>
        )}

        {/* Step 1: CIN */}
        {step === 1 && (
          <>
            <h3 className="text-lg font-semibold text-cream">{l('Pièce d\'identité (CIN)', 'بطاقة التعريف الوطنية')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <FileInput label={l('CIN recto', 'وجه البطاقة')} value={cinRecto} onChange={(f) => setCinRecto(f)} isAr={isAr} l={l} />
              <FileInput label={l('CIN verso', 'ظهر البطاقة')} value={cinVerso} onChange={(f) => setCinVerso(f)} isAr={isAr} l={l} />
            </div>
            <p className="text-xs text-text-subdued flex items-center gap-1">
              <Shield className="w-3 h-3 text-green" />
              {l('JPG, PNG ou PDF — max 5 Mo. Documents strictement confidentiels.', 'JPG أو PNG أو PDF — الحد الأقصى 5 م.ب. وثائق سرية تماماً.')}
            </p>
          </>
        )}

        {/* Step 2: RIB */}
        {step === 2 && (
          <>
            <h3 className="text-lg font-semibold text-cream">{l('Relevé d\'Identité Bancaire', 'رقم الحساب البنكي')}</h3>
            <div>
              <label className="block text-sm font-medium text-cream mb-1">{l('RIB (IBAN marocain)', 'RIB (IBAN مغربي)')}</label>
              <input value={rib} onChange={(e) => setRib(e.target.value)} className="input-field font-mono" placeholder="MA64 0070 7000 0000 0000 0000 503" required />
              <p className="text-xs text-text-subdued mt-1">{l('24 caractères minimum, chiffré.', '24 حرفاً على الأقل، مشفر.')}</p>
            </div>
          </>
        )}

        {/* Step 3: Contract */}
        {step === 3 && (
          <>
            <h3 className="text-lg font-semibold text-cream">{l('Contrat vendeur', 'عقد البائع')}</h3>
            <div className="bg-navy-hover rounded-lg p-4 text-sm text-text-subdued space-y-1">
              <p className="font-medium text-cream mb-2">{l('Résumé des CGV vendeur', 'ملخص الشروط العامة')}</p>
              <p>• {l('Commission plateforme : 5% du prix de vente.', 'عمولة المنصة: 5% من سعر البيع.')}</p>
              <p>• {l('Séquestre des fonds jusqu\'à confirmation de réception.', 'حجز الأموال حتى تأكيد الاستلام.')}</p>
              <p>• {l('Virement au vendeur sous 24-72h après confirmation.', 'تحويل للبائع خلال 24-72 ساعة بعد التأكيد.')}</p>
              <p>• {l('Expédition sous 48h avec numéro de suivi.', 'الشحن خلال 48 ساعة مع رقم التتبع.')}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button type="button" onClick={downloadContract} className="btn-gold-outline flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                {l('Télécharger le contrat vendeur (PDF)', 'تحميل عقد البائع (PDF)')}
              </button>
              <FileInput label={l('Contrat signé (scan ou PDF)', 'العقد الموقع (مسح ضوئي أو PDF)')} value={contrat} onChange={(f) => setContrat(f)} isAr={isAr} l={l} />
              <p className="text-xs text-text-subdued flex items-center gap-1">
                <PenLine className="w-3 h-3 text-gold" />
                {l('Signez le contrat (manuscrit ou électronique) puis re-téléversez-le.', 'وقّع العقد (يدوياً أو إلكترونياً) ثم أعد رفعه.')}
              </p>
            </div>
          </>
        )}

        {/* Step 4: Recap */}
        {step === 4 && (
          <>
            <h3 className="text-lg font-semibold text-cream">{l('Récapitulatif', 'الملخص')}</h3>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between text-text-subdued"><span>{l('Identité', 'الهوية')}</span><span className="text-cream">{user.prenom} {user.nom}</span></p>
              <p className="flex justify-between text-text-subdued"><span>{l('Date de naissance', 'تاريخ الميلاد')}</span><span className="text-cream">{new Date(dateNaissance).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}</span></p>
              <p className="flex justify-between text-text-subdued"><span>{l('Adresse', 'العنوان')}</span><span className="text-cream">{adresse}</span></p>
              <p className="flex justify-between text-text-subdued"><span>{l('CIN', 'بطاقة التعريف')}</span><span className="text-cream">{cinRecto?.name} · {cinVerso?.name}</span></p>
              <p className="flex justify-between text-text-subdued"><span>{l('RIB', 'رقم الحساب')}</span><span className="text-cream font-mono">••••{rib.slice(-4)}</span></p>
              <p className="flex justify-between text-text-subdued"><span>{l('Contrat signé', 'العقد الموقع')}</span><span className="text-cream">{contrat?.name}</span></p>
            </div>
            <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 text-xs text-text-subdued">
              {l('En soumettant, vous acceptez que vos documents d\'identité soient vérifiés par l\'administration.', 'بإرسالك، تقر بأن وثائق هويتك سيتم التحقق منها من طرف الإدارة.')}
            </div>
          </>
        )}

        {/* Nav buttons */}
        <div className={cn('flex gap-3 pt-2', isAr && 'flex-row-reverse')}>
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)} className="btn-gold-outline flex-1 flex items-center justify-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              {l('Précédent', 'السابق')}
            </button>
          )}
          {step < 4 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
              {l('Suivant', 'التالي')}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="submit" disabled={saving} className="btn-gold flex-1 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {saving ? l('Envoi...', 'جارٍ الإرسال...') : l('Soumettre la demande', 'إرسال الطلب')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function FileInput({ label, value, onChange, isAr, l }: {
  label: string;
  value: File | null;
  onChange: (f: File | null) => void;
  isAr: boolean;
  l: (fr: string, ar: string) => string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-cream mb-1">{label}</label>
      <label className={cn(
        'flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors',
        value ? 'border-green/40 bg-green/5' : 'border-gold/20 hover:border-gold/40 bg-navy-hover'
      )}>
        <Upload className={cn('w-6 h-6 mb-2', value ? 'text-green' : 'text-gold')} />
        {value ? (
          <span className="text-xs text-green">{value.name}</span>
        ) : (
          <>
            <span className="text-xs text-text-subdued">{l('Cliquez pour téléverser', 'انقر للرفع')}</span>
            <span className="text-[10px] text-text-subdued mt-1">{l('JPG, PNG, PDF · max 5 Mo', 'JPG, PNG, PDF · حد 5 م.ب')}</span>
          </>
        )}
        <input type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
      </label>
    </div>
  );
}