<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BidController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\DisputeController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OfferController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SavedSearchController;
use App\Http\Controllers\Api\VendorApplicationController;
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
Route::get('/vendeurs/{userId}', [ListingController::class, 'sellerProfile']);

// --- Authenticated Routes ---
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword']);
    Route::delete('/auth/account', [AuthController::class, 'deleteAccount']);

    // Listings (seller) — seller-only management
    Route::middleware('vendeur')->group(function () {
        Route::post('/listings', [ListingController::class, 'store']);
        Route::put('/listings/{listing}', [ListingController::class, 'update']);
        Route::delete('/listings/{listing}', [ListingController::class, 'destroy']);
        Route::get('/my-listings', [ListingController::class, 'myListings']);
    });

    // Bids
    Route::get('/listings/{listing}/bids', [BidController::class, 'index']);
    Route::post('/listings/{listing}/bids', [BidController::class, 'store']);
    Route::get('/my-bids', [BidController::class, 'myBids']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders/{order}/confirm', [OrderController::class, 'confirmReception']);

    // Wallet (common)
    Route::get('/wallet', [WalletController::class, 'index']);
    Route::get('/wallet/transactions', [WalletController::class, 'transactions']);
    Route::post('/wallet/topup', [WalletController::class, 'topup']);

    // Vendor applications (KYC)
    Route::post('/vendor-applications', [VendorApplicationController::class, 'store']);
    Route::get('/vendor-applications/me', [VendorApplicationController::class, 'me']);
    Route::get('/vendor-applications/contract', [VendorApplicationController::class, 'contract']);
    Route::post('/vendor-applications/{vendorApplication}/resubmit', [VendorApplicationController::class, 'resubmit']);

    // Seller-only routes
    Route::middleware('vendeur')->group(function () {
        Route::get('/seller-orders', [OrderController::class, 'sellerOrders']);
        Route::post('/orders/{order}/ship', [OrderController::class, 'ship']);
        Route::get('/recent-sales', [OrderController::class, 'recentSales']);
        Route::get('/seller-invoices', [OrderController::class, 'sellerInvoices']);
        Route::get('/seller-stats', [OrderController::class, 'sellerStats']);
        Route::get('/my-listing-bids', [BidController::class, 'myListingBids']);
        Route::get('/seller-offers', [OfferController::class, 'sellerOffers']);
        Route::post('/offers/{offer}/accept', [OfferController::class, 'accept']);
        Route::post('/offers/{offer}/reject', [OfferController::class, 'reject']);
        Route::post('/wallet/withdraw', [WalletController::class, 'requestWithdrawal']);
        Route::get('/wallet/withdrawals', [WalletController::class, 'withdrawals']);
    });

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/toggle', [FavoriteController::class, 'toggle']);
    Route::get('/favorites/folders', [FavoriteController::class, 'folders']);
    Route::post('/favorites/folders', [FavoriteController::class, 'storeFolder']);
    Route::delete('/favorites/folders/{folder}', [FavoriteController::class, 'destroyFolder']);

    // Offers (buyer makes an offer on achat_immediat)
    Route::post('/listings/{listing}/offers', [OfferController::class, 'store']);
    Route::get('/my-offers', [OfferController::class, 'myOffers']);
    Route::post('/offers/{offer}/cancel', [OfferController::class, 'cancel']);

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
    Route::post('/reviews/{review}/reply', [ReviewController::class, 'reply']);
    Route::post('/reviews/{review}/flag', [ReviewController::class, 'flag']);

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
        Route::get('/analytics', [AdminController::class, 'analytics']);

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

        // Review moderation
        Route::get('/reviews', [ReviewController::class, 'adminIndex']);
        Route::post('/reviews/{review}/moderate', [ReviewController::class, 'administer']);

        // Vendor applications validation (KYC)
        Route::get('/vendor-applications', [VendorApplicationController::class, 'adminIndex']);
        Route::get('/vendor-applications/{vendorApplication}', [VendorApplicationController::class, 'adminShow']);
        Route::get('/vendor-applications/{vendorApplication}/document/{type}', [VendorApplicationController::class, 'adminDocument']);
        Route::get('/vendor-applications/{vendorApplication}/contract-download', [VendorApplicationController::class, 'adminContractDownload']);
        Route::post('/vendor-applications/{vendorApplication}/approve', [VendorApplicationController::class, 'approve']);
        Route::post('/vendor-applications/{vendorApplication}/reject', [VendorApplicationController::class, 'reject']);
        Route::post('/vendor-applications/{vendorApplication}/request-complement', [VendorApplicationController::class, 'requestComplement']);
    });
});
