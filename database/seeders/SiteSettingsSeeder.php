<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SiteSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['cle' => 'commission_taux', 'valeur' => '5.00', 'type' => 'decimal', 'groupe' => 'finance'],
            ['cle' => 'devise_defaut', 'valeur' => 'MAD', 'type' => 'string', 'groupe' => 'finance'],
            ['cle' => 'duree_confirmation_jours_ouvrables', 'valeur' => '10', 'type' => 'integer', 'groupe' => 'commande'],
            ['cle' => 'duree_annonces_jours', 'valeur' => '28', 'type' => 'integer', 'groupe' => 'annonces'],
            ['cle' => 'auto_republication', 'valeur' => '1', 'type' => 'boolean', 'groupe' => 'annonces'],
            ['cle' => 'site_nom', 'valeur' => 'Collection.ma', 'type' => 'string', 'groupe' => 'general'],
            ['cle' => 'site_description', 'valeur' => 'Marketplace marocaine d\'enchères et vente directe pour collectionneurs', 'type' => 'string', 'groupe' => 'general'],
            ['cle' => 'cgu_version', 'valeur' => '1.0', 'type' => 'string', 'groupe' => 'legal'],
            ['cle' => 'min_age_inscription', 'valeur' => '18', 'type' => 'integer', 'groupe' => 'inscription'],
        ];

        foreach ($settings as $setting) {
            DB::table('site_settings')->updateOrInsert(
                ['cle' => $setting['cle']],
                array_merge($setting, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
