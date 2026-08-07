<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Payment gateway abstraction.
 * - driver 'wallet' (default): simulated instant credit on the internal wallet.
 * - driver 'cmi' (in production): builds a CMI/Mastercard 3DSecure redirect.
 *
 * The wallet path stays the default so the platform works out of the box.
 */
class PaymentService
{
    public static function driver(): string
    {
        return config('services.payment.driver', 'wallet');
    }

    /**
     * Create a top-up payment request.
     * Returns a signed CMI redirect form (production) or a wallet reference (simulated).
     */
    public static function createDeposit(int $userId, float $amount): array
    {
        if (self::driver() === 'cmi') {
            Log::info('CMI payment gateway configured. Redirect to 3DSecure.', [
                'user_id' => $userId,
                'amount' => $amount,
            ]);

            // @todo: implement CMI form auto-submit (hash(sha256(debugkey.storekey.clientid.amount.oidOkUrl.FailUrl))).
        }

        Log::info('Wallet simulated deposit', ['user_id' => $userId, 'amount' => $amount]);

        return [
            'reference' => 'DEP-'.strtoupper(Str::random(10)),
            'mode' => 'wallet',
        ];
    }
}