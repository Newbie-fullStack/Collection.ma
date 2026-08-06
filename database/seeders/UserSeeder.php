<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        // Admin
        User::create([
            'pseudo' => 'Admin',
            'nom' => 'Benali',
            'prenom' => 'Mohamed',
            'age' => 35,
            'gsm' => '0600000000',
            'email' => 'admin@collection.ma',
            'email_verified_at' => now(),
            'adresse_exacte' => 'Rabat, Maroc',
            'role' => 'admin',
            'statut_kyc' => 'verifie',
            'note_moyenne' => 0,
            'langue_preferee' => 'fr',
            'cgu_acceptee_version' => '1.0',
            'cgu_acceptee_le' => now(),
            'cgu_acceptee_ip' => '127.0.0.1',
            'password' => $password,
        ]);

        // Vendeur (seller only)
        $seller = User::create([
            'pseudo' => 'CollectorMaroc',
            'nom' => 'El Fassi',
            'prenom' => 'Youssef',
            'age' => 42,
            'gsm' => '0612345678',
            'email' => 'vendeur@collection.ma',
            'email_verified_at' => now(),
            'adresse_exacte' => 'Fès, Médina, Derb El Miter',
            'role' => 'both',
            'statut_kyc' => 'verifie',
            'note_moyenne' => 4.8,
            'langue_preferee' => 'fr',
            'cgu_acceptee_version' => '1.0',
            'cgu_acceptee_le' => now(),
            'cgu_acceptee_ip' => '127.0.0.1',
            'password' => $password,
        ]);

        Wallet::create([
            'user_id' => $seller->id,
            'solde' => 12500.00,
            'solde_disponible' => 8500.00,
            'solde_en_attente' => 4000.00,
            'devise' => 'MAD',
        ]);

        // Acheteur (buyer only)
        $buyer = User::create([
            'pseudo' => 'Chercheur91',
            'nom' => 'Alami',
            'prenom' => 'Sara',
            'age' => 28,
            'gsm' => '0698765432',
            'email' => 'acheteur@collection.ma',
            'email_verified_at' => now(),
            'adresse_exacte' => 'Casablanca, Maarif',
            'role' => 'acheteur',
            'statut_kyc' => 'verifie',
            'note_moyenne' => 4.5,
            'langue_preferee' => 'fr',
            'cgu_acceptee_version' => '1.0',
            'cgu_acceptee_le' => now(),
            'cgu_acceptee_ip' => '127.0.0.1',
            'password' => $password,
        ]);

        Wallet::create([
            'user_id' => $buyer->id,
            'solde' => 3200.00,
            'solde_disponible' => 3200.00,
            'solde_en_attente' => 0.00,
            'devise' => 'MAD',
        ]);

        // Vendeur + Acheteur (both)
        $both = User::create([
            'pseudo' => 'HassanCollector',
            'nom' => 'Tazi',
            'prenom' => 'Hassan',
            'age' => 55,
            'gsm' => '0655443322',
            'email' => 'lesdeux@collection.ma',
            'email_verified_at' => now(),
            'adresse_exacte' => 'Marrakech, Guéliz, Ave Mohamed V',
            'role' => 'both',
            'statut_kyc' => 'verifie',
            'note_moyenne' => 4.9,
            'langue_preferee' => 'ar',
            'cgu_acceptee_version' => '1.0',
            'cgu_acceptee_le' => now(),
            'cgu_acceptee_ip' => '127.0.0.1',
            'password' => $password,
        ]);

        Wallet::create([
            'user_id' => $both->id,
            'solde' => 7800.00,
            'solde_disponible' => 5000.00,
            'solde_en_attente' => 2800.00,
            'devise' => 'MAD',
        ]);

        // More buyers for realism
        $buyer2 = User::create([
            'pseudo' => 'Timbrophile44',
            'nom' => 'Bennani',
            'prenom' => 'Karim',
            'age' => 62,
            'gsm' => '0611223344',
            'email' => 'karim@collection.ma',
            'email_verified_at' => now(),
            'adresse_exacte' => 'Tanger, Ancienne Médina',
            'role' => 'acheteur',
            'statut_kyc' => 'verifie',
            'note_moyenne' => 4.2,
            'langue_preferee' => 'fr',
            'cgu_acceptee_version' => '1.0',
            'cgu_acceptee_le' => now(),
            'cgu_acceptee_ip' => '127.0.0.1',
            'password' => $password,
        ]);

        Wallet::create([
            'user_id' => $buyer2->id,
            'solde' => 1500.00,
            'solde_disponible' => 1500.00,
            'solde_en_attente' => 0.00,
            'devise' => 'MAD',
        ]);

        // Non-verified user (no KYC)
        User::create([
            'pseudo' => 'Nouveau2026',
            'nom' => 'Idrissi',
            'prenom' => 'Fatima',
            'age' => 24,
            'gsm' => '0677889900',
            'email' => 'fatima@collection.ma',
            'email_verified_at' => now(),
            'adresse_exacte' => 'Agadir, Sonaba',
            'role' => 'acheteur',
            'statut_kyc' => 'non_verifie',
            'note_moyenne' => 0,
            'langue_preferee' => 'ar',
            'cgu_acceptee_version' => '1.0',
            'cgu_acceptee_le' => now(),
            'cgu_acceptee_ip' => '127.0.0.1',
            'password' => $password,
        ]);
    }
}
