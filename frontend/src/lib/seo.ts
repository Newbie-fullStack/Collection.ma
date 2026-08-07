import { useEffect } from 'react';
import type { Listing } from '@/types';

const BASE_URL = window.location.origin;

function sitePretty(): string {
  return 'collection.ma';
}

function siteMetaTitle(): string {
  return "collection.ma — Marketplace d'objets de collection";
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  const selector = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertJsonLd(scriptId: string, data: Record<string, unknown>): void {
  let el = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = scriptId;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Inject Product + Offer structured data and social meta tags for a listing.
 * Works as a progressively-enhanced SPA alongside /llms.txt for content crawlers.
 */
export function useListingSeo(listing: Listing | null): void {
  useEffect(() => {
    if (!listing) return;

    const url = `${BASE_URL}/listings/${listing.numero_auto}`;
    const title = `${listing.titre} — ${sitePretty()}`;
    const description = listing.description
      ? escapeHtml(listing.description.slice(0, 200))
      : `${listing.titre} sur ${sitePretty()}`;
    const image = listing.photos?.[0]?.path
      ? `${BASE_URL}/storage/${listing.photos[0].path}`
      : '/placeholder-listing.jpg';

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'product');
    upsertMeta('property', 'og:url', url);
    if (image.startsWith('http')) upsertMeta('property', 'og:image', image);

    upsertJsonLd('listing-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.titre,
      description,
      image,
      url,
      category: listing.category?.nom_fr ?? undefined,
      offers: {
        '@type': 'Offer',
        price: Number(listing.mode === 'enchere' ? listing.prix_actuel || listing.prix_vente : listing.prix_vente),
        priceCurrency: 'MAD',
        availability: listing.statut === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url,
      },
      seller: listing.seller ? { '@type': 'Person', name: listing.seller.pseudo } : undefined,
    });

    return () => {
      document.title = siteMetaTitle();
    };
  }, [listing]);
}

/**
 * Lightweight page-level SEO: sets title, description and og meta for public pages.
 * Pass the page title (falsy resets to the site default).
 */
export function usePageSeo(title?: string, description?: string): void {
  useEffect(() => {
    if (!title) {
      document.title = siteMetaTitle();
      return;
    }

    document.title = title;
    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
    }
    upsertMeta('property', 'og:title', title);

    return () => {
      document.title = siteMetaTitle();
    };
  }, [title, description]);
}

/**
 * Alias used by the public seller profile page.
 */
export const useProfileSeo = usePageSeo;