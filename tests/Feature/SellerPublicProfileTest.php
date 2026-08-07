<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SellerPublicProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(['CategorySeeder', 'SiteSettingsSeeder']);
    }

    public function test_public_seller_profile_returns_seller_and_active_listings(): void
    {
        $seller = User::factory()->create([
            'role' => 'vendeur',
            'pseudo' => 'CoinHunter',
            'statut_kyc' => 'verifie',
            'vendeur_verifie_le' => now(),
        ]);
        $category = Category::first();

        Listing::factory()->count(3)->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'statut' => 'active',
        ]);
        // Inactive listing should not be shown.
        Listing::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'statut' => 'brouillon',
        ]);

        $response = $this->getJson("/api/vendeurs/{$seller->id}");

        $response->assertOk();
        $response->assertJsonPath('vendeur.pseudo', 'CoinHunter');
        $response->assertJsonPath('vendeur.est_verifie', true);
        $this->assertCount(3, $response->json('listings.data'));
    }

    public function test_public_seller_profile_requires_vendeur_role(): void
    {
        $buyer = User::factory()->create(['role' => 'acheteur']);

        $this->getJson("/api/vendeurs/{$buyer->id}")->assertStatus(404);
    }
}