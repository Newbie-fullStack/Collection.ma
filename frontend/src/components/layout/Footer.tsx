import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, MessageCircle, Camera, Play } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';

export function Footer() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const columns = [
    {
      title: isAr ? 'حول' : 'A propos',
      links: [
        { label: isAr ? 'من نحن' : 'Qui sommes-nous', href: '/a-propos' },
        { label: isAr ? 'الشروط العامة' : 'Conditions generales', href: '/cgu' },
        { label: isAr ? 'المدونة' : 'Blog', href: '/blog' },
      ],
    },
    {
      title: isAr ? 'المساعدة والدعم' : 'Aide & Support',
      links: [
        { label: isAr ? 'مركز المساعدة' : "Centre d'aide", href: '/aide' },
        { label: isAr ? 'كيف يعمل' : 'Comment ca marche', href: '/comment-ca-marche' },
        { label: isAr ? 'البحث المتقدم' : 'Recherche avancee', href: '/recherche' },
      ],
    },
    {
      title: isAr ? 'البيع' : 'Vendre',
      links: [
        { label: isAr ? 'كيف تبيع' : 'Comment vendre', href: '/comment-ca-marche' },
        { label: isAr ? 'الرسوم والعمولات' : 'Frais et commissions', href: '/cgu' },
        { label: isAr ? 'نصائح البيع' : 'Conseils de vente', href: '/aide' },
      ],
    },
    {
      title: isAr ? 'حسابي' : 'Mon compte',
      links: [
        { label: isAr ? 'مشترياتي' : 'Mes achats', href: '/acheteur' },
        { label: isAr ? 'مفضلتي' : 'Mes favoris', href: '/acheteur/favoris' },
        { label: isAr ? 'مبيعاتي' : 'Mes ventes', href: '/vendeur' },
      ],
    },
  ];

  return (
    <footer className="bg-navy border-t border-gold/10">
      {/* Reassurance bar */}
      <div className="border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-center">
            {(isAr
              ? ['اصلالية موثوقة', 'دفع امن', 'بائعون موثوقون', 'licitات وشراء مباشر', 'توصيل دولي', 'خدمة عملاء']
              : ['Authenticite verifiee', 'Paiement securise', 'Vendeurs verifies', 'Encheres & Achat direct', 'Livraison internationale', 'Service client reactif']
            ).map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                  <span className="text-gold text-lg">&#10022;</span>
                </div>
                <span className="text-xs text-text-subdued">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Logo + description */}
          <div className={cn('md:col-span-1', isAr && 'md:order-last')}>
            <Logo variant="light" size="md" />
            <p className="mt-4 text-sm text-text-subdued leading-relaxed">
              {isAr
                ? 'السوق المغربية المخصصة لهواة الجمع. اشتر وبيع التذاكر النادرة والتحف.'
                : 'La marketplace marocaine dediee aux collectionneurs. Achetez et vendez des pieces rares et des tresors.'}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center hover:bg-gold/20 transition-colors">
                <Globe className="w-4 h-4 text-gold" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center hover:bg-gold/20 transition-colors">
                <MessageCircle className="w-4 h-4 text-gold" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center hover:bg-gold/20 transition-colors">
                <Camera className="w-4 h-4 text-gold" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center hover:bg-gold/20 transition-colors">
                <Play className="w-4 h-4 text-gold" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col, i) => (
            <div key={i}>
              <h3 className="font-semibold text-gold mb-4 text-sm">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link to={link.href} className="text-sm text-text-subdued hover:text-gold transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Payment + copyright */}
      <div className="border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className={cn('flex flex-col md:flex-row items-center justify-between gap-4', isAr && 'md:flex-row-reverse')}>
            <div className="flex items-center gap-4">
              <span className="text-xs text-text-subdued">{isAr ? 'وسائل الدفع:' : 'Paiement securise'}</span>
              <div className="flex items-center gap-2">
                {['VISA', 'Mastercard', 'CMI', 'PayPal'].map((method) => (
                  <span key={method} className="px-2 py-1 bg-gold/10 rounded text-xs text-gold">
                    {method}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-text-subdued">
              &copy; {new Date().getFullYear()} collection.ma — {isAr ? 'جميع الحقوق محفوظة' : 'Tous droits reserves'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
