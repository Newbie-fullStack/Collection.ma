<?php

namespace App\Jobs;

use App\Models\Listing;
use App\Services\NotificationsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Publishes listings whose planned publication date has arrived.
 * Runs every minute (lightweight query, indexed on date_publication_planifiee).
 */
class PublishScheduledListings implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    public function handle(): void
    {
        $listings = Listing::where('statut', 'brouillon')
            ->whereNotNull('date_publication_planifiee')
            ->where('date_publication_planifiee', '<=', now())
            ->get();

        $published = 0;

        foreach ($listings as $listing) {
            $listing->update([
                'statut' => 'active',
                'date_publication' => now(),
                'date_publication_planifiee' => null,
                'date_expiration' => now()->addDays(28),
            ]);

            NotificationsService::notify(
                user: $listing->seller_id,
                type: 'listing_publie',
                title: 'Votre annonce est en ligne',
                titleAr: 'إعلانك أصبح متاحًا',
                message: 'Votre annonce « '.$listing->titre.' » a été publiée.',
                messageAr: 'تم نشر إعلانك « '.$listing->titre.' ».',
                link: '/listings/'.$listing->id,
                data: ['listing_id' => $listing->id],
            );

            $published++;
        }

        if ($published > 0) {
            Log::info("PublishScheduledListings: {$published} listings published.");
        }
    }
}