<?php

namespace App\Services;

use App\Models\Listing;
use App\Models\SavedSearch;

/**
 * Matches a freshly-published listing against users' saved searches and fires alerts.
 * Normalizes the same filters exposed by the public listing index.
 */
class SavedSearchMatcher
{
    /**
     * @return SavedSearch[] active alerts that match $listing
     */
    public static function matchListings(Listing $listing): array
    {
        return SavedSearch::query()
            ->where('alerte_active', true)
            ->get()
            ->filter(fn (SavedSearch $search) => self::matches($search, $listing))
            ->values()
            ->all();
    }

    public static function matches(SavedSearch $search, Listing $listing): bool
    {
        if ($search->category_id && (int) $search->category_id !== (int) $listing->category_id) {
            return false;
        }
        if ($search->mode && $search->mode !== $listing->mode) {
            return false;
        }
        if ($search->prix_min !== null && (float) $listing->prix_vente < (float) $search->prix_min) {
            return false;
        }
        if ($search->prix_max !== null && (float) $listing->prix_vente > (float) $search->prix_max) {
            return false;
        }
        if ($search->mot_cle) {
            $needle = mb_strtolower(trim($search->mot_cle));
            $haystack = mb_strtolower($listing->titre.' '.$listing->description);
            if ($needle !== '' && ! str_contains($haystack, $needle)) {
                return false;
            }
        }

        return true;
    }
}