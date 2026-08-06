import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Clock } from 'lucide-react';
import { cn, formatMAD, getRemainingTime } from '@/lib/utils';
import type { Listing } from '@/types';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const remaining = getRemainingTime(listing.date_expiration);

  const photoUrl = listing.photos?.[0]?.path
    ? `/storage/${listing.photos[0].path}`
    : '/placeholder-listing.jpg';

  return (
    <Link to={`/listings/${listing.numero_auto}`} className="card-hover group block">
      <div className="relative">
        {/* Photo */}
        <div className="aspect-square overflow-hidden bg-navy-hover">
          <img
            src={photoUrl}
            alt={listing.titre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Category badge */}
        {listing.category && (
          <span className={cn(
            'absolute top-2 px-2 py-0.5 bg-navy/90 text-gold text-[10px] rounded border border-gold/20',
            isAr ? 'right-2' : 'left-2'
          )}>
            {isAr ? listing.category.nom_ar : listing.category.nom_fr}
          </span>
        )}

        {/* Favorite heart */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className={cn(
            'absolute top-2 w-8 h-8 rounded-full bg-navy/80 border border-gold/20 flex items-center justify-center hover:bg-gold/10 transition-colors',
            isAr ? 'left-2' : 'right-2'
          )}
        >
          <Heart className="w-4 h-4 text-text-subdued hover:text-red transition-colors" />
        </button>
      </div>

      {/* Info */}
      <div className={cn('p-3', isAr && 'text-right')}>
        {/* Category name */}
        <p className="text-[10px] text-text-subdued mb-1">
          {listing.category ? (isAr ? listing.category.nom_ar : listing.category.nom_fr) : ''}
        </p>

        {/* Title */}
        <h3 className="font-medium text-sm text-cream line-clamp-2 group-hover:text-gold transition-colors">
          {listing.titre}
        </h3>

        {/* Price */}
        <div className={cn('mt-2 flex items-baseline gap-2', isAr && 'flex-row-reverse')}>
          <span className="font-bold text-lg text-gold">
            {formatMAD(listing.prix_actuel || listing.prix_vente, i18n.language)}
          </span>
          <span className="text-xs text-text-subdued">MAD</span>
        </div>

        {/* Countdown for auctions */}
        {remaining && listing.mode === 'enchere' && (
          <div className={cn('mt-2 flex items-center gap-1 text-xs text-text-subdued', isAr && 'flex-row-reverse')}>
            <Clock className="w-3 h-3" />
            <span>
              {remaining.jours > 0 && `${remaining.jours}j `}
              {remaining.heures}h {remaining.minutes}min
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
