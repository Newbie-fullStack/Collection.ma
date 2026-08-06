import { useTranslation } from 'react-i18next';
import { Shield, CreditCard, Users, Zap, Truck, HeadphonesIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReassuranceBar() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const items = [
    { icon: Shield, label: isAr ? 'أصالة موثقة' : 'Authenticite verifiee', sub: isAr ? 'منتجات موثقة' : 'objets verifies' },
    { icon: CreditCard, label: isAr ? 'دفع آمن' : 'Paiement securise', sub: isAr ? 'أموال محمية' : 'fonds garantis' },
    { icon: Users, label: isAr ? 'بائعون محترفون' : 'Vendeurs professionnels', sub: isAr ? 'بائعون ومشترون' : 'et particuliers' },
    { icon: Zap, label: isAr ? 'licitات وشراء مباشر' : 'Encheres & Achats directs', sub: isAr ? 'اختر طريقة' : 'a vous de choisir' },
    { icon: Truck, label: isAr ? 'شحن دولي' : 'Livraison internationale', sub: isAr ? 'سريع وآمن' : 'rapide et securisee' },
    { icon: HeadphonesIcon, label: isAr ? 'خدمة عملاء' : 'Service client', sub: isAr ? 'في خدمتكم' : 'a votre ecoute' },
  ];

  return (
    <div className="bg-navy-card border-y border-gold/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className={cn('flex items-center gap-3', isAr && 'flex-row-reverse')}>
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-cream leading-tight">{item.label}</p>
                  <p className="text-[10px] text-text-subdued">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
