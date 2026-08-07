<?php

namespace App\Jobs;

use App\Models\Listing;
use App\Models\Notification;
use App\Services\NotificationsService;
use App\Services\SavedSearchMatcher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Periodic job (default: every 15 min): scans recently-published listings and
 * alerts each subscribed user whose saved search matches. Instant alerts are
 * typically fired at publish time via NotifySavedSearchers; this job is the
 * safety net for batched frequencies.
 */
class MatchSavedSearches implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 300;

    public function handle(): void
    {
        // Listings published in the last 30 minutes, not yet alerted.
        $recent = Listing::where('statut', 'active')
            ->where('date_publication', '>', now()->subMinutes(30))
            ->get();

        // Ids already alerted via a prior run (dedup guard).
        $alreadyAlerted = Notification::query()
            ->where('type', 'alert_saved_search')
            ->whereNotNull('data')
            ->get()
            ->map(fn (Notification $n) => $n->data['listing_id'] ?? null)
            ->filter()
            ->unique();

        $recent = $recent->whereNotIn('id', $alreadyAlerted);

        $alerted = 0;

        foreach ($recent as $listing) {
            foreach (SavedSearchMatcher::matchListings($listing) as $search) {
                NotificationsService::notify(
                    user: $search->user_id,
                    type: 'alert_saved_search',
                    title: 'Nouvelle annonce : '.$listing->titre,
                    titleAr: 'إعلان جديد : '.$listing->titre,
                    message: 'Une nouvelle annonce correspond à votre recherche « '.($search->nom ?: $search->mot_cle ?: 'sans nom').' ».',
                    messageAr: 'إعلان جديد يطابق بحثك « '.($search->nom ?: $search->mot_cle ?: 'بدون اسم').' ».',
                    link: '/listings/'.$listing->id,
                    data: ['listing_id' => $listing->id],
                );
                $alerted++;
            }
        }

        Log::info("MatchSavedSearches: {$alerted} alerts fired.");
    }
}