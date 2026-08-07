<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->timestamp('date_publication_planifiee')->nullable()->after('date_expiration');
            $table->index('date_publication_planifiee');
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropIndex(['date_publication_planifiee']);
            $table->dropColumn('date_publication_planifiee');
        });
    }
};