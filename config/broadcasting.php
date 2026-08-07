<?php

return [

    'default' => env('BROADCAST_CONNECTION', 'reverb'),

    'connections' => [

        'reverb' => [
            'driver' => 'reverb',
            'app_id' => env('REVERB_APP_ID', 'marketplace-app'),
            'app_key' => env('REVERB_APP_KEY', 'dummy-key'),
            'app_secret' => env('REVERB_APP_SECRET', 'dummy-secret'),
            'host' => env('REVERB_HOST', 'localhost'),
            'port' => env('REVERB_PORT', 443),
            'scheme' => env('REVERB_SCHEME', 'https'),
            'use_tls' => env('REVERB_SCHEME', 'https') === 'https',
        ],

    ],

];
