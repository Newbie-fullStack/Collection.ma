<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\Order;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewModerationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(['CategorySeeder', 'SiteSettingsSeeder']);
    }

    private function createOrder(User $buyer, User $seller): Order
    {
        $category = Category::first();
        $listing = Listing::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
        ]);

        return Order::factory()->create([
            'listing_id' => $listing->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'statut' => 'vire_vendeur',
        ]);
    }

    public function test_seller_can_reply_to_review(): void
    {
        $buyer = User::factory()->create();
        $seller = User::factory()->create();
        $order = $this->createOrder($buyer, $seller);

        $review = Review::create([
            'order_id' => $order->id,
            'reviewer_id' => $buyer->id,
            'reviewed_id' => $seller->id,
            'note' => 5,
            'commentaire' => 'Parfait',
        ]);

        $this->actingAs($seller)->postJson("/api/reviews/{$review->id}/reply", [
            'reponse_vendeur_texte' => 'Merci beaucoup !',
        ])->assertOk();

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'reponse_vendeur' => true,
            'reponse_vendeur_texte' => 'Merci beaucoup !',
        ]);
    }

    public function test_only_reviewed_user_can_reply(): void
    {
        $buyer = User::factory()->create();
        $seller = User::factory()->create();
        $order = $this->createOrder($buyer, $seller);

        $review = Review::create([
            'order_id' => $order->id,
            'reviewer_id' => $buyer->id,
            'reviewed_id' => $seller->id,
            'note' => 4,
        ]);

        $stranger = User::factory()->create();
        $this->actingAs($stranger)->postJson("/api/reviews/{$review->id}/reply", [
            'reponse_vendeur_texte' => 'intrusion',
        ])->assertStatus(403);
    }

    public function test_flag_and_admin_hide_review(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create();
        $seller = User::factory()->create();
        $order = $this->createOrder($buyer, $seller);

        $review = Review::create([
            'order_id' => $order->id,
            'reviewer_id' => $buyer->id,
            'reviewed_id' => $seller->id,
            'note' => 1,
            'commentaire' => 'Contenu inapproprié',
        ]);

        // Buyer flags it.
        $this->actingAs($buyer)->postJson("/api/reviews/{$review->id}/flag")->assertOk();

// Admin hides it.
        $this->actingAs($admin)->postJson("/api/admin/reviews/{$review->id}/moderate", [
            'action' => 'masquer',
        ])->assertOk();

        $review->refresh();
        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'masquee' => 1, 'moderation' => 'validee']);
        $this->assertTrue($review->masquee);
        $this->assertFalse($review->signalee);

        // Hidden review is excluded from the seller's public list.
        $public = $this->actingAs($seller)->getJson('/api/reviews');
        $this->assertEmpty($public->json('data') ?? []);
    }
}