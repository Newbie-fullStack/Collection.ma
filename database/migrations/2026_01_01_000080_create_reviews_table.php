<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reviewed_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('note'); // 1-5
            $table->text('commentaire')->nullable();
            $table->boolean('reponse_vendeur')->default(false);
            $table->text('reponse_vendeur_texte')->nullable();
            $table->timestamps();

            $table->index('order_id');
            $table->index('reviewer_id');
            $table->index('reviewed_id');
            $table->unique(['order_id', 'reviewer_id']); // One review per order per reviewer
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
