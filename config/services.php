<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Gateway
    |--------------------------------------------------------------------------
    | Driver: 'wallet' (default, simulated) | 'cmi' (CMI/Mastercard - dev sandbox).
    | Configure real credentials in production.
    */
    'payment' => [
        'driver' => env('PAYMENT_DRIVER', 'wallet'),
        'cmi' => [
            'base_url' => env('CMI_BASE_URL', 'https://testpayment.cmi.co.ma/fim/est3Dgate'),
            'merchant_id' => env('CMI_MERCHANT_ID'),
            'store_key' => env('CMI_STORE_KEY'),
            'success_url' => env('CMI_SUCCESS_URL', '/portefeuille'),
            'fail_url' => env('CMI_FAIL_URL', '/portefeuille/recharger'),
        ],
    ],

];
