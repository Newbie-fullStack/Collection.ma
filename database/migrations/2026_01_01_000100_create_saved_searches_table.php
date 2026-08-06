<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saved_searches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nom');
            $table->string('mot_cle')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->decimal('prix_min', 12, 2)->nullable();
            $table->decimal('prix_max', 12, 2)->nullable();
            $table->enum('mode', ['enchere', 'achat_immediat', ''])->nullable();
            $table->boolean('alerte_active')->default(false);
            $table->enum('frequence_alerte', ['instantanee', 'quotidienne', 'hebdomadaire'])->default('quotidienne');
            $table->timestamps();

            $table->index('user_id');
            $table->index('alerte_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_searches');
    }
};
