<?php

namespace App\Jobs;

use App\Models\Listing;
use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RepublishExpiredListings implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    /**
     * Daily job: auto-republish active listings that expired (J+28) unless manually disabled.
     */
    public function handle(): void
    {
        $autoRepublish = SiteSetting::get('auto_republication', true);
        if (! $autoRepublish) {
            Log::info('Auto-republication disabled in settings.');

            return;
        }

        $expiredListings = Listing::where('statut', 'active')
            ->where('date_expiration', '<=', now())
            ->where('mode', 'enchere')
            ->where('nb_republications', '<', 50) // Safety cap
            ->get();

        $republishedCount = 0;

        foreach ($expiredListings as $listing) {
            $this->republishListing($listing);
            $republishedCount++;
        }

        Log::info("RepublishExpiredListings: {$republishedCount} listings republished.");
    }

    protected function republishListing(Listing $listing): void
    {
        $dureeJours = SiteSetting::get('duree_annonces_jours', 28);

        $listing->update([
            'statut' => 'active',
            'date_publication' => now(),
            'date_expiration' => now()->addDays($dureeJours),
            'nb_republications' => $listing->nb_republications + 1,
        ]);

        Log::info("Listing #{$listing->numero_auto} republished ({$listing->nb_republications} times).");
    }
}
