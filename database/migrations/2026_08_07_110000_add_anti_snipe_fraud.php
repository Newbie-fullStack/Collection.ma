<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bids', function (Blueprint $table) {
            $table->boolean('suspect')->default(false)->after('statut');
            $table->string('motif_suspect', 100)->nullable()->after('suspect');
            $table->index('suspect');
        });

        Schema::table('listings', function (Blueprint $table) {
            $table->unsignedInteger('extensions_anti_snipe')->default(0)->after('nb_republications');
        });
    }

    public function down(): void
    {
        Schema::table('bids', function (Blueprint $table) {
            $table->dropIndex(['suspect']);
            $table->dropColumn('motif_suspect');
            $table->dropColumn('suspect');
        });

        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn('extensions_anti_snipe');
        });
    }
};