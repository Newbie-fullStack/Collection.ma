import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { listingsApi } from '@/api';
import { ListingCard } from '@/components/listing/ListingCard';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ListingTabs } from '@/components/home/ListingTabs';
import { CommunityBlock } from '@/components/home/CommunityBlock';
import Carousel from '@/components/ui/Carousel';
import type { Listing } from '@/types';
import { cn } from '@/lib/utils';

export function HomePage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('nouveautes');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { per_page: 8 };
    if (activeTab === 'nouveautes') {
      params.sort_by = 'created_at';
      params.sort_dir = 'desc';
    } else if (activeTab === 'encheres') {
      params.mode = 'enchere';
    } else if (activeTab === 'achat_immadiat') {
      params.mode = 'achat_immediat';
    }
    listingsApi.list(params)
      .then(({ data }) => setListings(data.data))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery);
    if (searchCategory) params.set('category', searchCategory);
    navigate(`/listings?${params.toString()}`);
  };

  const tabs = [
    { key: 'nouveautes', label: t('accueil.nouveautes') },
    { key: 'encheres', label: t('accueil.encheres') },
    { key: 'achat_immadiat', label: t('accueil.achat_immadiat') },
  ];

  const categories = [
    { id: '1', label: 'Monnaies' }, { id: '2', label: 'Timbres' },
    { id: '3', label: 'Billets' }, { id: '4', label: 'Montres' },
    { id: '5', label: 'Cartes postales' }, { id: '6', label: 'Enveloppes' },
    { id: '7', label: 'Bijoux' }, { id: '8', label: 'Statues' },
  ];

  const carouselItems = listings.map(l => ({
    id: l.id,
    title: l.titre,
    description: l.description,
    price: l.prix_actuel || l.prix_vente,
    image: l.photos?.[0]?.path ? `/storage/${l.photos[0].path}` : `/storage/placeholders/listing_${l.id}.png`,
    onClick: () => navigate(`/listings/${l.numero_auto}`)
  }));

  const leftItems = carouselItems.length > 0 ? carouselItems.slice(0, 5) : undefined;
  const rightItems = carouselItems.length > 5 ? carouselItems.slice(5, 10) : leftItems;

  return (
    <div className="bg-navy min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full border border-gold/5 absolute" />
          <div className="w-[800px] h-[800px] rounded-full border border-gold/3 absolute" />
          <div className="w-[1000px] h-[1000px] rounded-full border border-gold/2 absolute" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">

            {/* Left carousel - Listings */}
            <div className="hidden md:block md:col-span-3">
              <Carousel
                items={leftItems}
                baseWidth={275}
                autoplay
                autoplayDelay={3500}
                pauseOnHover
                loop
              />
            </div>

            {/* Center - Logo & Search */}
            <div className="text-center md:col-span-6 px-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3">
                {isAr ? 'مجموعات نادرة واصيلة' : 'COLLECTIONS RARES & AUTHENTIQUES'}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-cream mb-2 tracking-tight">
                collection.ma
              </h1>
              <div className="flex justify-center my-3">
                <span className="text-gold text-xl">&#10022;</span>
              </div>
              <p className="text-text-subdued text-sm mb-6">
                {isAr ? 'السوق المغربية المخصصة' : 'La marketplace marocaine dediee'}
                <br />
                {isAr ? 'لكنوز جمع التشكيل' : "aux objets de collection et d'antiquite"}
              </p>

              {/* CTA Button */}
              <button className="bg-gold text-navy font-semibold px-8 py-3 rounded-full hover:bg-gold-light transition-all hover:shadow-[0_0_30px_rgba(197,165,90,0.3)] mb-6">
                {isAr ? 'اكتشف الكنوز' : 'DECOUVRIR LES TRESORS'} &rarr;
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 lg:gap-6 text-[10px] text-text-subdued">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <span className="text-gold text-sm">&#10003;</span>
                  </div>
                  <div className="text-left">
                    <p className="text-cream font-medium">{isAr ? 'اصلالية' : 'AUTHENTICITE'}</p>
                    <p className="text-text-subdued">{isAr ? 'خبراء معتمدون' : 'Experts certifies'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <span className="text-gold text-sm">&#9881;</span>
                  </div>
                  <div className="text-left">
                    <p className="text-cream font-medium">{isAr ? 'دفع امن' : 'PAIEMENT SECURISE'}</p>
                    <p className="text-text-subdued">{isAr ? 'معاملات محمية' : 'Transactions protegees'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <span className="text-gold text-sm">&#9992;</span>
                  </div>
                  <div className="text-left">
                    <p className="text-cream font-medium">{isAr ? 'شحن امن' : 'LIVRAISON SECURISEE'}</p>
                    <p className="text-text-subdued">{isAr ? 'في كل مكان' : 'Partout dans le monde'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right carousel - Listings */}
            <div className="hidden md:block md:col-span-3">
              <Carousel
                items={rightItems}
                baseWidth={275}
                autoplay
                autoplayDelay={4000}
                pauseOnHover
                loop
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CategoryGrid />

        <div className="divider-gold my-8" />

        {/* Listings */}
        <section className="py-4">
          <div className={cn('flex items-center justify-between mb-4', isAr && 'flex-row-reverse')}>
            <ListingTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            <a href="/listings" className="text-sm text-gold hover:text-gold-light transition-colors flex items-center gap-1">
              {isAr ? 'عرض الكل' : 'Voir tous les objets'} <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {Array.from({ length: 8 }).map((_, i) => (
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {!loading && listings.length === 0 && (
            <p className="text-center text-text-subdued py-12">
              {t('commun.aucun_resultat')}
            </p>
          )}
        </section>

        <div className="divider-gold my-8" />

        {/* Community */}
        <CommunityBlock />
      </div>
    </div>
  );
}
