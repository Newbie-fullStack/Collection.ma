<?php

namespace Tests\Feature;

use App\Jobs\PublishScheduledListings;
use App\Mail\AppNotificationMail;
use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ScheduledPublishTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(['CategorySeeder', 'SiteSettingsSeeder']);
    }

    public function test_job_publishes_due_scheduled_listings(): void
    {
        Mail::fake();

        $seller = User::factory()->create();
        $category = Category::first();

        // In the past → should be published
        $due = Listing::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'statut' => 'brouillon',
            'date_publication' => null,
            'date_expiration' => null,
            'date_publication_planifiee' => now()->subHour(),
        ]);

        // In the future → should stay a draft
        $future = Listing::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'statut' => 'brouillon',
            'date_publication' => null,
            'date_expiration' => null,
            'date_publication_planifiee' => now()->addDays(2),
        ]);

        (new PublishScheduledListings())->handle();

        $this->assertDatabaseHas('listings', [
            'id' => $due->id,
            'statut' => 'active',
        ]);
        $this->assertNotNull($due->fresh()->date_publication);
        $this->assertNull($due->fresh()->date_publication_planifiee);

        $this->assertDatabaseHas('listings', [
            'id' => $future->id,
            'statut' => 'brouillon',
        ]);

        Mail::assertQueued(AppNotificationMail::class, 1);
    }
}