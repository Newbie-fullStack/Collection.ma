import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { cn, formatMAD } from '@/lib/utils';
import { listingsApi, ordersApi } from '@/api';
import type { Listing, SellerStats } from '@/types';
import { FileText, PlusCircle, Edit, Trash2, Eye, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

export function SellerDraftsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [drafts, setDrafts] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsApi.myListings({ statut: 'brouillon', per_page: 20 })
      .then(({ data }) => setDrafts(data.data))
      .catch(() => setDrafts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      isAr ? 'هل أنت متأكد من حذف هذه المسودة؟' : 'Etes-vous sur de vouloir supprimer ce brouillon ?'
    );
    if (!confirmed) return;

    try {
      await listingsApi.delete(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className={cn('flex items-center justify-between mb-6', isAr && 'flex-row-reverse')}>
        <h2 className="text-xl font-serif font-bold text-cream">
          {isAr ? 'المسودات' : 'Brouillons'}
        </h2>
        <Link to="/vendeur/ajouter" className="btn-gold flex items-center gap-2 text-sm">
          <PlusCircle className="w-4 h-4" />
          {isAr ? 'إضافة' : 'Ajouter'}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex gap-4">
              <div className="w-16 h-16 bg-navy-hover rounded shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-navy-hover rounded w-1/3" />
                <div className="h-3 bg-navy-hover rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : drafts.length === 0 ? (
        <div className="card p-8 text-center">
          <FileText className="w-12 h-12 text-text-subdued mx-auto mb-3" />
          <p className="text-text-subdued mb-4">
            {isAr ? 'لا توجد مسودات' : 'Aucun brouillon'}
          </p>
          <Link to="/vendeur/ajouter" className="btn-gold inline-flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            {isAr ? 'أضف أول إعلان' : 'Creer une annonce'}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((listing) => (
            <div key={listing.id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded bg-navy-hover overflow-hidden shrink-0">
                {listing.photos?.[0] ? (
                  <img src={`/storage/${listing.photos[0].path}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-subdued">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="badge bg-navy-hover text-text-subdued text-[10px]">
                  {isAr ? 'مسودة' : 'Brouillon'}
                </span>
                <h3 className="font-medium text-sm text-cream truncate mt-1">
                  {listing.titre || (isAr ? 'بدون عنوان' : 'Sans titre')}
                </h3>
                <span className="text-xs text-text-subdued">
                  {formatMAD(listing.prix_vente, i18n.language)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/vendeur/ajouter?edit=${listing.id}`} className="p-2 hover:bg-navy-hover rounded" title={isAr ? 'تعديل' : 'Modifier'}>
                  <Edit className="w-4 h-4 text-text-subdued" />
                </Link>
                <button
                  onClick={() => handleDelete(listing.id)}
                  className="p-2 hover:bg-red/10 rounded"
                  title={isAr ? 'حذف' : 'Supprimer'}
                >
                  <Trash2 className="w-4 h-4 text-red/60" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SellerStatsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.sellerStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className={cn('text-xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
          {isAr ? 'الإحصائيات' : 'Statistiques'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-3 bg-navy-hover rounded w-1/2 mb-2" />
              <div className="h-6 bg-navy-hover rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statItems = [
    { label: isAr ? 'إجمالي المبيعات' : 'Total ventes', value: stats?.total_ventes || 0, icon: TrendingUp, color: 'text-gold' },
    { label: isAr ? 'الإيرادات' : 'Chiffre d\'affaires', value: formatMAD(stats?.chiffre_affaires || 0, i18n.language), icon: DollarSign, color: 'text-green' },
    { label: isAr ? 'الإعلانات النشطة' : 'Annonces actives', value: stats?.annonces_actives || 0, icon: FileText, color: 'text-blue' },
    { label: isAr ? 'إجمالي المشاهدات' : 'Total vues', value: stats?.vues_totales || 0, icon: Eye, color: 'text-cream' },
  ];

  return (
    <div>
      <h2 className={cn('text-xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
        {isAr ? 'الإحصائيات' : 'Statistiques'}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statItems.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn('w-4 h-4', stat.color)} />
                <span className="text-xs text-text-subdued">{stat.label}</span>
              </div>
              <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {stats?.top_annonces && stats.top_annonces.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-cream mb-4">
            {isAr ? 'الإعلانات الأعلى أداءً' : 'Top annonces'}
          </h3>
          <div className="space-y-3">
            {stats.top_annonces.map((item, i) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gold/10 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-gold/10 text-gold text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-cream truncate max-w-[200px]">{item.titre}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-subdued">
                  <span>{item.nb_vues} {isAr ? 'مشاهدة' : 'vues'}</span>
                  <span>{formatMAD(item.prix_vente, i18n.language)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
