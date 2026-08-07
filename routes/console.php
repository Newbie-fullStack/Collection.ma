<?php

use App\Jobs\CloseExpiredAuctions;
use App\Jobs\ConfirmDeliveryReminder;
use App\Jobs\MatchSavedSearches;
use App\Jobs\PublishScheduledListings;
use App\Jobs\RepublishExpiredListings;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// --- Collection.ma Scheduled Jobs ---

// Daily at 02:00 AM: republish expired listings (J+28 auto-republication)
Schedule::job(new RepublishExpiredListings)->dailyAt('02:00');

// Daily at 02:30 AM: close expired auctions and award winning bids
Schedule::job(new CloseExpiredAuctions)->dailyAt('02:30');

// Daily at 08:00 AM: check overdue delivery confirmations → auto-refund
Schedule::job(new ConfirmDeliveryReminder)->dailyAt('08:00');

// Every 15 min: alert subscribers whose saved search matches newly-published listings
Schedule::job(new MatchSavedSearches)->everyFifteenMinutes();

// Every minute: publish scheduled drafts once their planned date arrives
Schedule::job(new PublishScheduledListings)->everyMinute();
