<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('vendeur_verifie_le')->nullable()->after('statut_kyc');
        });

        Schema::create('vendor_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->date('date_naissance')->nullable();
            $table->string('adresse_confirmee')->nullable();

            $table->binary('cin_recto')->nullable();
            $table->string('cin_recto_mime')->nullable();
            $table->binary('cin_verso')->nullable();
            $table->string('cin_verso_mime')->nullable();

            $table->text('rib')->nullable();

            $table->binary('contrat_pdf_genere')->nullable();
            $table->string('contrat_mime')->nullable();
            $table->string('version_cgv')->default('1.0');
            $table->timestamp('date_generation')->nullable();

            $table->binary('contrat_signe')->nullable();
            $table->string('contrat_signe_mime')->nullable();

            $table->string('statut')->default('en_attente');
            $table->string('motif_refus')->nullable();
            $table->text('message_complement')->nullable();

            $table->timestamp('date_soumission')->nullable();
            $table->timestamp('date_traitement')->nullable();
            $table->foreignId('traite_par')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['user_id', 'statut']);
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_applications');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('vendeur_verifie_le');
        });
    }
};
