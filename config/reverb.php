<?php

use Laravel\Reverb\Http\Middleware\ApproveApps;
use Laravel\Reverb\Http\Middleware\Authenticate;

return [

    'apps' => [
        [
            'id' => env('REVERB_APP_ID', 'marketplace-app'),
            'name' => env('APP_NAME', 'Collection.ma'),
            'key' => env('REVERB_APP_KEY'),
            'secret' => env('REVERB_APP_SECRET'),
            'path' => env('REVERB_APP_PATH', ''),
            'allowed_origins' => [
                env('FRONTEND_URL', 'http://localhost:5173'),
                env('APP_URL', 'http://localhost:8000'),
            ],
            'allowed_origins_patterns' => [],
            'ping_interval' => 60,
            'max_message_size' => 1000000,
        ],
    ],

    'batching' => [
        'database' => [
            'connection' => env('REVERB_BATCHING_DB_CONNECTION'),
            'table' => 'reverb_batching',
        ],
    ],

    'tls' => [
        'port' => env('REVERB_TLS_PORT', 443),
    ],

    'path' => env('REVERB_PATH', ''),

    'middleware' => [
        'api' => [
            ApproveApps::class,
            Authenticate::class,
        ],
    ],

];
