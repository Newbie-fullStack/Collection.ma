<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained('listings')->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('seller_id')->constrained('users')->restrictOnDelete();
            $table->decimal('montant', 12, 2);
            $table->text('message')->nullable();
            $table->enum('statut', ['en_attente', 'acceptee', 'refusee', 'annulee'])->default('en_attente');
            $table->timestamp('date_traitement')->nullable();
            $table->timestamps();

            $table->index(['listing_id', 'statut']);
            $table->index('buyer_id');
            $table->index('seller_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};