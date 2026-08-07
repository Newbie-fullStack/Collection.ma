import { useTranslation } from 'react-i18next';
import { Link, useParams, Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';
import { articles } from '@/lib/blogArticles';

export function BlogDetailPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { slug } = useParams();

  const article = articles.find(a => a.slug === slug);
  if (!article) return <Navigate to="/blog" replace />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        to="/blog"
        className={cn('inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light mb-6', isAr && 'flex-row-reverse')}
      >
        <ArrowLeft className={cn('w-4 h-4', isAr && 'rotate-180')} />
        {isAr ? 'العودة إلى المدونة' : 'Retour au blog'}
      </Link>

      <div className={cn('flex items-center gap-3 mb-4', isAr && 'flex-row-reverse')}>
        <span className="badge badge-gold text-[10px]">
          <Tag className="w-3 h-3 inline mr-1" />
          {isAr ? article.category_ar : article.category}
        </span>
        <span className="text-xs text-text-subdued flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(article.date).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}
        </span>
        <span className="text-xs text-text-subdued flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {article.readTime} {isAr ? 'دقائق' : 'min'}
        </span>
      </div>

      <h1 className={cn('text-3xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
        {isAr ? article.title_ar : article.title}
      </h1>

      <div className={cn('prose prose-invert max-w-none text-cream/90 leading-relaxed', isAr && 'text-right')}>
        {isAr ? article.content_ar : article.content}
      </div>
    </div>
  );
}