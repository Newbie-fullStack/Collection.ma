<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listing_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained('listings')->cascadeOnDelete();
            $table->string('path'); // S3 path
            $table->unsignedSmallInteger('ordre')->default(0);
            $table->boolean('is_principale')->default(false);
            $table->timestamps();

            $table->index('listing_id');
            $table->index('ordre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listing_photos');
    }
};
