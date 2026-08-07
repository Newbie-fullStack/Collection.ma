<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favorite_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nom', 100);
            $table->unsignedInteger('ordre')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'ordre']);
        });

        Schema::table('favorites', function (Blueprint $table) {
            $table->foreignId('folder_id')
                ->nullable()
                ->after('listing_id')
                ->constrained('favorite_folders')
                ->nullOnDelete();

            $table->index(['user_id', 'folder_id']);
        });
    }

    public function down(): void
    {
        Schema::table('favorites', function (Blueprint $table) {
            $table->dropForeign(['folder_id']);
            $table->dropColumn('folder_id');
        });

        Schema::dropIfExists('favorite_folders');
    }
};