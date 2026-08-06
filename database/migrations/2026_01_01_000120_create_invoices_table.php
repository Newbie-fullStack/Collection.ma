<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('numero_facture', 50)->unique(); // FAC-2026-000123
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Buyer or seller
            $table->enum('type', ['acheteur', 'vendeur', 'plateforme']);
            $table->decimal('sous_total', 12, 2);
            $table->decimal('commission', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->string('devise', 3)->default('MAD');
            $table->string('pdf_path')->nullable(); // S3 path
            $table->boolean('telechargee')->default(false);
            $table->timestamps();

            $table->index('order_id');
            $table->index('user_id');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
