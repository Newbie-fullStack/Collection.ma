<?php

namespace App\Services;

use App\Mail\AppNotificationMail;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NotificationsService
{
    /**
     * Persist an in-app notification AND send a transactional email.
     * Email language follows the user's preferred language.
     */
    public static function notify(
        User|int $user,
        string $type,
        string $title,
        string $titleAr,
        string $message,
        string $messageAr,
        ?string $link = null,
        array $data = [],
    ): Notification {
        $userId = is_int($user) ? $user : $user->id;

        $notification = Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'title_ar' => $titleAr,
            'message' => $message,
            'message_ar' => $messageAr,
            'link' => $link,
            'data' => $data ?: null,
        ]);

        static::sendEmail($userId, $title, $titleAr, $message, $messageAr, $link);

        return $notification;
    }

    /**
     * Send the email copy in the user's preferred language, if a mailer is configured.
     */
    public static function sendEmail(
        int $userId,
        string $title,
        string $titleAr,
        string $message,
        string $messageAr,
        ?string $link = null,
    ): void {
        $user = User::find($userId);
        if (! $user || ! $user->email) {
            return;
        }

        $isAr = $user->langue_preferee === 'ar';
        Mail::to($user->email)
            ->queue(new AppNotificationMail(
                user: $user,
                title: $isAr ? $titleAr : $title,
                body: $isAr ? $messageAr : $message,
                link: $link ? url($link) : null,
            ));
    }
}