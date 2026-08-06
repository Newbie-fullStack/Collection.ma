<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('numero_commande', 50)->unique(); // ORD-2026-000123
            $table->foreignId('listing_id')->constrained('listings')->restrictOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('seller_id')->constrained('users')->restrictOnDelete();
            $table->decimal('prix', 12, 2);
            $table->decimal('frais_port', 10, 2)->default(0);
            $table->decimal('commission_montant', 12, 2); // 5% calculated via EscrowService
            $table->decimal('commission_taux', 5, 2)->default(5.00); // Configurable rate snapshot
            $table->decimal('total', 12, 2);
            $table->enum('statut', [
                'attente_paiement',
                'sequestre',
                'expedie',
                'livre_confirme',
                'litige',
                'rembourse',
                'vire_vendeur',
            ])->default('attente_paiement');
            $table->string('tracking_number')->nullable();
            $table->string('transporteur')->nullable();
            $table->timestamp('date_expedition')->nullable();
            $table->timestamp('date_confirmation_limite')->nullable(); // +10 business days from expedition
            $table->timestamp('date_confirmation')->nullable();
            $table->timestamp('date_virement')->nullable();
            $table->timestamps();

            $table->index('listing_id');
            $table->index('buyer_id');
            $table->index('seller_id');
            $table->index('statut');
            $table->index(['statut', 'date_confirmation_limite']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
