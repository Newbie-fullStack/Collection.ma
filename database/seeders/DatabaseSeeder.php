<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            SiteSettingsSeeder::class,
            UserSeeder::class,
            ListingSeeder::class,
        ]);
    }
}
