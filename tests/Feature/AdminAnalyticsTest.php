<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(['CategorySeeder', 'SiteSettingsSeeder']);
    }

    public function test_analytics_requires_admin(): void
    {
        $user = User::factory()->create(['role' => 'acheteur']);

        $this->actingAs($user)->getJson('/api/admin/analytics')->assertStatus(403);
    }

    public function test_analytics_returns_time_series_and_breakdowns(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::first();

        $seller = User::factory()->create(['role' => 'vendeur', 'pseudo' => 'VendeurTest']);
        $buyer = User::factory()->create();

        $listing = Listing::factory()->create([
            'category_id' => $category->id,
            'seller_id' => $seller->id,
        ]);

        Order::factory()->create([
            'listing_id' => $listing->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'total' => 1000,
            'commission_montant' => 50,
            'statut' => 'vire_vendeur',
            'created_at' => now()->subDays(3),
        ]);

        Order::factory()->create([
            'listing_id' => $listing->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'total' => 500,
            'commission_montant' => 25,
            'statut' => 'vire_vendeur',
            'created_at' => now()->subDays(1),
        ]);

        $response = $this->actingAs($admin)->getJson('/api/admin/analytics?period=30d');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'periode',
            'series',
            'par_categorie',
            'top_vendeurs',
        ]);

        $this->assertCount(2, $response->json('series'));
        $this->assertNotEmpty($response->json('par_categorie'));
        $this->assertSame('VendeurTest', $response->json('top_vendeurs.0.pseudo'));
    }
}