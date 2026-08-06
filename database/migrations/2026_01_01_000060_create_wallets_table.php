<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('solde', 14, 2)->default(0);
            $table->decimal('solde_disponible', 14, 2)->default(0); // Available for withdrawal
            $table->decimal('solde_en_attente', 14, 2)->default(0); // In escrow
            $table->string('devise', 3)->default('MAD');
            $table->timestamps();

            $table->unique('user_id');
        });

        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->enum('type', [
                'depot',
                'encaissement',
                'commission',
                'virement_vendeur',
                'remboursement',
                'retrait',
            ]);
            $table->decimal('montant', 14, 2); // Positive = credit, negative = debit
            $table->string('devise', 3)->default('MAD');
            $table->text('description');
            $table->string('reference')->nullable(); // External reference
            $table->enum('statut', ['en_attente', 'complete', 'echouee'])->default('en_attente');
            $table->timestamps();

            $table->index('wallet_id');
            $table->index('type');
            $table->index('statut');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
    }
};
