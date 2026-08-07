<?php

namespace Tests\Feature;

use App\Mail\AppNotificationMail;
use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NotificationsServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(['CategorySeeder', 'SiteSettingsSeeder']);
    }

    public function test_notify_persists_in_app_notification(): void
    {
        Mail::fake();

        $user = User::factory()->create(['langue_preferee' => 'fr']);

        $notification = NotificationsService::notify(
            $user,
            'bid_placed',
            'Nouvelle enchère',
            'licitе جديدة',
            'Un acheteur a enchéri',
            'مشترٍ قدّم عرضًا',
            '/listings/COL-2026-000001'
        );

        $this->assertInstanceOf(Notification::class, $notification);
        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'user_id' => $user->id,
            'type' => 'bid_placed',
            'read' => false,
        ]);
    }

    public function test_email_is_queued_in_users_preferred_language(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'langue_preferee' => 'ar',
            'email' => 'vendeur@example.com',
        ]);

        NotificationsService::notify(
            $user,
            'auction_won',
            'Enchère gagnée',
            'مزاد مكتمل',
            'Félicitations',
            'تهانينا',
            '/listings/COL-2026-000002'
        );

        Mail::assertQueued(AppNotificationMail::class, function ($mail) use ($user) {
            return $mail->title === 'مزاد مكتمل'
                && $mail->body === 'تهانينا'
                && $mail->user->is($user);
        });
    }
}