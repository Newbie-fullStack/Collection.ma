import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { ShoppingBag, Store } from 'lucide-react';

export function HowItWorksPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const buyerSteps = isAr ? [
    { num: '01', title: 'التسجيل', desc: 'أنشئ حسابك مجاناً ببياناتك الأساسية ورقم الحساب البنكي' },
    { num: '02', title: 'البحث', desc: 'تصفح آلاف التذاكر النادرة حسب الفئة أو الكلمة المفتاحية' },
    { num: '03', title: 'العرض أو الشراء', desc: 'قدم عرضك في الlicitة أو اشترِ مباشرة بالسعر المحدد' },
    { num: '04', title: 'الدفع الآمن', desc: 'ادفع عبر نظام الحجز — أموالك محمية حتى تستلم المنتج' },
    { num: '05', title: 'التوصيل', desc: 'استلم طلبك وتتبع الشحن عبر رقم التتبع' },
    { num: '06', title: 'التأكيد', desc: 'أكد استلام المنتج لتحرير الأموال للبائع' },
  ] : [
    { num: '01', title: 'Inscription', desc: 'Créez votre compte gratuit avec vos informations et RIB' },
    { num: '02', title: 'Recherche', desc: 'Parcourez des milliers de pièces rares par catégorie ou mot-clé' },
    { num: '03', title: 'Enchérir ou Acheter', desc: 'Placez votre offre en enchère ou achetez directement au prix affiché' },
    { num: '04', title: 'Paiement sécurisé', desc: 'Payez via notre système d\'escrow — vos fonds sont protégés' },
    { num: '05', title: 'Livraison', desc: 'Recevez votre colis et suivez l\'expédition via le numéro de tracking' },
    { num: '06', title: 'Confirmation', desc: 'Confirmez la réception pour libérer les fonds au vendeur' },
  ];

  const sellerSteps = isAr ? [
    { num: '01', title: 'التسجيل كبائع', desc: 'أنشئ حساباً واملأ بياناتك بما في ذلك RIB البنكي' },
    { num: '02', title: 'إضافة المنتج', desc: 'ارفع صوراً واضحة وأضف وصفاً تفصيلياً وسعراً مناسباً' },
    { num: '03', title: 'النشر', desc: 'إعلانك يظهر مباشرة لآلاف المشترين المحتملين' },
    { num: '04', title: 'استقبال العروض', desc: 'تلق عروض المشترين أو اشترِ مباشرة' },
    { num: '05', title: 'الشحن', desc: 'أرسل المنتج وأدخل رقم التتبع' },
    { num: '06', title: 'الحصول على الدفع', desc: 'استلم أموالك بعد تأكيد الاستلام (ن deducted 5% عمولة)' },
  ] : [
    { num: '01', title: 'Inscription vendeur', desc: 'Créez un compte et complétez vos informations dont le RIB' },
    { num: '02', title: 'Ajouter un objet', desc: 'Téléchargez des photos claires, ajoutez une description et un prix' },
    { num: '03', title: 'Publication', desc: 'Votre annonce est visible immédiatement par des milliers d\'acheteurs' },
    { num: '04', title: 'Réception des offres', desc: 'Recevez les offres des acheteurs ou vendez directement' },
    { num: '05', title: 'Expédition', desc: 'Envoyez l\'objet et renseignez le numéro de suivi' },
    { num: '06', title: 'Encaissement', desc: 'Recevez vos fonds après confirmation (5% de commission déduite)' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className={cn('text-3xl font-serif font-bold text-cream mb-12 text-center', isAr && 'text-right')}>
        {isAr ? 'كيف يعمل' : 'Comment ça marche'}
      </h1>

      {/* Buyer steps */}
      <section className="mb-16">
        <h2 className={cn('text-2xl font-serif font-bold text-cream mb-8 flex items-center gap-3', isAr && 'flex-row-reverse')}>
          <ShoppingBag className="w-6 h-6 text-gold" strokeWidth={1.5} /> {isAr ? 'للمشتري' : 'Pour l\'acheteur'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {buyerSteps.map((step) => (
            <div key={step.num} className={cn('card p-6 relative', isAr && 'text-right')}>
              <span className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gold text-white flex items-center justify-center font-bold text-sm">
                {step.num}
              </span>
              <h3 className="font-semibold text-cream mt-2 mb-2">{step.title}</h3>
              <p className="text-sm text-text-subdued">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seller steps */}
      <section>
        <h2 className={cn('text-2xl font-serif font-bold text-cream mb-8 flex items-center gap-3', isAr && 'flex-row-reverse')}>
          <Store className="w-6 h-6 text-gold" strokeWidth={1.5} /> {isAr ? 'للبائع' : 'Pour le vendeur'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sellerSteps.map((step) => (
            <div key={step.num} className={cn('card p-6 relative', isAr && 'text-right')}>
              <span className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-green text-white flex items-center justify-center font-bold text-sm">
                {step.num}
              </span>
              <h3 className="font-semibold text-cream mt-2 mb-2">{step.title}</h3>
              <p className="text-sm text-text-subdued">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Escrow explanation */}
      <section className="mt-16 bg-green/10 rounded-xl p-8">
        <h2 className={cn('text-2xl font-serif font-bold text-cream mb-4', isAr && 'text-right')}>
          {isAr ? 'نظام الحجز (Escrow)' : 'Le système Escrow'}
        </h2>
        <p className="text-text-subdued leading-relaxed mb-4">
          {isAr
            ? 'عند الشراء، أموالك لا تذهب مباشرة للبائع. بل تُحتفظ بها في حساب آمن تابع للمنصة. فقط عندما تؤكد استلام المنتج، تُحرَّر الأموال للبائع مطروحة منها عمولة 5%.'
            : 'Lorsque vous achetez, vos fonds ne vont pas directement au vendeur. Ils sont conservés dans un compte sécurisé de la plateforme. Ce n\'est que lorsque vous confirmez la réception que les fonds sont libérés au vendeur, diminués de 5% de commission.'}
        </p>
        <p className="text-text-subdued leading-relaxed">
          {isAr
            ? 'في حالة عدم تأكيد الاستلام خلال 10 أيام عمل، يتم رد الأموال تلقائياً للمشتري.'
            : 'En cas de non-confirmation dans les 10 jours ouvrables, les fonds sont automatiquement remboursés à l\'acheteur.'}
        </p>
      </section>
    </div>
  );
}
