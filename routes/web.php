<?php

use App\Http\Controllers\LlmsController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// SEO: LLM-friendly site description & sitemap for AI crawlers.
Route::get('/llms.txt', [LlmsController::class, 'index']);
Route::get('/llms-full.txt', [LlmsController::class, 'full']);
