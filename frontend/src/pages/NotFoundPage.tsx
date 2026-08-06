import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Search, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl font-serif font-bold text-gold">404</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-cream mb-2">
          {isAr ? 'الصفحة غير موجودة' : 'Page introuvable'}
        </h1>
        <p className="text-text-subdued mb-6">
          {isAr ? 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.' : 'La page que vous recherchez nexiste pas ou a ete deplacee.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-gold flex items-center gap-2">
            <Home className="w-4 h-4" />
            {isAr ? 'الرئيسية' : 'Accueil'}
          </Link>
          <Link to="/listings" className="btn-gold-outline flex items-center gap-2">
            <Search className="w-4 h-4" />
            {isAr ? 'تصفح الإعلانات' : 'Voir les annonces'}
          </Link>
        </div>
        <button onClick={() => window.history.back()} className="mt-4 text-sm text-gold hover:underline flex items-center gap-1 mx-auto">
          <ArrowLeft className="w-4 h-4" />
          {isAr ? 'العودة' : 'Retour'}
        </button>
      </div>
    </div>
  );
}
