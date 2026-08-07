<?php

namespace App\Services;

use App\Models\Bid;
use App\Models\Listing;
use App\Models\SiteSetting;

/**
 * Auction anti-fraud heuristics.
 * - Anti-sniping: a bid in the final N seconds extends the auction to avoid last-second sniping.
 * - Abnormal price jump: a bid far above the previous amount is flagged as suspicious.
 * All thresholds are configurable via SiteSetting.
 */
class AuctionFraudGuard
{
    public const SNIPE_WINDOW_SECONDS = 120; // bid within last 2 min triggers extension
    public const EXTENSION_SECONDS = 120; // auction extends by 2 min
    public const MAX_EXTENSIONS = 10;

    public const ABNORMAL_JUMP_PCT = 50; // % above previous price flags the bid

    public static function guard(Listing $listing, float $montant, ?float $previousPrice = null): ?string
    {
        $motif = null;

        // Anti-sniping extension.
        $extended = self::maybeExtendForSnipe($listing);
        if ($extended) {
            $motif = $motif ? $motif.';anti_snipe' : 'anti_snipe';
        }

        // Abnormal price jump detection.
        if (self::isAbnormalJump($listing, $montant, $previousPrice)) {
            $motif = $motif ? $motif.';prix_anormal' : 'prix_anormal';
        }

        return $motif;
    }

    public static function isAbnormalJump(Listing $listing, float $montant, ?float $previousPrice = null): bool
    {
        $baseline = $previousPrice;
        if ($baseline === null) {
            $baseline = (float) $listing->bids()->max('montant');
        }
        if ($baseline === null) {
            $baseline = (float) $listing->prix_vente;
        }
        if ($baseline <= 0) {
            return false;
        }

        $parsePct = SiteSetting::get('fraude_saut_prix_pct', self::ABNORMAL_JUMP_PCT);
        $threshold = (float) $parsePct / 100;

        return ($montant - $baseline) / $baseline > $threshold;
    }

    public static function isWithinSnipeWindow(Listing $listing): bool
    {
        if (! $listing->date_expiration) {
            return false;
        }

        $expiry = $listing->date_expiration;
        $cutoff = now()->addSeconds(self::SNIPE_WINDOW_SECONDS);

        return $expiry->greaterThan(now()) && $expiry->lessThanOrEqualTo($cutoff);
    }

    /**
     * Extend an auction if the current bid lands in the snipe window.
     * Returns true if extended.
     */
    public static function maybeExtendForSnipe(Listing $listing): bool
    {
        if ($listing->mode !== 'enchere') {
            return false;
        }

        if (! self::isWithinSnipeWindow($listing)) {
            return false;
        }

        if ($listing->extensions_anti_snipe >= self::MAX_EXTENSIONS) {
            return false;
        }

        $listing->update([
            'date_expiration' => now()->addSeconds(self::EXTENSION_SECONDS),
            'extensions_anti_snipe' => $listing->extensions_anti_snipe + 1,
        ]);

        return true;
    }
}