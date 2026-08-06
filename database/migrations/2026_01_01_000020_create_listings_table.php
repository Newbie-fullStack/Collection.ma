<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->string('numero_auto', 50)->unique(); // COL-2026-000123
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('titre', 300);
            $table->longText('description');
            $table->decimal('prix_vente', 12, 2)->nullable(); // For achat_immediat or reserve price
            $table->decimal('frais_port', 10, 2)->default(0);
            $table->decimal('total', 12, 2)->nullable(); // prix_vente + frais_port (computed)
            $table->enum('mode', ['enchere', 'achat_immediat']);
            $table->enum('statut', ['brouillon', 'active', 'vendue', 'expiree', 'suspendue'])->default('brouillon');
            $table->decimal('prix_actuel', 12, 2)->nullable(); // Current bid price for auctions
            $table->timestamp('date_publication')->nullable();
            $table->timestamp('date_expiration')->nullable(); // date_publication + 28 days
            $table->unsignedSmallInteger('nb_republications')->default(0);
            $table->unsignedInteger('nb_vues')->default(0);
            $table->unsignedInteger('nb_favoris')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('seller_id');
            $table->index('category_id');
            $table->index('mode');
            $table->index('statut');
            $table->index('date_publication');
            $table->index('date_expiration');
            $table->index(['statut', 'date_expiration']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
