<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('pseudo')->unique();
            $table->string('nom');
            $table->string('prenom');
            $table->unsignedTinyInteger('age');
            $table->string('gsm', 20);
            $table->string('email')->unique();
            $table->text('adresse_exacte');
            $table->text('rib')->nullable(); // Encrypted at rest via model cast
            $table->enum('role', ['acheteur', 'vendeur', 'both', 'admin'])->default('acheteur');
            $table->enum('statut_kyc', ['non_verifie', 'en_cours', 'verifie', 'rejete'])->default('non_verifie');
            $table->decimal('note_moyenne', 3, 2)->default(0);
            $table->string('langue_preferee', 5)->default('fr');
            $table->string('cgu_acceptee_version', 20);
            $table->timestamp('cgu_acceptee_le');
            $table->string('cgu_acceptee_ip', 45);
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('two_factor_secret')->nullable();
            $table->string('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            $table->index('role');
            $table->index('statut_kyc');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
