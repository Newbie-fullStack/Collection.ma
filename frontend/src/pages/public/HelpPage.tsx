import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  q: string;
  a: string;
}

function FAQSection({ title, items, isAr }: { title: string; items: FAQItem[]; isAr: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mb-10">
      <h2 className={cn('text-xl font-serif font-bold text-cream mb-4', isAr && 'text-right')}>
        {title}
      </h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="card overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className={cn(
                'w-full flex items-center justify-between p-4 text-left hover:bg-navy-hover transition-colors',
                isAr && 'text-right flex-row-reverse'
              )}
            >
              <span className="font-medium text-cream text-sm">{item.q}</span>
              {openIndex === i ? <ChevronUp className="w-4 h-4 text-gold shrink-0" /> : <ChevronDown className="w-4 h-4 text-gold shrink-0" />}
            </button>
            {openIndex === i && (
              <div className={cn('px-4 pb-4 text-sm text-text-subdued', isAr && 'text-right')}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function HelpPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const generalFAQ = isAr ? [
    { q: 'ما هو Collection.ma؟', a: 'Collection.ma هو سوق إلكترونية مغربية متخصصة في بيع وشراء التذاكر النادرة والتحف والأشياء الاستثنائية.' },
    { q: 'كيف أسجل حساباً؟', a: 'انقر على "التسجيل" وأدخل بياناتك包括 الاسم والبريد الإلكتروني ورقم الحساب البنكي (IBAN مغربي). يجب أن يكون عمرك 18 سنة على الأقل.' },
    { q: 'هل التسجيل مجاني؟', a: 'نعم، التسجيل مجاني تماماً. لا ن收取 أي رسوم الاشتراك.' },
    { q: 'ما هي لغات المنصة؟', a: 'المنصة ثنائية اللغة: الفرنسية والعربية مع دعم كامل للاتجاه RTL.' },
  ] : [
    { q: 'Qu\'est-ce que Collection.ma?', a: 'Collection.ma est une marketplace marocaine spécialisée dans l\'achat et la vente de pièces rares, de curiosités et d\'objets d\'exception.' },
    { q: 'Comment créer un compte?', a: 'Cliquez sur "Inscription" et complétez vos informations dont le nom, email et RIB (IBAN marocain). Vous devez avoir au moins 18 ans.' },
    { q: 'L\'inscription est-elle gratuite?', a: 'Oui, l\'inscription est entièrement gratuite. Nous ne facturons aucun frais d\'abonnement.' },
    { q: 'Quelles langues sont supportées?', a: 'La plateforme est bilingue : français et arabe avec support complet du RTL.' },
  ];

  const buyerFAQ = isAr ? [
    { q: 'كيف أشتري من Collection.ma؟', a: 'تصفح الإعلانات، اختر المنتج، وقدم عرضك أو اشترِ مباشرة. ادفع عبر نظام الحجز الآمن.' },
    { q: 'هل أموالي آمنة؟', a: 'نعم! أموالك محتفظ بها في حساب séquestre حتى تؤكد استلام المنتج.' },
    { q: 'ماذا لو لم أستلم المنتج؟', a: 'يمكنك فتح نزاع وإرفاق الأدلة. سيعمل فريقنا على حل المشكلة. في حالة عدم التأكيد خلال 10 أيام، يتم رد أموالك تلقائياً.' },
  ] : [
    { q: 'Comment acheter sur Collection.ma?', a: 'Parcourez les annonces, choisissez l\'objet, placez votre offre ou achetez directement. Payez via notre système d\'escrow sécurisé.' },
    { q: 'Mes fonds sont-ils en sécurité?', a: 'Oui! Vos fonds sont conservés dans un compte séquestre jusqu\'à ce que vous confirmiez la réception.' },
    { q: 'Et si je ne reçois pas l\'objet?', a: 'Vous pouvez ouvrir un litige et joindre vos preuves. Sans confirmation dans les 10 jours, vos fonds sont automatiquement remboursés.' },
  ];

  const sellerFAQ = isAr ? [
    { q: 'كيف أبيع على Collection.ma؟', a: 'سجل حساباً كبائع، أضف إعلاناً مع صور ووصف وسعر، وانشره مباشرة.' },
    { q: 'كم العمولة؟', a: 'العمولة 5% فقط من سعر البيع. لا توجد رسوم إضافية.' },
    { q: 'متى أستلم أموالي؟', a: 'بعد تأكيد المشتري الاستلام، تُحرَّر الأموال لمحفظتك. يمكنك طلب سحب في أي وقت.' },
  ] : [
    { q: 'Comment vendre sur Collection.ma?', a: 'Créez un compte vendeur, ajoutez une annonce avec photos, description et prix, puis publiez-la.' },
    { q: 'Quelle est la commission?', a: 'La commission est de 5% seulement sur le prix de vente. Aucun frais supplémentaire.' },
    { q: 'Quand reçois-je mes fonds?', a: 'Après confirmation de réception par l\'acheteur, les fonds sont libérés vers votre portefeuille. Vous pouvez demander un retrait à tout moment.' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className={cn('text-3xl font-serif font-bold text-cream mb-8 text-center', isAr && 'text-right')}>
        {isAr ? 'مركز المساعدة' : 'Centre d\'aide'}
      </h1>

      <FAQSection title={isAr ? 'عامة' : 'Général'} items={generalFAQ} isAr={isAr} />
      <FAQSection title={isAr ? 'للمشتري' : 'Pour les acheteurs'} items={buyerFAQ} isAr={isAr} />
      <FAQSection title={isAr ? 'للبائع' : 'Pour les vendeurs'} items={sellerFAQ} isAr={isAr} />

      <section className="mt-12 card p-6 text-center">
        <h2 className="font-semibold text-cream mb-2">{isAr ? 'لم تجد إجابة؟' : 'Vous n\'avez pas trouvé votre réponse?'}</h2>
        <p className="text-sm text-text-subdued mb-4">{isAr ? 'تواصل مع فريق الدعم' : 'Contactez notre équipe de support'}</p>
        <a href="mailto:support@collection.ma" className="btn-gold inline-block">
          {isAr ? 'راسلنا' : 'Nous contacter'}
        </a>
      </section>
    </div>
  );
}
