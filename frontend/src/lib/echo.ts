import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

export const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY || 'marketplace-app',
  wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
  wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 6001,
  wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 6001,
  forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
  enabledTransports: ['ws', 'wss'],
  authEndpoint: '/broadcasting/auth',
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
  },
});

// Subscribe to a listing's live bids (any authenticated viewer).
export function subscribeToListing(listingId: number, onBid: (data: Record<string, unknown>) => void) {
  const channel = echo.private(`listing.${listingId}`);
  channel.listen('.bid.placed', onBid);
  return channel;
}

// Subscribe to the winning signal for a listing.
export function subscribeToListingWon(listingId: number, onWon: (data: Record<string, unknown>) => void) {
  const channel = echo.private(`listing.${listingId}`);
  channel.listen('.auction.won', onWon);
  return channel;
}

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

// Subscribe to a conversation's new messages (participants only).
export function subscribeToConversation(conversationId: number, onMessage: (data: Record<string, unknown>) => void) {
  const channel = echo.private(`conversation.${conversationId}`);
  channel.listen('.message.new', onMessage);
  return channel;
}