<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->boolean('signalee')->default(false)->after('reponse_vendeur_texte');
            $table->enum('moderation', ['validee', 'signalee', 'masquee'])->default('validee')->after('signalee');
            $table->boolean('masquee')->default(false)->after('moderation');
            $table->index('moderation');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['moderation']);
            $table->dropColumn('masquee');
            $table->dropColumn('moderation');
            $table->dropColumn('signalee');
        });
    }
};