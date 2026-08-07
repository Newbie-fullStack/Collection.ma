<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Fixes PostgreSQL CHECK constraints that were created from Laravel enum()
 * definitions but became stale/wrong:
 *  - wallet_transactions.type missing 'paiement' (breaks checkout)
 *  - disputes.raison contains a stray leading-space ' autre' (breaks dispute creation)
 *
 * Only applies to pgsql (native enums on other drivers are fine via code).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // Rebuild wallet_transactions.type check to include 'paiement'
        DB::statement('ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_type_check');
        DB::statement(<<<'SQL'
            ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check CHECK (
                type IN (
                    'depot', 'encaissement', 'commission', 'virement_vendeur',
                    'remboursement', 'retrait', 'paiement'
                )
            )
SQL);

        // Rebuild disputes.raison check with the corrected 'autre' value
        DB::statement('ALTER TABLE disputes DROP CONSTRAINT IF EXISTS disputes_raison_check');
        DB::statement(<<<'SQL'
            ALTER TABLE disputes ADD CONSTRAINT disputes_raison_check CHECK (
                raison IN (
                    'objet_non_recu', 'objet_endommage', 'objet_different',
                    'non_conforme', 'retard_livraison', 'arnaque', 'autre'
                )
            )
SQL);
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_type_check');
        DB::statement(<<<'SQL'
            ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check CHECK (
                type IN (
                    'depot', 'encaissement', 'commission', 'virement_vendeur',
                    'remboursement', 'retrait'
                )
            )
SQL);

        DB::statement('ALTER TABLE disputes DROP CONSTRAINT IF EXISTS disputes_raison_check');
        DB::statement(<<<'SQL'
            ALTER TABLE disputes ADD CONSTRAINT disputes_raison_check CHECK (
                raison IN (
                    'objet_non_recu', 'objet_endommage', 'objet_different',
                    'non_conforme', 'retard_livraison', 'arnaque', ' autre'
                )
            )
SQL);
    }
};