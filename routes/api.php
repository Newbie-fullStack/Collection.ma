<?php

use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BidController;
use App\Http\Controllers\Api\DisputeController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SavedSearchController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Support\Facades\Route;

// --- Public Routes ---
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Public listing browse
Route::get('/listings', [ListingController::class, 'index']);
Route::get('/listings/{listing}', [ListingController::class, 'show']);
Route::get('/categories', [ListingController::class, 'categories']);

// --- Authenticated Routes ---
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword']);
    Route::delete('/auth/account', [AuthController::class, 'deleteAccount']);

    // Listings (seller)
    Route::post('/listings', [ListingController::class, 'store']);
    Route::put('/listings/{listing}', [ListingController::class, 'update']);
    Route::delete('/listings/{listing}', [ListingController::class, 'destroy']);
    Route::get('/my-listings', [ListingController::class, 'myListings']);

    // Bids
    Route::get('/listings/{listing}/bids', [BidController::class, 'index']);
    Route::post('/listings/{listing}/bids', [BidController::class, 'store']);
    Route::get('/my-bids', [BidController::class, 'myBids']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/seller-orders', [OrderController::class, 'sellerOrders']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders/{order}/ship', [OrderController::class, 'ship']);
    Route::post('/orders/{order}/confirm', [OrderController::class, 'confirmReception']);
    Route::get('/recent-sales', [OrderController::class, 'recentSales']);

    // Seller invoices
    Route::get('/seller-invoices', [OrderController::class, 'sellerInvoices']);

    // Seller stats
    Route::get('/seller-stats', [OrderController::class, 'sellerStats']);

    // Wallet
    Route::get('/wallet', [WalletController::class, 'index']);
    Route::get('/wallet/transactions', [WalletController::class, 'transactions']);
    Route::post('/wallet/topup', [WalletController::class, 'topup']);
    Route::post('/wallet/withdraw', [WalletController::class, 'requestWithdrawal']);
    Route::get('/wallet/withdrawals', [WalletController::class, 'withdrawals']);

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/toggle', [FavoriteController::class, 'toggle']);

    // Messages (to admin only)
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);

    // Conversations (buyer-seller messaging)
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/conversations/unread-count', [ConversationController::class, 'unreadCount']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{conversation}/messages', [ConversationController::class, 'messages']);
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);
    Route::put('/conversations/{conversation}/read', [ConversationController::class, 'markAsRead']);

    // Reviews
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Disputes
    Route::get('/disputes', [DisputeController::class, 'index']);
    Route::post('/disputes', [DisputeController::class, 'store']);
    Route::get('/disputes/{dispute}', [DisputeController::class, 'show']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Saved searches
    Route::get('/saved-searches', [SavedSearchController::class, 'index']);
    Route::post('/saved-searches', [SavedSearchController::class, 'store']);
    Route::put('/saved-searches/{savedSearch}', [SavedSearchController::class, 'update']);
    Route::delete('/saved-searches/{savedSearch}', [SavedSearchController::class, 'destroy']);

    // --- Admin Routes ---
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);

        // Users
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus']);
        Route::post('/users/{user}/suspend', [AdminController::class, 'suspendUser']);

        // Listings
        Route::get('/listings', [AdminController::class, 'listings']);
        Route::post('/listings/{listing}/approve', [AdminController::class, 'approveListing']);
        Route::post('/listings/{listing}/suspend', [AdminController::class, 'suspendListing']);

        // Categories
        Route::get('/categories', [AdminController::class, 'categories']);
        Route::put('/categories/{category}', [AdminController::class, 'updateCategory']);

        // Advertisements
        Route::get('/advertisements', [AdminController::class, 'advertisements']);
        Route::post('/advertisements', [AdminController::class, 'storeAdvertisement']);

        // Commissions
        Route::get('/commissions', [AdminController::class, 'commissions']);
        Route::put('/commissions', [AdminController::class, 'updateCommission']);

        // Disputes
        Route::get('/disputes', [AdminController::class, 'disputes']);
        Route::post('/disputes/{dispute}/resolve', [AdminController::class, 'resolveDispute']);

        // Invoices
        Route::get('/invoices', [AdminController::class, 'invoices']);

        // Messages
        Route::get('/messages', [MessageController::class, 'adminMessages']);
        Route::put('/messages/{message}/read', [MessageController::class, 'markAsRead']);
    });
});
