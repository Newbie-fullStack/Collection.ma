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

export function getRemainingTime(dateExpiration: string | Date): { jours: number; heures: number; minutes: number } | null {
  const exp = new Date(dateExpiration);
  const now = new Date();
  if (exp <= now) return null;

  const diff = exp.getTime() - now.getTime();
  const jours = Math.floor(diff / (1000 * 60 * 60 * 24));
  const heures = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { jours, heures, minutes };
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
