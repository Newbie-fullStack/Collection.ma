import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import { articles } from '@/lib/blogArticles';

export function BlogPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className={cn('mb-10', isAr && 'text-right')}>
        <h1 className="text-3xl font-serif font-bold text-cream">
          {isAr ? 'المدونة' : 'Blog'}
        </h1>
        <p className="text-text-subdued mt-2">
          {isAr ? 'نصائح وأخبار لعالم جمع التشكيل' : 'Conseils et actualités pour les collectionneurs'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/blog/${article.slug}`}
            className="card-hover p-5 group"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="badge badge-gold text-[10px]">
                <Tag className="w-3 h-3 inline mr-1" />
                {isAr ? article.category_ar : article.category}
              </span>
              <span className="text-xs text-text-subdued flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(article.date).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}
              </span>
            </div>

            <h2 className="font-semibold text-cream group-hover:text-gold transition-colors mb-2">
              {isAr ? article.title_ar : article.title}
            </h2>

            <p className="text-sm text-text-subdued mb-4 line-clamp-2">
              {isAr ? article.excerpt_ar : article.excerpt}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-text-subdued flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTime} {isAr ? 'دقائق' : 'min'}
              </span>
              <span className="text-xs text-gold flex items-center gap-1 group-hover:gap-2 transition-all">
                {isAr ? 'اقرأ' : 'Lire'} <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
