import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi } from '@/api';
import { Bell, Check, CheckCheck, Trash2, Package, Star, MessageSquare, AlertTriangle, Clock } from 'lucide-react';
import type { AppNotification } from '@/types';

export function NotificationsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.list({ per_page: 20 })
      .then(({ data }) => setNotifications(data.data || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = (id: number) => {
    notificationsApi.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    notificationsApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const iconMap: Record<string, typeof Bell> = {
    bid_placed: Star,
    auction_won: Package,
    order_shipped: Package,
    order_delivered: Check,
    review_received: Star,
    dispute_opened: AlertTriangle,
    system: Bell,
  };

  const colorMap: Record<string, string> = {
    bid_placed: 'bg-gold/10 text-gold',
    auction_won: 'bg-green/10 text-green',
    order_shipped: 'bg-blue/10 text-blue',
    order_delivered: 'bg-green/10 text-green',
    review_received: 'bg-gold/10 text-gold',
    dispute_opened: 'bg-red/10 text-red',
    system: 'bg-text-subdued/10 text-text-subdued',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className={cn('flex items-center justify-between mb-8', isAr && 'flex-row-reverse')}>
        <div>
          <h1 className="text-3xl font-serif font-bold text-cream">
            {isAr ? 'Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª' : 'Notifications'}
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-text-subdued mt-1">
              {unreadCount} {isAr ? 'ØºÙŠØ± Ù…Ù‚Ø±ÙˆØ¡' : 'non lues'}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm text-gold hover:text-gold-dark transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            {isAr ? 'ØªØ­Ø¯ÙŠØ¯ Ø§Ù„ÙƒÙ„ ÙƒÙ…Ù‚Ø±ÙˆØ¡' : 'Tout marquer comme lu'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse flex gap-4">
              <div className="w-10 h-10 rounded-full bg-navy-hover" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-navy-hover rounded w-1/3" />
                <div className="h-3 bg-navy-hover rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-8 text-center">
          <Bell className="w-12 h-12 text-text-subdued mx-auto mb-3" />
          <p className="text-text-subdued">
            {isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¥Ø´Ø¹Ø§Ø±Ø§Øª' : 'Aucune notification'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] || Bell;
            const iconColor = colorMap[n.type] || 'bg-text-subdued/10 text-text-subdued';
            return (
              <div
                key={n.id}
                className={cn(
                  'card p-4 flex items-start gap-4 transition-colors cursor-pointer',
                  !n.read && 'border-l-4 border-l-gold bg-gold/5'
                )}
                onClick={() => markAsRead(n.id)}
              >
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', iconColor)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-cream">
                    {isAr ? n.title_ar : n.title}
                  </h3>
                  <p className="text-sm text-text-subdued mt-1">
                    {isAr ? n.message_ar : n.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-text-subdued flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.created_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}
                    </span>
                    {n.link && (
                      <Link to={n.link} className="text-xs text-gold hover:text-gold-dark">
                        {isAr ? 'Ø¹Ø±Ø¶' : 'Voir'} â†’
                      </Link>
                    )}
                  </div>
                </div>
                {!n.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-gold shrink-0 mt-1" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
