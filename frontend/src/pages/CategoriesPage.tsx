import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  CircleDollarSign, Stamp, Banknote, Watch, Image, Mail,
  Gem, Landmark, FlaskConical, Settings, FileText, BookOpen,
  Car, Trophy, Shirt, Shield, Layers, Package, Microscope, Grid3x3
} from 'lucide-react';

const categories = [
  { id: 1, Icon: CircleDollarSign, fr: 'Monnaies', ar: 'عملات', count: 1240 },
  { id: 2, Icon: Stamp, fr: 'Timbres', ar: 'طوابع', count: 890 },
  { id: 3, Icon: Banknote, fr: 'Billets', ar: 'نقود ورقية', count: 560 },
  { id: 4, Icon: Watch, fr: 'Montres', ar: 'ساعات', count: 780 },
  { id: 5, Icon: Image, fr: 'Cartes postales', ar: 'بطاقات بريدية', count: 430 },
  { id: 6, Icon: Mail, fr: 'Enveloppes', ar: 'ظرف', count: 210 },
  { id: 7, Icon: Gem, fr: 'Bijoux', ar: 'مجوهرات', count: 650 },
  { id: 8, Icon: Landmark, fr: 'Statues', ar: 'تماثيل', count: 340 },
  { id: 9, Icon: FlaskConical, fr: 'Céramiques', ar: 'سيراميك', count: 290 },
  { id: 10, Icon: Settings, fr: 'Machinerie', ar: 'آلات', count: 180 },
  { id: 11, Icon: FileText, fr: 'Manuscrits', ar: 'مخطوطات', count: 420 },
  { id: 12, Icon: BookOpen, fr: 'Livres anciens', ar: 'كتب قديمة', count: 560 },
  { id: 13, Icon: Car, fr: 'Voitures miniatures', ar: 'سيارات مصغرة', count: 870 },
  { id: 14, Icon: Trophy, fr: 'Bronzes', ar: 'برونز', count: 190 },
  { id: 15, Icon: Shirt, fr: 'Habillements anciens', ar: 'ملابس قديمة', count: 320 },
  { id: 16, Icon: Shield, fr: 'Militaria', ar: 'عسكريات', count: 410 },
  { id: 17, Icon: Layers, fr: 'Cartes Pokémon', ar: 'كروت بوكيمون', count: 1560 },
  { id: 18, Icon: Package, fr: 'Collections complètes', ar: 'مجموعات كاملة', count: 230 },
  { id: 19, Icon: Microscope, fr: 'Science & Technique', ar: 'علوم وتكنولوجيا', count: 150 },
  { id: 20, Icon: Grid3x3, fr: 'Divers', ar: 'متنوع', count: 340 },
];

export function CategoriesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className={cn('text-3xl font-serif font-bold text-cream mb-8 text-center', isAr && 'text-right')}>
        {isAr ? 'الفئات' : 'Nos 20 catégories'}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {categories.map((cat) => {
          const Icon = cat.Icon;
          return (
            <a
              key={cat.id}
              href={`/listings?category=${cat.id}`}
              className={cn(
                'card-hover p-6 text-center group',
                isAr && 'text-right'
              )}
            >
              <div className="w-20 h-20 rounded-full bg-navy-hover border-2 border-gold/20 group-hover:border-gold group-hover:shadow-md flex items-center justify-center mx-auto mb-3 transition-all duration-200 group-hover:scale-110">
                <Icon className="w-8 h-8 text-gold" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] text-text-subdued font-mono">{String(cat.id).padStart(2, '0')}</span>
              <h3 className="font-semibold text-sm text-cream mt-1">
                {isAr ? cat.ar : cat.fr}
              </h3>
              <p className="text-xs text-text-subdued mt-1">
                {cat.count.toLocaleString()} {isAr ? 'إعلان' : 'annonces'}
              </p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
