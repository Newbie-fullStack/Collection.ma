import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  CircleDollarSign, Stamp, Banknote, Watch, Image, Mail,
  Gem, Landmark, FlaskConical, Settings, FileText, BookOpen,
  Car, Trophy, Shirt, Shield, Layers, Package, Microscope, Grid3x3
} from 'lucide-react';

const categories = [
  { id: 1, Icon: CircleDollarSign, fr: 'Monnaies', ar: 'عملات' },
  { id: 2, Icon: Stamp, fr: 'Timbres', ar: 'طوابع' },
  { id: 3, Icon: Banknote, fr: 'Billets', ar: 'نقود ورقية' },
  { id: 4, Icon: Watch, fr: 'Montres', ar: 'ساعات' },
  { id: 5, Icon: Image, fr: 'Cartes postales', ar: 'بطاقات بريدية' },
  { id: 6, Icon: Mail, fr: 'Enveloppes', ar: 'ظرف' },
  { id: 7, Icon: Gem, fr: 'Bijoux', ar: 'مجوهرات' },
  { id: 8, Icon: Landmark, fr: 'Statues', ar: 'تماثيل' },
  { id: 9, Icon: FlaskConical, fr: 'Ceramiques', ar: 'سيراميك' },
  { id: 10, Icon: Settings, fr: 'Machinerie', ar: 'آلات' },
  { id: 11, Icon: FileText, fr: 'Manuscrits', ar: 'مخطوطات' },
  { id: 12, Icon: BookOpen, fr: 'Livres anciens', ar: 'كتب قديمة' },
  { id: 13, Icon: Car, fr: 'Voitures miniatures', ar: 'سيارات مصغرة' },
  { id: 14, Icon: Trophy, fr: 'Bronzes', ar: 'برونز' },
  { id: 15, Icon: Shirt, fr: 'Habillements anciens', ar: 'ملابس قديمة' },
  { id: 16, Icon: Shield, fr: 'Militaria', ar: 'عسكريات' },
  { id: 17, Icon: Layers, fr: 'Cartes Pokemon', ar: 'كروت بوكيمون' },
  { id: 18, Icon: Package, fr: 'Collections completes', ar: 'مجموعات كاملة' },
  { id: 19, Icon: Microscope, fr: 'Science & Technique', ar: 'علوم وتكنولوجيا' },
  { id: 20, Icon: Grid3x3, fr: 'Divers', ar: 'متنوع' },
];

export function CategoryGrid() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <section className="py-4">
      <div className={cn('flex items-center justify-between mb-6', isAr && 'flex-row-reverse')}>
        <h2 className="text-xl font-serif font-bold text-cream">
          {isAr ? 'فئاتنا الـ 20' : 'Nos 20 categories'}
        </h2>
        <Link to="/categories" className="text-sm text-gold hover:text-gold-light transition-colors">
          {isAr ? 'عرض الكل' : 'Voir toutes les categories'} &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-3">
        {categories.map((cat) => {
          const Icon = cat.Icon;
          return (
            <Link
              key={cat.id}
              to={`/listings?category=${cat.id}`}
              className={cn(
                'group flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl bg-navy-card border border-gold/10 hover:border-gold/30 hover:bg-navy-hover transition-all duration-200',
                isAr && 'text-right'
              )}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold/10 group-hover:bg-gold/20 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gold" strokeWidth={1.5} />
              </div>
              <p className="text-[9px] sm:text-[10px] font-medium text-text-subdued group-hover:text-cream leading-tight text-center w-full">
                {isAr ? cat.ar : cat.fr}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
