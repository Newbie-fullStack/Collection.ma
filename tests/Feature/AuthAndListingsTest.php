<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthAndListingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(['CategorySeeder', 'SiteSettingsSeeder']);
    }

    public function test_can_register_a_new_user(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'pseudo' => 'testuser',
            'nom' => 'Test',
            'prenom' => 'User',
            'age' => 25,
            'gsm' => '0612345678',
            'email' => 'test@example.com',
            'adresse_exacte' => '123 Rue Test, Casablanca',
            'rib' => 'MA640070700000000000000503',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'langue_preferee' => 'fr',
            'cgu_acceptee' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => ['id', 'pseudo', 'email', 'role'],
                'token',
            ]);

        $this->assertDatabaseHas('users', ['pseudo' => 'testuser', 'email' => 'test@example.com']);
        $this->assertDatabaseHas('wallets', ['user_id' => $response->json('user.id')]);
    }

    public function test_rejects_registration_with_invalid_age(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'pseudo' => 'younguser',
            'nom' => 'Young',
            'prenom' => 'User',
            'age' => 15,
            'gsm' => '0612345678',
            'email' => 'young@example.com',
            'adresse_exacte' => '123 Rue Test',
            'rib' => 'MA640070700000000000000503',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'cgu_acceptee' => true,
        ]);

        $response->assertStatus(422);
    }

    public function test_can_login_and_logout(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'login@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['user', 'token']);

        $token = $response->json('token');

        $logoutResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout');

        $logoutResponse->assertOk();
    }

    public function test_returns_401_for_invalid_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }

    public function test_can_create_a_listing(): void
    {
        $user = User::factory()->create(['role' => 'both']);

        $response = $this->actingAs($user)
            ->postJson('/api/listings', [
                'titre' => "Pièce d'argent marocaine",
                'description' => "Magnifique pièce d'argent",
                'category_id' => 1,
                'mode' => 'enchere',
                'prix_vente' => 500,
                'frais_port' => 30,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id', 'numero_auto', 'titre', 'mode', 'statut',
            ]);

        $this->assertDatabaseHas('listings', [
            'titre' => "Pièce d'argent marocaine",
            'statut' => 'active',
        ]);
    }

    public function test_generates_correct_numero_auto_format(): void
    {
        $user = User::factory()->create(['role' => 'both']);

        $response = $this->actingAs($user)
            ->postJson('/api/listings', [
                'titre' => 'Test numero',
                'description' => 'Description test',
                'category_id' => 1,
                'mode' => 'achat_immediat',
                'prix_vente' => 100,
            ]);

        $response->assertStatus(201);
        $numero = $response->json('numero_auto');
        $this->assertMatchesRegularExpression('/^COL-\d{4}-\d{6}$/', $numero);
    }

    public function test_can_place_bid_on_auction_listing(): void
    {
        $seller = User::factory()->create(['role' => 'both']);
        $bidder = User::factory()->create(['role' => 'both']);

        $listing = Listing::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => 1,
            'mode' => 'enchere',
            'prix_vente' => 100,
            'prix_actuel' => 100,
            'statut' => 'active',
            'date_expiration' => now()->addDays(7),
        ]);

        $response = $this->actingAs($bidder)
            ->postJson("/api/listings/{$listing->id}/bids", [
                'montant' => 150,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'montant', 'statut']);

        $this->assertDatabaseHas('bids', [
            'listing_id' => $listing->id,
            'bidder_id' => $bidder->id,
            'montant' => 150,
        ]);
    }

    public function test_rejects_bid_lower_than_current_price(): void
    {
        $seller = User::factory()->create(['role' => 'both']);
        $bidder = User::factory()->create(['role' => 'both']);

        $listing = Listing::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => 1,
            'mode' => 'enchere',
            'prix_vente' => 100,
            'prix_actuel' => 150,
            'statut' => 'active',
            'date_expiration' => now()->addDays(7),
        ]);

        $response = $this->actingAs($bidder)
            ->postJson("/api/listings/{$listing->id}/bids", [
                'montant' => 100,
            ]);

        $response->assertStatus(422);
    }

    public function test_prevents_seller_from_bidding_on_own_listing(): void
    {
        $seller = User::factory()->create(['role' => 'both']);

        $listing = Listing::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => 1,
            'mode' => 'enchere',
            'prix_vente' => 100,
            'prix_actuel' => 100,
            'statut' => 'active',
            'date_expiration' => now()->addDays(7),
        ]);

        $response = $this->actingAs($seller)
            ->postJson("/api/listings/{$listing->id}/bids", [
                'montant' => 200,
            ]);

        $response->assertStatus(422);
    }
}
