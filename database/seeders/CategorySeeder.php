<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['nom_fr' => 'Monnaies', 'nom_ar' => 'عملات', 'slug' => 'monnaies', 'icon' => 'coin', 'ordre_affichage' => 1],
            ['nom_fr' => 'Timbres', 'nom_ar' => 'طوابع', 'slug' => 'timbres', 'icon' => 'stamp', 'ordre_affichage' => 2],
            ['nom_fr' => 'Billets', 'nom_ar' => 'نقود ورقية', 'slug' => 'billets', 'icon' => 'banknote', 'ordre_affichage' => 3],
            ['nom_fr' => 'Montres', 'nom_ar' => 'ساعات', 'slug' => 'montres', 'icon' => 'watch', 'ordre_affichage' => 4],
            ['nom_fr' => 'Cartes postales', 'nom_ar' => 'بطاقات بريدية', 'slug' => 'cartes-postales', 'icon' => 'mail', 'ordre_affichage' => 5],
            ['nom_fr' => 'Enveloppes', 'nom_ar' => 'ظرف', 'slug' => 'enveloppes', 'icon' => 'envelope', 'ordre_affichage' => 6],
            ['nom_fr' => 'Bijoux', 'nom_ar' => 'مجوهرات', 'slug' => 'bijoux', 'icon' => 'gem', 'ordre_affichage' => 7],
            ['nom_fr' => 'Statues', 'nom_ar' => 'تماثيل', 'slug' => 'statues', 'icon' => 'landmark', 'ordre_affichage' => 8],
            ['nom_fr' => 'Céramiques', 'nom_ar' => 'سيراميك', 'slug' => 'ceramiques', 'icon' => 'cup', 'ordre_affichage' => 9],
            ['nom_fr' => 'Machinerie', 'nom_ar' => 'آلات', 'slug' => 'machinerie', 'icon' => 'cog', 'ordre_affichage' => 10],
            ['nom_fr' => 'Manuscrits', 'nom_ar' => 'مخطوطات', 'slug' => 'manuscrits', 'icon' => 'scroll', 'ordre_affichage' => 11],
            ['nom_fr' => 'Livres anciens', 'nom_ar' => 'كتب قديمة', 'slug' => 'livres-anciens', 'icon' => 'book', 'ordre_affichage' => 12],
            ['nom_fr' => 'Voitures miniatures', 'nom_ar' => 'سيارات مصغرة', 'slug' => 'voitures-miniatures', 'icon' => 'car', 'ordre_affichage' => 13],
            ['nom_fr' => 'Bronzes', 'nom_ar' => 'برونز', 'slug' => 'bronzes', 'icon' => 'medal', 'ordre_affichage' => 14],
            ['nom_fr' => 'Habillements anciens', 'nom_ar' => 'ملابس قديمة', 'slug' => 'habillements-anciens', 'icon' => 'shirt', 'ordre_affichage' => 15],
            ['nom_fr' => 'Militaria', 'nom_ar' => 'عسكريات', 'slug' => 'militaria', 'icon' => 'shield', 'ordre_affichage' => 16],
            ['nom_fr' => 'Cartes Pokémon', 'nom_ar' => 'كروت بوكيمون', 'slug' => 'cartes-pokemon', 'icon' => 'layers', 'ordre_affichage' => 17],
            ['nom_fr' => 'Collections complètes', 'nom_ar' => 'مجموعات كاملة', 'slug' => 'collections-completes', 'icon' => 'grid', 'ordre_affichage' => 18],
            ['nom_fr' => 'Science & Technique', 'nom_ar' => 'علوم وتكنولوجيا', 'slug' => 'science-technique', 'icon' => 'cpu', 'ordre_affichage' => 19],
            ['nom_fr' => 'Divers', 'nom_ar' => 'متنوع', 'slug' => 'divers', 'icon' => 'package', 'ordre_affichage' => 20],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->updateOrInsert(
                ['slug' => $category['slug']],
                array_merge($category, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
