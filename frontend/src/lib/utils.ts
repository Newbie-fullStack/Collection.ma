import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMAD(amount: number, locale: string = 'fr'): string {
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-MA' : 'fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return locale === 'ar' ? `${formatted} درهم` : `${formatted} Dh`;
}

export function formatDate(date: string | Date, locale: string = 'fr'): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA' : 'fr-MA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date, locale: string = 'fr'): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA' : 'fr-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function getTotalSecondsRemaining(dateExpiration: string | Date): number {
  const exp = new Date(dateExpiration).getTime();
  const now = Date.now();
  if (exp <= now) return 0;
  return Math.floor((exp - now) / 1000);
}

export function getRemainingTime(dateExpiration: string | Date): { jours: number; heures: number; minutes: number; secondes: number } | null {
  const total = getTotalSecondsRemaining(dateExpiration);
  if (total <= 0) return null;

  return {
    jours: Math.floor(total / 86400),
    heures: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    secondes: total % 60,
  };
}

export function getStatusColor(statut: string): string {
  const colors: Record<string, string> = {
    'attente_paiement': 'badge-yellow',
    'sequestre': 'badge-blue',
    'expedie': 'badge-green',
    'livre_confirme': 'badge-green',
    'vire_vendeur': 'badge-green',
    'rembourse': 'badge-red',
    'litige': 'badge-red',
    'brouillon': 'badge-yellow',
    'active': 'badge-green',
    'vendue': 'badge-gold',
    'expiree': 'badge-red',
    'suspendue': 'badge-red',
  };
  return colors[statut] || 'badge';
}

export function getPhotoUrl(photo?: { url?: string; path?: string } | null): string {
  if (!photo) return '/placeholder-listing.jpg';
  if (photo.url) return photo.url;
  if (photo.path) return `/storage/${photo.path}`;
  return '/placeholder-listing.jpg';
}
