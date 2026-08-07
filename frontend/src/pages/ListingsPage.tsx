import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listingsApi } from '@/api';
import { ListingCard } from '@/components/listing/ListingCard';
import { ListingTabs } from '@/components/home/ListingTabs';
import { cn } from '@/lib/utils';
import type { Listing } from '@/types';

export function ListingsPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const currentMode = searchParams.get('mode') || '';
  const currentCategory = searchParams.get('category') || '';
  const query = searchParams.get('q') || '';

  const tabs = [
    { key: '', label: t('commun.tous') || 'Tous' },
    { key: 'enchere', label: t('accueil.encheres') },
    { key: 'achat_immediat', label: t('accueil.achat_immadiat') },
  ];

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { per_page: 20, page };
    if (currentMode) params.mode = currentMode;
    if (currentCategory) params.category = currentCategory;
    if (query) params.q = query;

    listingsApi.list(params)
      .then(({ data }) => {
        setListings(data.data);
        setTotalPages(data.last_page);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [currentMode, currentCategory, query, page]);

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    if (tab) {
      params.set('mode', tab);
    } else {
      params.delete('mode');
    }
    setSearchParams(params);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className={cn('text-2xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
        {currentCategory
          ? currentCategory.replace(/-/g, ' ')
          : query
            ? `${t('commun.rechercher')}: "${query}"`
            : t('nav.encheres')
        }
      </h1>

      <ListingTabs tabs={tabs} activeTab={currentMode} onChange={handleTabChange} />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-navy-hover" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-navy-hover rounded w-3/4" />
                <div className="h-6 bg-navy-hover rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {listings.length === 0 && (
            <p className="text-center text-text-subdued py-12">
              {t('commun.aucun_resultat')}
            </p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-gold-outline text-sm disabled:opacity-50"
              >
                {t('commun.page_precedente')}
              </button>
              <span className="text-sm text-text-subdued px-4">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-gold-outline text-sm disabled:opacity-50"
              >
                {t('commun.page_suivante')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
