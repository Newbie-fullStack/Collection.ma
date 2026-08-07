<?php

namespace Tests\Feature;

use App\Mail\AppNotificationMail;
use App\Models\Category;
use App\Models\Listing;
use App\Models\SavedSearch;
use App\Models\User;
use App\Services\SavedSearchMatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SavedSearchAlertTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(['CategorySeeder', 'SiteSettingsSeeder']);
    }

    public function test_matcher_returns_only_matching_active_alerts(): void
    {
        $user = User::factory()->create();
        $category = Category::first();

        $matching = SavedSearch::create([
            'user_id' => $user->id,
            'nom' => 'Diggle 1970',
            'mot_cle' => 'diggle',
            'category_id' => $category->id,
            'prix_max' => 2000,
            'alerte_active' => true,
        ]);

        SavedSearch::create([
            'user_id' => $user->id,
            'nom' => 'Inactive',
            'mot_cle' => 'diggle',
            'alerte_active' => false,
        ]);

        $listing = Listing::factory()->create([
            'category_id' => $category->id,
            'titre' => 'Rare Diggle figurine',
            'prix_vente' => 500,
            'statut' => 'active',
            'date_publication' => now(),
        ]);

        $matches = SavedSearchMatcher::matchListings($listing);

        $this->assertCount(1, $matches);
        $this->assertSame($matching->id, $matches[0]->id);
    }

    public function test_matcher_excludes_price_and_category_mismatches(): void
    {
        $user = User::factory()->create();
        $category = Category::first();

        SavedSearch::create([
            'user_id' => $user->id,
            'nom' => 'Trop cher',
            'prix_max' => 100,
            'alerte_active' => true,
        ]);

        SavedSearch::create([
            'user_id' => $user->id,
            'nom' => 'Trop bas',
            'prix_min' => 5000,
            'alerte_active' => true,
        ]);

        $listing = Listing::factory()->create([
            'category_id' => $category->id,
            'prix_vente' => 500,
            'date_publication' => now(),
        ]);

        $this->assertSame([], SavedSearchMatcher::matchListings($listing));
    }

    public function test_match_saved_searches_job_fires_notification_and_email(): void
    {
        Mail::fake();
        Log::spy();

        $user = User::factory()->create(['langue_preferee' => 'fr']);
        $category = Category::first();

        SavedSearch::create([
            'user_id' => $user->id,
            'nom' => 'Chevech de collection',
            'mot_cle' => 'collection',
            'category_id' => $category->id,
            'alerte_active' => true,
        ]);

        Listing::factory()->create([
            'category_id' => $category->id,
            'titre' => 'Objet de collection rare',
            'statut' => 'active',
            'date_publication' => now(),
        ]);

        (new \App\Jobs\MatchSavedSearches())->handle();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'type' => 'alert_saved_search',
        ]);

        Mail::assertQueued(AppNotificationMail::class, 1);
    }
}