<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LlmsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(['CategorySeeder', 'SiteSettingsSeeder']);
    }

    public function test_llms_txt_returns_marketplace_overview(): void
    {
        $response = $this->get('/llms.txt');

        $response->assertOk();
        $this->assertStringContainsString('# collection.ma', $response->getContent());
        $this->assertStringContainsString('/listings', $response->getContent());
        $this->assertStringContainsString('text/plain', $response->headers->get('Content-Type'));
    }

    public function test_llms_full_txt_includes_categories_and_listings(): void
    {
        $category = Category::first();
        $seller = User::factory()->create();
        Listing::factory()->create([
            'category_id' => $category->id,
            'seller_id' => $seller->id,
            'titre' => 'Montre vintage 1970',
            'statut' => 'active',
        ]);

        $response = $this->get('/llms-full.txt');

        $response->assertOk();
        $content = $response->getContent();
        $this->assertStringContainsString($category->nom_fr, $content);
        $this->assertStringContainsString('Montre vintage 1970', $content);
    }
}