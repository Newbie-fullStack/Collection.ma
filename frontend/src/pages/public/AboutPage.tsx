import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Shield, CheckCircle, Globe, MessageCircle } from 'lucide-react';

export function AboutPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className={cn('text-3xl font-serif font-bold text-cream mb-8', isAr && 'text-right')}>
        {isAr ? 'من نحن' : 'À propos de Collection.ma'}
      </h1>

      <div className={cn('prose prose-brown max-w-none', isAr && 'text-right')}>
        <section className="mb-10">
          <h2 className="text-xl font-serif font-bold text-cream mb-4">
            {isAr ? 'رؤيتنا' : 'Notre mission'}
          </h2>
          <p className="text-text-subdued leading-relaxed mb-4">
            {isAr
              ? 'Collection.ma هي السوق المغربية الأولى المخصصة لهواة الجمع والمرصد. نوفر منصة آمنة وموثوقة لبيع وشراء التذاكر النادرة والتحف والأشياء الاستثنائية.'
              : 'Collection.ma est la première marketplace marocaine dédiée aux collectionneurs et connaisseurs. Nous offrons une plateforme sécurisée et fiable pour l\'achat et la vente de pièces rares, de curiosités et d\'objets d\'exception.'}
          </p>
          <p className="text-text-subdued leading-relaxed">
            {isAr
              ? 'مستوحاة من أفضل المنصات العالمية مثل Delcampe.net، نجمع بين خبرة التجارة الإلكترونية والتراث المغربي الغني.'
              : 'Inspirée des meilleures plateformes internationales comme Delcampe.net, nous combinons l\'expertise du e-commerce et le riche patrimoine marocain.'}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-serif font-bold text-cream mb-4">
            {isAr ? 'لماذا Collection.ma?' : 'Pourquoi Collection.ma?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Shield, title: isAr ? 'أمان مضمون' : 'Sécurité garantie', desc: isAr ? 'نظام حجز ( séquestre) يحمي المشتري والبائع' : 'Système d\'escrow protégeant acheteur et vendeur' },
              { icon: CheckCircle, title: isAr ? 'أصالة موثقة' : 'Authenticité vérifiée', desc: isAr ? 'فريق خبراء يتحقق من أصالة كل منتج' : 'Équipe d\'experts vérifiant l\'authenticité de chaque pièce' },
              { icon: Globe, title: isAr ? 'توصيل دولي' : 'Livraison internationale', desc: isAr ? 'شحن آمن إلى أكثر من 50 دولة' : 'Expédition sécurisée vers plus de 50 pays' },
              { icon: MessageCircle, title: isAr ? 'دعم مغربي' : 'Support marocain', desc: isAr ? 'فريق دعم يتحدث العربية والفرنسية' : 'Équipe de support parlant arabe et français' },
            ].map((item, i) => (
              <div key={i} className={cn('flex gap-4 p-4 bg-navy-hover rounded-lg', isAr && 'flex-row-reverse')}>
                <item.icon className="w-8 h-8 text-gold shrink-0" strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold text-cream">{item.title}</h3>
                  <p className="text-sm text-text-subdued mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-serif font-bold text-cream mb-4">
            {isAr ? 'أرقامنا' : 'Quelques chiffres'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { value: '12 000+', label: isAr ? 'عضو' : 'Membres' },
              { value: '45 000+', label: isAr ? 'إعلان' : 'Annonces' },
              { value: '1 200+', label: isAr ? 'licitة' : 'Enchères actives' },
              { value: '5%', label: isAr ? 'عمولة' : 'Commission unique' },
            ].map((stat, i) => (
              <div key={i} className="p-4 bg-navy-hover rounded-lg">
                <p className="text-2xl font-bold text-gold">{stat.value}</p>
                <p className="text-sm text-text-subdued mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
