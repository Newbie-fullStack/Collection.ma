import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { categoriesApi } from '@/api';
import type { Category } from '@/types';
import { categoryIcon } from '@/lib/categoryIcons';

export function CategoryGrid() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.list()
      .then(({ data }) => {
        const active = (Array.isArray(data) ? data : []).filter((c) => c.active !== false);
        active.sort((a, b) => a.ordre_affichage - b.ordre_affichage);
        setCategories(active);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-4">
      <div className={cn('flex items-center justify-between mb-6', isAr && 'flex-row-reverse')}>
        <h2 className="text-xl font-serif font-bold text-cream">
          {isAr ? 'فئاتنا' : 'Nos categories'}
        </h2>
        <Link to="/categories" className="text-sm text-gold hover:text-gold-light transition-colors">
          {isAr ? 'عرض الكل' : 'Voir toutes les categories'} &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-3">
        {loading
          ? Array.from({ length: 20 }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl bg-navy-card border border-gold/10 animate-pulse"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-navy-hover" />
                <div className="h-2 bg-navy-hover rounded w-3/4" />
              </div>
            ))
          : categories.map((cat) => {
              const Icon = categoryIcon(cat.icon);
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
                    {isAr ? cat.nom_ar : cat.nom_fr}
                  </p>
                </Link>
              );
            })}
      </div>
    </section>
  );
}