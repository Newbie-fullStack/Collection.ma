<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('nom_fr');
            $table->string('nom_ar');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->unsignedInteger('ordre_affichage');
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index('ordre_affichage');
            $table->index('active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
