import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatMAD, cn } from '@/lib/utils';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { items, removeItem, total, count } = useCart();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className={cn(
        'fixed top-0 h-full w-full max-w-md bg-navy border-l border-gold/20 shadow-2xl z-50 flex flex-col',
        isAr ? 'left-0 right-auto border-l-0 border-r' : 'right-0 left-auto'
      )}>
        {/* Header */}
        <div className={cn('flex items-center justify-between p-4 border-b border-navy-hover', isAr && 'flex-row-reverse')}>
          <h2 className="text-lg font-serif font-bold text-cream">
            {isAr ? 'سلة المشتريات' : 'Mon panier'} ({count})
          </h2>
          <button onClick={onClose} className="text-text-subdued hover:text-cream">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-text-subdued mx-auto mb-3" />
              <p className="text-text-subdued">{isAr ? 'السلة فارغة' : 'Votre panier est vide'}</p>
              <Link to="/listings" onClick={onClose} className="btn-gold mt-4 inline-block text-sm">
                {isAr ? 'تصفح الإعلانات' : 'Voir les annonces'}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => {
                const photoPath = item.listing.photos?.[0]?.path || `placeholders/listing_${item.listing.id}.png`;
                const photoUrl = `/storage/${photoPath}`;
                const price = item.listing.prix_actuel || item.listing.prix_vente;
                return (
                  <div key={item.listing.id} className={cn('flex gap-3 p-3 bg-navy-hover rounded-lg', isAr && 'flex-row-reverse')}>
                    <div className="w-16 h-16 rounded bg-navy-hover overflow-hidden shrink-0">
                      <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/listings/${item.listing.numero_auto}`}
                        onClick={onClose}
                        className="text-sm font-medium text-cream hover:text-gold truncate block"
                      >
                        {item.listing.titre}
                      </Link>
                      <p className="text-xs text-text-subdued mt-0.5">
                        {item.listing.mode === 'enchere' ? (isAr ? 'licitat' : 'Enchère') : (isAr ? 'شراء مباشر' : 'Achat immédiat')}
                      </p>
                      <div className={cn('flex items-center justify-between mt-1', isAr && 'flex-row-reverse')}>
                        <span className="font-bold text-sm text-gold">{formatMAD(Number(price) || 0, i18n.language)}</span>
                        {item.listing.frais_port > 0 && (
                          <span className="text-[10px] text-text-subdued">
                            + {formatMAD(Number(item.listing.frais_port) || 0, i18n.language)} {isAr ? 'شحن' : 'port'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.listing.id)}
                      className="text-text-subdued hover:text-red shrink-0 self-start"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-navy-hover p-4 space-y-3">
            <div className={cn('flex justify-between items-center', isAr && 'flex-row-reverse')}>
              <span className="text-sm text-text-subdued">{isAr ? 'المجموع' : 'Total'}</span>
              <span className="text-xl font-bold text-cream">{formatMAD(total, i18n.language)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="btn-gold w-full text-center block py-3"
            >
              {isAr ? 'إتمام الشراء' : 'Passer la commande'}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
