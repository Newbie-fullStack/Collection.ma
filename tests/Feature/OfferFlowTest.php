<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\Offer;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OfferFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(['CategorySeeder', 'SiteSettingsSeeder']);
    }

    private function makeListing(User $seller, float $prix = 299): Listing
    {
        return Listing::create([
            'numero_auto' => 'COL-T-'.str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT),
            'seller_id' => $seller->id,
            'category_id' => 1,
            'titre' => 'Panchat de collection',
            'description' => 'Description',
            'prix_vente' => $prix,
            'frais_port' => 20,
            'total' => $prix + 20,
            'mode' => 'achat_immediat',
            'statut' => 'active',
            'date_publication' => now(),
            'date_expiration' => now()->addDays(28),
        ]);
    }

    public function test_buyer_can_make_an_offer(): void
    {
        $seller = User::factory()->create(['role' => 'vendeur']);
        $buyer = User::factory()->create(['role' => 'acheteur']);
        $listing = $this->makeListing($seller);

        $response = $this->actingAs($buyer)->postJson("/api/listings/{$listing->id}/offers", [
            'montant' => 250,
            'message' => 'Je propose 250 DH',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('offers', [
            'listing_id' => $listing->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'montant' => 250,
            'statut' => 'en_attente',
        ]);
    }

    public function test_offer_cannot_exceed_listing_price(): void
    {
        $seller = User::factory()->create(['role' => 'vendeur']);
        $buyer = User::factory()->create(['role' => 'acheteur']);
        $listing = $this->makeListing($seller);

        $response = $this->actingAs($buyer)->postJson("/api/listings/{$listing->id}/offers", [
            'montant' => 9999,
        ]);

        $response->assertStatus(422);
    }

    public function test_seller_accepts_offer_creates_order_and_charges_wallet(): void
    {
        $seller = User::factory()->create(['role' => 'vendeur']);
        $buyer = User::factory()->create(['role' => 'acheteur']);
        $wallet = Wallet::create(['user_id' => $buyer->id, 'solde' => 500, 'solde_disponible' => 500, 'solde_en_attente' => 0]);
        $listing = $this->makeListing($seller, 299);

        $offer = Offer::create([
            'listing_id' => $listing->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'montant' => 250,
            'statut' => Offer::STATUT_EN_ATTENTE,
        ]);

        $response = $this->actingAs($seller)->postJson("/api/offers/{$offer->id}/accept");

        $response->assertStatus(200);
        $this->assertDatabaseHas('orders', ['listing_id' => $listing->id, 'buyer_id' => $buyer->id, 'seller_id' => $seller->id, 'prix' => 250]);
        $this->assertDatabaseHas('offers', ['id' => $offer->id, 'statut' => 'acceptee']);
        $this->assertDatabaseHas('listings', ['id' => $listing->id, 'statut' => 'vendue']);

        $this->assertSame(500.0, (float) $wallet->fresh()->solde_disponible + (250 + 20));
    }

    public function test_seller_can_reject_offer(): void
    {
        $seller = User::factory()->create(['role' => 'vendeur']);
        $buyer = User::factory()->create(['role' => 'acheteur']);
        $listing = $this->makeListing($seller);

        $offer = Offer::create([
            'listing_id' => $listing->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'montant' => 200,
            'statut' => Offer::STATUT_EN_ATTENTE,
        ]);

        $response = $this->actingAs($seller)->postJson("/api/offers/{$offer->id}/reject");

        $response->assertStatus(200);
        $this->assertDatabaseHas('offers', ['id' => $offer->id, 'statut' => 'refusee']);
    }

    public function test_only_seller_can_accept_offer(): void
    {
        $seller = User::factory()->create(['role' => 'vendeur']);
        $buyer = User::factory()->create(['role' => 'acheteur']);
        $stranger = User::factory()->create(['role' => 'vendeur']);
        $listing = $this->makeListing($seller);

        $offer = Offer::create([
            'listing_id' => $listing->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'montant' => 200,
            'statut' => Offer::STATUT_EN_ATTENTE,
        ]);

        $response = $this->actingAs($stranger)->postJson("/api/offers/{$offer->id}/accept");

        $response->assertStatus(403);
    }
}