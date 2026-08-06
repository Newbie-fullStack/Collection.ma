import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function CGUPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className={cn('text-3xl font-serif font-bold text-cream mb-8', isAr && 'text-right')}>
        {isAr ? 'الشروط والأحكام' : 'Conditions Générales d\'Utilisation'}
      </h1>

      <div className={cn('prose prose-brown max-w-none text-sm leading-relaxed space-y-6', isAr && 'text-right')}>
        <section>
          <h2 className="text-lg font-serif font-bold text-cream mb-2">
            {isAr ? 'المادة 1: التعريف' : 'Article 1 - Définitions'}
          </h2>
          <p className="text-text-subdued">
            {isAr
              ? 'Collection.ma هو منصة إلكترونية تابعة لـ [اسم الشركة]، مسجلة في المغرب، تُوفر سوقاً إلكترونية لبيع وشراء التذاكر النادرة والتحف.'
              : 'Collection.ma est une plateforme en ligne exploitée par [Nom de la Société], enregistrée au Maroc, offrant un marché en ligne pour l\'achat et la vente de pièces rares et de curiosités.'}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-serif font-bold text-cream mb-2">
            {isAr ? 'المادة 2: التسجيل' : 'Article 2 - Inscription'}
          </h2>
          <p className="text-text-subdued">
            {isAr
              ? 'يجب أن يكون عمر المستخدم 18 سنة على الأقل. يلتزم المستخدم بتقديم معلومات صحيحة وحديثة. حساب واحد فقط لكل مستخدم. يجب إدخال RIB صحيح (IBAN مغربي) لتمكين تحويلات الأموال.'
              : 'L\'utilisateur doit être âgé d\'au moins 18 ans. L\'utilisateur s\'engage à fournir des informations exactes et à jour. Un seul compte par utilisateur. Le RIB (IBAN marocain) doit être valide pour permettre les virements.'}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-serif font-bold text-cream mb-2">
            {isAr ? 'المادة 3: العمولة' : 'Article 3 - Commission'}
          </h2>
          <p className="text-text-subdued">
            {isAr
              ? 'تُخصم عمولة بنسبة 5% من كل عملية بيع ناجحة. هذه العمولة تُحسب على سعر البيع الإجمالي (شامل رسوم الشحن). يُدفع للمشتري كامل المبلغ عند الشراء، وتُخصم العمولة فقط عند تأكيد الاستلام والدفع للبائع.'
              : 'Une commission de 5% est prélevée sur chaque transaction réussie. Cette commission est calculée sur le prix de vente total (frais de port inclus). L\'acheteur paie le montant total à l\'achat, et la commission n\'est déduite qu\'au moment du paiement au vendeur.'}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-serif font-bold text-cream mb-2">
            {isAr ? 'المادة 4: نظام الحجز' : 'Article 4 - Système Escrow'}
          </h2>
          <p className="text-text-subdued">
            {isAr
              ? 'جميع المدفوعات تمر عبر نظام الحجز (séquestre) التابع للمنصة. لا يُرسل أي مبلغ مباشرة للبائع. يُحتفظ بالأموال لمدة 10 أيام عمل بعد الشحن. في حالة عدم تأكيد الاستلام أو حسم النزاع لصالح المشتري، يُرد المبلغ كاملاً.'
              : 'Tous les paiements passent par le système d\'escrow de la plateforme. Aucun montant n\'est envoyé directement au vendeur. Les fonds sont conservés pendant 10 jours ouvrables après l\'expédition. En cas de non-confirmation ou de litige résolu en faveur de l\'acheteur, le montant est intégralement remboursé.'}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-serif font-bold text-cream mb-2">
            {isAr ? 'المادة 5: المسؤولية' : 'Article 5 - Responsabilité'}
          </h2>
          <p className="text-text-subdued">
            {isAr
              ? 'البائع مسؤول عن دقة المعلومات والصور المنشورة. المنصة ليست مسؤولة عن جودة المنتجات المعروضة. في حالة النزاع، يلتزم الطرفان بتقديم الأدلة خلال المدة المحددة.'
              : 'Le vendeur est responsable de l\'exactitude des informations et photos publiées. La plateforme n\'est pas responsable de la qualité des objets vendus. En cas de litige, les deux parties s\'engagent à fournir les preuves dans le délai imparti.'}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-serif font-bold text-cream mb-2">
            {isAr ? 'المادة 6: حماية البيانات' : 'Article 6 - Protection des données'}
          </h2>
          <p className="text-text-subdued">
            {isAr
              ? 'نحترم خصوصيتك. بياناتك مشفرة ومخزنة بأمان. لا نشارك معلوماتك مع أطراف ثالثة إلا عند الضرورة القانونية. RIB الخاص بك مشفر دائماً ولا يُسجل بالنص الواضح أبداً.'
              : 'Nous respectons votre vie privée. Vos données sont cryptées et stockées de manière sécurisée. Nous ne partageons pas vos informations avec des tiers sauf nécessité légale. Votre RIB est toujours crypté et jamais enregistré en clair.'}
          </p>
        </section>

        <p className="text-xs text-text-subdued mt-8">
          {isAr ? 'آخر تحديث: أغسطس 2026' : 'Dernière mise à jour : Août 2026'}
        </p>
      </div>
    </div>
  );
}
