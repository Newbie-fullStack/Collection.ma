<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('advertisements', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->string('image_path'); // S3 path
            $table->string('lien')->nullable();
            $table->enum('position', ['top_gauche', 'top_droite', 'bottom_gauche', 'bottom_droite']);
            $table->unsignedSmallInteger('largeur')->default(970);
            $table->unsignedSmallInteger('hauteur')->default(250);
            $table->timestamp('date_debut')->nullable();
            $table->timestamp('date_fin')->nullable();
            $table->boolean('active')->default(true);
            $table->unsignedInteger('nb_impressions')->default(0);
            $table->unsignedInteger('nb_clics')->default(0);
            $table->timestamps();

            $table->index('position');
            $table->index(['active', 'date_debut', 'date_fin']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advertisements');
    }
};
