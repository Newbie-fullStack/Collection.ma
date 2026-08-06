import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

export const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
  wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 6001,
  wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 6001,
  forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
  enabledTransports: ['ws', 'wss'],
});

export function subscribeToNotifications(userId: number, callbacks: {
  onBid?: (data: Record<string, unknown>) => void;
  onAuctionWon?: (data: Record<string, unknown>) => void;
  onOrderShipped?: (data: Record<string, unknown>) => void;
}) {
  const channel = echo.private(`user.${userId}`);

  if (callbacks.onBid) {
    channel.listen('.bid.placed', callbacks.onBid);
  }
  if (callbacks.onAuctionWon) {
    channel.listen('.auction.won', callbacks.onAuctionWon);
  }
  if (callbacks.onOrderShipped) {
    channel.listen('.order.shipped', callbacks.onOrderShipped);
  }

  return channel;
}
