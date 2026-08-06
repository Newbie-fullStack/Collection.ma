<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bids', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained('listings')->cascadeOnDelete();
            $table->foreignId('bidder_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('montant', 12, 2);
            $table->decimal('auto_bid_max', 12, 2)->nullable();
            $table->boolean('is_auto_bid')->default(false);
            $table->enum('statut', ['active', 'gagnee', 'perdue', 'annulee'])->default('active');
            $table->timestamps();

            $table->index('listing_id');
            $table->index('bidder_id');
            $table->index(['listing_id', 'montant']);
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bids');
    }
};
