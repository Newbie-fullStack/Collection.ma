import api from './client';
import type { User, PaginatedResponse, Listing, Bid, Order, Wallet, WalletTransaction, Review, Dispute, Category, AppNotification, Invoice, SellerStats, SavedSearch } from '@/types';

// --- Auth ---
export const authApi = {
  register: (data: Record<string, unknown>) => api.post<{ user: User; token: string }>('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post<{ user: User; token: string }>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
  updateProfile: (data: Record<string, unknown>) => api.put<User>('/auth/profile', data),
  changePassword: (data: { current_password: string; password: string }) => api.put('/auth/password', data),
  forgotPassword: (email: string) => api.post<{ message: string }>('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; email: string; password: string; password_confirmation: string }) => api.post<{ message: string }>('/auth/reset-password', data),
  deleteAccount: () => api.delete('/auth/account'),
};

// --- Listings ---
export const listingsApi = {
  list: (params?: Record<string, string | number>) => api.get<PaginatedResponse<Listing>>('/listings', { params }),
  get: (id: number) => api.get<Listing>(`/listings/${id}`),
  getByNumero: (numeroAuto: string) => api.get<Listing>(`/listings/${numeroAuto}`),
  create: (data: FormData) => api.post<Listing>('/listings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: Record<string, unknown>) => api.put<Listing>(`/listings/${id}`, data),
  delete: (id: number) => api.delete(`/listings/${id}`),
  myListings: (params?: Record<string, string | number>) => api.get<PaginatedResponse<Listing>>('/my-listings', { params }),
};

// --- Bids ---
export const bidsApi = {
  list: (listingId: number, params?: Record<string, string | number>) => api.get<PaginatedResponse<Bid>>(`/listings/${listingId}/bids`, { params }),
  place: (listingId: number, data: { montant: number; auto_bid_max?: number }) => api.post<Bid>(`/listings/${listingId}/bids`, data),
  myBids: (params?: Record<string, string | number>) => api.get<PaginatedResponse<Bid>>('/my-bids', { params }),
};

// --- Orders ---
export const ordersApi = {
  list: (params?: Record<string, string | number>) => api.get<PaginatedResponse<Order>>('/orders', { params }),
  sellerOrders: (params?: Record<string, string | number>) => api.get<PaginatedResponse<Order>>('/seller-orders', { params }),
  get: (id: number) => api.get<Order>(`/orders/${id}`),
  create: (data: { listing_id: number }) => api.post<Order>('/orders', data),
  ship: (id: number, data: { tracking_number: string; transporteur?: string }) => api.post<Order>(`/orders/${id}/ship`, data),
  confirmReception: (id: number) => api.post<Order>(`/orders/${id}/confirm`),
  recentSales: () => api.get<Order[]>('/recent-sales'),
  sellerInvoices: (params?: Record<string, string | number>) => api.get<PaginatedResponse<Invoice>>('/seller-invoices', { params }),
  sellerStats: () => api.get<SellerStats>('/seller-stats'),
};

// --- Wallet ---
export const walletApi = {
  get: () => api.get<Wallet>('/wallet'),
  transactions: (params?: Record<string, string | number>) => api.get<PaginatedResponse<WalletTransaction>>('/wallet/transactions', { params }),
  topup: (amount: number) => api.post<{ message: string; reference: string }>('/wallet/topup', { amount }),
  requestWithdrawal: (amount: number) => api.post<{ message: string }>('/wallet/withdraw', { amount }),
  withdrawals: (params?: Record<string, string | number>) => api.get<PaginatedResponse<WalletTransaction>>('/wallet/withdrawals', { params }),
};

// --- Favorites ---
export const favoritesApi = {
  list: (params?: Record<string, string | number>) => api.get<PaginatedResponse<Listing>>('/favorites', { params }),
  toggle: (listingId: number) => api.post<{ favori: boolean }>('/favorites/toggle', { listing_id: listingId }),
};

// --- Reviews ---
export const reviewsApi = {
  list: (params?: Record<string, string | number>) => api.get<PaginatedResponse<Review>>('/reviews', { params }),
  create: (data: { order_id: number; note: number; commentaire?: string }) => api.post<Review>('/reviews', data),
};

// --- Disputes ---
export const disputesApi = {
  list: (params?: Record<string, string | number>) => api.get<PaginatedResponse<Dispute>>('/disputes', { params }),
  create: (data: { order_id: number; raison: string; description: string }) => api.post<Dispute>('/disputes', data),
  get: (id: number) => api.get<Dispute>(`/disputes/${id}`),
};

// --- Categories ---
export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
};

// --- Saved Searches ---
export const savedSearchesApi = {
  list: () => api.get<SavedSearch[]>('/saved-searches'),
  create: (data: Record<string, unknown>) => api.post<SavedSearch>('/saved-searches', data),
  update: (id: number, data: Record<string, unknown>) => api.put<SavedSearch>(`/saved-searches/${id}`, data),
  remove: (id: number) => api.delete(`/saved-searches/${id}`),
};

// --- Notifications ---
export const notificationsApi = {
  list: (params?: Record<string, string | number>) => api.get<PaginatedResponse<AppNotification>>('/notifications', { params }),
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// --- Conversations ---
export interface Conversation {
  id: number;
  user_one_id: number;
  user_two_id: number;
  listing_id: number | null;
  last_message_id: number | null;
  last_message_at: string;
  user_one?: { id: number; pseudo: string };
  user_two?: { id: number; pseudo: string };
  listing?: { id: number; titre: string; numero_auto: string };
  last_message?: { id: number; contenu: string; created_at: string; sender_id: number };
  other_user?: { id: number; pseudo: string };
  unread_count?: number;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  contenu: string;
  lu: boolean;
  created_at: string;
  sender?: { id: number; pseudo: string };
}

export const conversationsApi = {
  list: (params?: Record<string, string | number>) => api.get<PaginatedResponse<Conversation>>('/conversations', { params }),
  unreadCount: () => api.get<{ count: number }>('/conversations/unread-count'),
  create: (data: { user_id: number; listing_id?: number }) => api.post<Conversation>('/conversations', data),
  messages: (id: number, params?: Record<string, string | number>) => api.get<PaginatedResponse<ChatMessage>>(`/conversations/${id}/messages`, { params }),
  sendMessage: (id: number, data: { contenu: string }) => api.post<ChatMessage>(`/conversations/${id}/messages`, data),
  markAsRead: (id: number) => api.put(`/conversations/${id}/read`),
};
