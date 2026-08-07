<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Favorite;
use App\Models\FavoriteFolder;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FavoriteFolderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(['CategorySeeder', 'SiteSettingsSeeder']);
    }

    public function test_create_and_list_folders(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/favorites/folders', [
            'nom' => 'Mes montres',
        ])->assertStatus(201);

        $response = $this->actingAs($user)->getJson('/api/favorites/folders');
        $response->assertStatus(200);
        $response->assertJsonFragment(['nom' => 'Mes montres']);
    }

    public function test_favorite_can_be_placed_in_folder(): void
    {
        $user = User::factory()->create();
        $category = Category::first();
        $listing = Listing::factory()->create(['category_id' => $category->id]);
        $folder = FavoriteFolder::create(['user_id' => $user->id, 'nom' => 'Collection 2026']);

        $this->actingAs($user)->postJson('/api/favorites/toggle', [
            'listing_id' => $listing->id,
            'folder_id' => $folder->id,
        ])->assertJson(['favori' => true]);

        $this->assertDatabaseHas('favorites', [
            'user_id' => $user->id,
            'listing_id' => $listing->id,
            'folder_id' => $folder->id,
        ]);
    }

    public function test_deleting_folder_keeps_favorites_uncategorized(): void
    {
        $user = User::factory()->create();
        $category = Category::first();
        $listing = Listing::factory()->create(['category_id' => $category->id]);
        $folder = FavoriteFolder::create(['user_id' => $user->id, 'nom' => 'À trier']);

        Favorite::create([
            'user_id' => $user->id,
            'listing_id' => $listing->id,
            'folder_id' => $folder->id,
        ]);

        $this->actingAs($user)->deleteJson("/api/favorites/folders/{$folder->id}")
            ->assertOk();

        $this->assertDatabaseMissing('favorite_folders', ['id' => $folder->id]);
        $this->assertDatabaseHas('favorites', [
            'listing_id' => $listing->id,
            'folder_id' => null,
        ]);
    }

    public function test_cannot_delete_foreign_folder(): void
    {
        $owner = User::factory()->create();
        $folder = FavoriteFolder::create(['user_id' => $owner->id, 'nom' => 'Privé']);

        $intruder = User::factory()->create();
        $this->actingAs($intruder)->deleteJson("/api/favorites/folders/{$folder->id}")
            ->assertStatus(403);
    }
}