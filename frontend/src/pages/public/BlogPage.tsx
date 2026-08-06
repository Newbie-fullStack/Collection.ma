import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';

const articles = [
  {
    id: 1,
    slug: 'guide-acheteur-debutant',
    title: 'Guide de l\'acheteur débutant',
    title_ar: 'دليل المشتري المبتدئ',
    excerpt: 'Tout ce que vous devez savoir pour commencer à collectionner sur Collection.ma',
    excerpt_ar: 'كل ما تحتاج معرفته للبدء في الجمع على Collection.ma',
    category: 'Guide',
    category_ar: 'دليل',
    date: '2026-07-15',
    readTime: 5,
  },
  {
    id: 2,
    slug: 'comment-vendre-efficientement',
    title: 'Comment vendre efficacement',
    title_ar: 'كيفية البيع بكفاءة',
    excerpt: 'Nos conseils pour optimiser vos annonces et vendre plus vite',
    excerpt_ar: 'نصائحنا لتحسين إعلاناتك والبيع بشكل أسرع',
    category: 'Vendeur',
    category_ar: 'بائع',
    date: '2026-07-10',
    readTime: 7,
  },
  {
    id: 3,
    slug: 'systeme-escrow-explication',
    title: 'Le système escrow expliqué',
    title_ar: 'شرح نظام الحجز',
    excerpt: 'Comment fonctionne la protection des paiements et pourquoi c\'est sûr',
    excerpt_ar: 'كيف تعمل حماية المدفوعات ولماذا هي آمنة',
    category: 'Paiement',
    category_ar: 'دفع',
    date: '2026-07-05',
    readTime: 4,
  },
  {
    id: 4,
    slug: 'top-10-categories-collection',
    title: 'Top 10 des catégories de collection',
    title_ar: 'أفضل 10 فئات للجمع',
    excerpt: 'Découvrez les catégories les plus populaires et leurs pièces les plus recherchées',
    excerpt_ar: 'اكتشف الفئات الأكثر شعبية وأكثر قطع طلباً',
    category: 'Collection',
    category_ar: 'جمع',
    date: '2026-06-28',
    readTime: 6,
  },
  {
    id: 5,
    slug: 'authentifier-timbres-marocains',
    title: 'Comment authentifier les timbres marocains',
    title_ar: 'كيفية التحقق من أصالة الطوابع المغربية',
    excerpt: 'Les clés pour reconnaître les timbres authentiques et éviter les contrefaçons',
    excerpt_ar: 'المفاتيح للتعرف على الطوابع الأصلية وتجنب التزوير',
    category: 'Authenticité',
    category_ar: 'أصالة',
    date: '2026-06-20',
    readTime: 8,
  },
  {
    id: 6,
    slug: 'preparer-colis-expedition',
    title: 'Préparer un colis pour l\'expédition',
    title_ar: 'تحضير طرد للشحن',
    excerpt: 'Guide pratique pour emballer vos objets de collection en toute sécurité',
    excerpt_ar: 'دليل عملي لتعبئة أغراضك بأمان',
    category: 'Livraison',
    category_ar: 'توصيل',
    date: '2026-06-15',
    readTime: 5,
  },
];

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
