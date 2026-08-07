<?php

namespace Tests\Feature;

use App\Models\Bid;
use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use App\Services\AuctionFraudGuard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuctionFraudGuardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(['CategorySeeder', 'SiteSettingsSeeder']);
    }

    public function test_bid_in_snipe_window_extends_auction(): void
    {
        $seller = User::factory()->create(['role' => 'both']);
        $bidder = User::factory()->create(['role' => 'both']);
        $category = Category::first();

        $listing = Listing::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'mode' => 'enchere',
            'prix_vente' => 100,
            'prix_actuel' => 100,
            'date_expiration' => now()->addSeconds(60), // inside snipe window
        ]);

        $expiryBefore = $listing->date_expiration;

        $motif = AuctionFraudGuard::guard($listing, 110, 100);

        $listing->refresh();

        $this->assertNotNull($motif);
        $this->assertStringContainsString('anti_snipe', $motif);
        $this->assertGreaterThan($expiryBefore, $listing->date_expiration);
        $this->assertSame(1, $listing->extensions_anti_snipe);
    }

    public function test_abnormal_price_jump_is_flagged(): void
    {
        $seller = User::factory()->create();
        $bidder = User::factory()->create();
        $category = Category::first();

        $listing = Listing::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'mode' => 'enchere',
            'prix_vente' => 100,
            'prix_actuel' => 100,
            'date_expiration' => now()->addDays(7),
        ]);

        // >50% jump flagged.
        $motif = AuctionFraudGuard::guard($listing, 400, 100);

        $this->assertNotNull($motif);
        $this->assertStringContainsString('prix_anormal', $motif);
    }

    public function test_normal_increment_is_not_flagged(): void
    {
        $seller = User::factory()->create();
        $bidder = User::factory()->create();
        $category = Category::first();

        $listing = Listing::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'mode' => 'enchere',
            'prix_vente' => 100,
            'prix_actuel' => 100,
            'date_expiration' => now()->addDays(7),
        ]);

        $motif = AuctionFraudGuard::guard($listing, 110, 100);

        $this->assertNull($motif);
    }

    public function test_bid_controller_flags_suspect_bid_and_persists(): void
    {
        $vendor = User::factory()->create(['role' => 'both']);
        $bidder = User::factory()->create(['role' => 'both']);
        $category = Category::first();

        $listing = Listing::factory()->create([
            'seller_id' => $vendor->id,
            'category_id' => $category->id,
            'mode' => 'enchere',
            'prix_vente' => 100,
            'prix_actuel' => 100,
            'date_expiration' => now()->addDays(7),
        ]);

        $response = $this->actingAs($bidder)->postJson("/api/listings/{$listing->id}/bids", [
            'montant' => 2000, // abnormal jump (>50%)
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('bids', [
            'listing_id' => $listing->id,
            'bidder_id' => $bidder->id,
            'suspect' => true,
            'motif_suspect' => 'prix_anormal',
        ]);
    }
}