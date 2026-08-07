import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { categoriesApi } from '@/api';
import type { Category } from '@/types';
import { categoryIcon } from '@/lib/categoryIcons';

export function CategoriesPage() {
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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className={cn('text-3xl font-serif font-bold text-cream mb-8 text-center', isAr && 'text-right')}>
        {isAr ? 'الفئات' : 'Nos catégories'}
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`sk-${i}`} className="card-hover p-6 text-center animate-pulse">
              <div className="w-20 h-20 rounded-full bg-navy-hover mx-auto mb-3" />
              <div className="h-3 bg-navy-hover rounded w-1/2 mx-auto mb-1" />
              <div className="h-2 bg-navy-hover rounded w-1/3 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((cat) => {
            const Icon = categoryIcon(cat.icon);
            return (
              <Link
                key={cat.id}
                to={`/listings?category=${cat.id}`}
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
                  {isAr ? cat.nom_ar : cat.nom_fr}
                </h3>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}