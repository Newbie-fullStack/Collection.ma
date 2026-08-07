<?php

namespace Tests\Feature;

use App\Events\NewConversationMessage;
use App\Models\Category;
use App\Models\Conversation;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ConversationMessagingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(['CategorySeeder', 'SiteSettingsSeeder']);
    }

    private function authUser(User $user): void
    {
        $this->actingAs($user);
    }

    public function test_send_message_with_attachment_is_broadcast(): void
    {
        Event::fake([NewConversationMessage::class]);

        $buyer = User::factory()->create();
        $seller = User::factory()->create();
        $category = Category::first();
        $listing = Listing::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
        ]);
        $conversation = Conversation::findOrCreate($buyer->id, $seller->id, $listing->id);

        $this->authUser($buyer);

        $response = $this->postJson("/api/conversations/{$conversation->id}/messages", [
            'contenu' => 'Bonjour, ce fichier ?',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $buyer->id,
            'contenu' => 'Bonjour, ce fichier ?',
        ]);

        Event::assertDispatched(NewConversationMessage::class);
    }

    public function test_cannot_send_in_foreign_conversation(): void
    {
        $a = User::factory()->create();
        $b = User::factory()->create();
        $conversation = Conversation::findOrCreate($a->id, $b->id);

        $intruder = User::factory()->create();
        $this->authUser($intruder);

        $this->postJson("/api/conversations/{$conversation->id}/messages", [
            'contenu' => 'tentative',
        ])->assertStatus(403);
    }

    public function test_message_requires_text_or_file(): void
    {
        $buyer = User::factory()->create();
        $seller = User::factory()->create();
        $conversation = Conversation::findOrCreate($buyer->id, $seller->id);

        $this->authUser($buyer);

        $this->postJson("/api/conversations/{$conversation->id}/messages", [
            'contenu' => '',
        ])->assertStatus(422);
    }
}