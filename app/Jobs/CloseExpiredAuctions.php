<?php

namespace App\Jobs;

use App\Events\AuctionWon;
use App\Models\Bid;
use App\Models\Listing;
use App\Services\NotificationsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CloseExpiredAuctions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    /**
     * Daily job: close expired auction listings and award winning bids.
     */
    public function handle(): void
    {
        $expiredAuctions = Listing::where('statut', 'active')
            ->where('mode', 'enchere')
            ->where('date_expiration', '<=', now())
            ->get();

        foreach ($expiredAuctions as $listing) {
            $this->closeAuction($listing);
        }

        Log::info('CloseExpiredAuctions: processed '.$expiredAuctions->count().' auctions.');
    }

    protected function closeAuction(Listing $listing): void
    {
        $winningBid = $listing->bids()
            ->where('statut', 'active')
            ->orderByDesc('montant')
            ->first();

        if ($winningBid) {
            // Mark winning bid
            $winningBid->update(['statut' => 'gagnee']);

            // Mark all other bids as lost
            $listing->bids()
                ->where('statut', 'active')
                ->where('id', '!=', $winningBid->id)
                ->update(['statut' => 'perdue']);

            // Update listing
            $listing->update([
                'statut' => 'vendue',
                'prix_actuel' => $winningBid->montant,
            ]);

            // Notify the winner (in-app + email) and broadcast the live win event
            AuctionWon::dispatch($listing, $winningBid->bidder_id);

            NotificationsService::notify(
                $winningBid->bidder_id,
                'auction_won',
                'Enchère gagnée',
                'مزاد مكتمل',
                "Félicitations ! Vous avez remporté \"{$listing->titre}\" à {$winningBid->montant} DH.",
                "تهانينا! لقد فزت \"{$listing->titre}\" بمبلغ {$winningBid->montant} درهم.",
                '/listings/'.$listing->numero_auto,
                [
                    'listing_id' => $listing->id,
                    'bid_id' => $winningBid->id,
                    'prix_final' => $winningBid->montant,
                ]
            );

            Log::info("Auction closed: {$listing->numero_auto}, winner bid: {$winningBid->montant} MAD");
        } else {
            // No bids → expire the listing
            $listing->update(['statut' => 'expiree']);
            Log::info("Auction expired with no bids: {$listing->numero_auto}");
        }
    }
}
