import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function AdBanner() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="w-full bg-navy-hover py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', isAr && 'md:flex md:flex-row-reverse')}>
          <div className="w-full h-[125px] md:h-[250px] bg-navy-hover border-2 border-dashed border-gold/30 rounded-lg flex items-center justify-center">
            <span className="text-sm text-text-subdued">
              {isAr ? 'إعلانك هنا — 970x250' : 'Votre publicité ici — 970x250'}
            </span>
          </div>
          <div className="w-full h-[125px] md:h-[250px] bg-navy-hover border-2 border-dashed border-gold/30 rounded-lg flex items-center justify-center">
            <span className="text-sm text-text-subdued">
              {isAr ? 'إعلانك هنا — 970x250' : 'Votre publicité ici — 970x250'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
