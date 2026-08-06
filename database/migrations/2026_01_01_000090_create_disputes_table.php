<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('initiator_id')->constrained('users')->cascadeOnDelete();
            $table->enum('raison', [
                'objet_non_recu',
                'objet_endommage',
                'objet_different',
                'non_conforme',
                'retard_livraison',
                'arnaque',
                ' autre',
            ]);
            $table->text('description');
            $table->text('preuves')->nullable(); // JSON array of file paths
            $table->enum('statut', [
                'ouverte',
                'en_examen',
                'en_attente_vendeur',
                'en_attente_acheteur',
                'resolue_acheteur',
                'resolue_vendeur',
                'cloturee',
            ])->default('ouverte');
            $table->text('decision_admin')->nullable();
            $table->decimal('remboursement_montant', 12, 2)->nullable();
            $table->timestamp('date_resolution')->nullable();
            $table->timestamps();

            $table->index('order_id');
            $table->index('initiator_id');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
