<?php

namespace Database\Seeders;

use App\Models\Listing;
use App\Models\ListingPhoto;
use App\Models\User;
use Illuminate\Database\Seeder;

class ListingSeeder extends Seeder
{
    public function run(): void
    {
        $seller = User::where('pseudo', 'CollectorMaroc')->first();

        $products = [
            ['category_id' => 1, 'titre' => 'Pièce 5 Dirhams Mohammed V - 1945', 'description' => 'Belle pièce en argent frappée sous le protectorat. Très bon état de conservation avec détails nets.', 'prix_vente' => 450, 'mode' => 'enchere', 'nb_vues' => 234],
            ['category_id' => 1, 'titre' => 'Rial Hassani 1920 - Maroc', 'description' => 'Rial en argent du Sultan Moulay Youssef. Pièce rare en excellent état. Poids: 25g.', 'prix_vente' => 1200, 'mode' => 'achat_immediat', 'nb_vues' => 189],
            ['category_id' => 1, 'titre' => 'Collection 20 Dirhams - Série complète 2002-2020', 'description' => 'Série complète de 19 pièces commémoratives. Coffret de présentation inclus.', 'prix_vente' => 3500, 'mode' => 'enchere', 'nb_vues' => 412],
            ['category_id' => 2, 'titre' => 'Timbre Maroc 1914 - Série Duleau', 'description' => 'Timbre surchargé MAROC de la série Duleau. Très rare. Cachet postal clair.', 'prix_vente' => 850, 'mode' => 'enchere', 'nb_vues' => 156],
            ['category_id' => 2, 'titre' => 'Bloc de 4 timbres - Mosquée Hassan II', 'description' => 'Bloc souvenir de 4 timbres commémoratifs. État neuf. Émission 1993.', 'prix_vente' => 120, 'mode' => 'achat_immediat', 'nb_vues' => 98],
            ['category_id' => 3, 'titre' => 'Billet 100 Dirhams - 1ère série 1960', 'description' => 'Premier billet en dirham du Maroc indépendant. Numéro bas. Rarissime.', 'prix_vente' => 2800, 'mode' => 'enchere', 'nb_vues' => 345],
            ['category_id' => 3, 'titre' => 'Billet 500 Francs Maroc - Protectorat', 'description' => 'Billet du protectorat français. Couleurs vives, pas de déchirures.', 'prix_vente' => 650, 'mode' => 'achat_immediat', 'nb_vues' => 167],
            ['category_id' => 4, 'titre' => 'Montre Cartier Santos - Acier', 'description' => 'Montre Cartier Santos Galbée en acier. Mouvement automatique. Certificat Cartier.', 'prix_vente' => 12500, 'mode' => 'achat_immediat', 'nb_vues' => 567],
            ['category_id' => 4, 'titre' => 'Breguet Classique 5177 - Or rose', 'description' => 'Breguet Classique en or rose 18K. Cadran émail Grand Feu. Pièce d\'exception.', 'prix_vente' => 28000, 'mode' => 'enchere', 'nb_vues' => 892],
            ['category_id' => 5, 'titre' => 'Carte postale ancienne - Marrakech 1920', 'description' => 'Vue de Jemaa el-Fna en 1920. Cachet postal. Document historique.', 'prix_vente' => 95, 'mode' => 'achat_immediat', 'nb_vues' => 78],
            ['category_id' => 5, 'titre' => 'Série cartes - Villes impériales', 'description' => '5 cartes postales anciennes : Fès, Marrakech, Meknès, Rabat, Tanger.', 'prix_vente' => 220, 'mode' => 'enchere', 'nb_vues' => 134],
            ['category_id' => 6, 'titre' => 'Enveloppe Premier Jour - BCP 1955', 'description' => 'Enveloppe Premier Jour avec cachet de première date. Rarissime.', 'prix_vente' => 380, 'mode' => 'achat_immediat', 'nb_vues' => 56],
            ['category_id' => 7, 'titre' => 'Bague berbère argent - Tifinagh', 'description' => 'Bague artisanale en argent massif avec gravures tifinagh. Pièce unique.', 'prix_vente' => 350, 'mode' => 'enchere', 'nb_vues' => 245],
            ['category_id' => 7, 'titre' => 'Pendentif touareg - Argent turquoise', 'description' => 'Pendentif touareg en argent avec turquoise naturelle. Années 1960.', 'prix_vente' => 480, 'mode' => 'achat_immediat', 'nb_vues' => 198],
            ['category_id' => 8, 'titre' => 'Statuette chameau bois d\'olivier', 'description' => 'Sculpture en bois d\'olivier. Hauteur 25cm. Sud marocain.', 'prix_vente' => 280, 'mode' => 'achat_immediat', 'nb_vues' => 112],
            ['category_id' => 8, 'titre' => 'Figure Gnawa en bronze', 'description' => 'Statuette en bronze d\'un musicien Gnawa. Hauteur 30cm.', 'prix_vente' => 650, 'mode' => 'enchere', 'nb_vues' => 189],
            ['category_id' => 9, 'titre' => 'Tajine céramique Safi - Lot de 3', 'description' => '3 tajines en céramique peinte de Safi. Couleurs traditionnelles.', 'prix_vente' => 180, 'mode' => 'achat_immediat', 'nb_vues' => 167],
            ['category_id' => 9, 'titre' => 'Vase artisanal Fès - Zellige', 'description' => 'Vase en céramique de Fès avec motif zellige. Hauteur 18cm.', 'prix_vente' => 320, 'mode' => 'enchere', 'nb_vues' => 145],
            ['category_id' => 10, 'titre' => 'Machine à écrire Olivetti Lettera 32', 'description' => 'Olivetti portative des années 1970. Fonctionne parfaitement.', 'prix_vente' => 420, 'mode' => 'achat_immediat', 'nb_vues' => 234],
            ['category_id' => 10, 'titre' => 'Lampadaire art déco - Bronze', 'description' => 'Lampadaire art déco années 1930. Pied en bronze. Hauteur 65cm.', 'prix_vente' => 890, 'mode' => 'enchere', 'nb_vues' => 312],
            ['category_id' => 11, 'titre' => 'Manuscrit arabe - Coran ancien', 'description' => 'Coran ancien sur vélin. Encre dorée. Calligraphie maghribine XIXe.', 'prix_vente' => 1500, 'mode' => 'enchere', 'nb_vues' => 278],
            ['category_id' => 12, 'titre' => 'L\'Année du Maroc - 1937', 'description' => 'Livre de voyage illustré. Reliure d\'origine. Planches en noir et blanc.', 'prix_vente' => 350, 'mode' => 'achat_immediat', 'nb_vues' => 145],
            ['category_id' => 12, 'titre' => 'Album Mosquée de Tlemcen - 1904', 'description' => '24 planches photographiques. Reliure cuir d\'origine.', 'prix_vente' => 580, 'mode' => 'enchere', 'nb_vues' => 198],
            ['category_id' => 13, 'titre' => 'Lot 10 Hot Wheels vintage 1995-2000', 'description' => '10 voitures Hot Wheels en boîte. Séries rares. État neuf.', 'prix_vente' => 250, 'mode' => 'achat_immediat', 'nb_vues' => 312],
            ['category_id' => 13, 'titre' => 'Mercedes 300SL Gullwing 1/18', 'description' => 'Maquette CMC en métal. Échelle 1/18. Détails réalistes.', 'prix_vente' => 450, 'mode' => 'enchere', 'nb_vues' => 234],
            ['category_id' => 14, 'titre' => 'Bronze africain - Figure Dogon', 'description' => 'Statuette bronze figure Dogon. Patine ancienne. Hauteur 22cm.', 'prix_vente' => 920, 'mode' => 'enchere', 'nb_vues' => 189],
            ['category_id' => 15, 'titre' => 'Kaftan brodé - Soie et fil d\'or', 'description' => 'Kaftan traditionnel soie bordeaux. Broderies fil d\'or. Années 1960.', 'prix_vente' => 1800, 'mode' => 'achat_immediat', 'nb_vues' => 267],
            ['category_id' => 15, 'titre' => 'Chachia traditionnelle - Laine soie', 'description' => 'Chachia nord marocain. Laine tissée fils de soie. Années 1940.', 'prix_vente' => 180, 'mode' => 'enchere', 'nb_vues' => 89],
            ['category_id' => 16, 'titre' => 'Casque colonial - Protectorat Maroc', 'description' => 'Casque colonial en liège. Marquage intérieur. Époque 1920-1930.', 'prix_vente' => 520, 'mode' => 'enchere', 'nb_vues' => 198],
            ['category_id' => 16, 'titre' => 'Médaille Campagne du Maroc 1907-1913', 'description' => 'Médaille militaire bronze. Ruban d\'origine. Numéro gravé.', 'prix_vente' => 280, 'mode' => 'achat_immediat', 'nb_vues' => 156],
            ['category_id' => 17, 'titre' => 'Pikachu Illustrator - PSA 7', 'description' => 'La carte la plus rare au monde. Certifiée PSA grade 7.', 'prix_vente' => 45000, 'mode' => 'enchere', 'nb_vues' => 2345],
            ['category_id' => 17, 'titre' => 'Lot 50 cartes rares - Base Set', 'description' => '50 cartes rares Base Set. Dracaufeu, Tortank, Bulbizarre holographiques.', 'prix_vente' => 2200, 'mode' => 'achat_immediat', 'nb_vues' => 567],
            ['category_id' => 18, 'titre' => 'Timbres Maroc 1956-1976 complet', 'description' => 'Album complet 347 timbres Maroc indépendant. État parfait.', 'prix_vente' => 4500, 'mode' => 'enchere', 'nb_vues' => 456],
            ['category_id' => 19, 'titre' => 'Astrolabe ancien en laiton', 'description' => 'Astrolabe laiton gravé XIXe. Détails en arabe. Diamètre 18cm.', 'prix_vente' => 3200, 'mode' => 'enchere', 'nb_vues' => 678],
            ['category_id' => 19, 'titre' => 'Télégraphe Morse professionnel', 'description' => 'Télégraphe Morse laiton et bois. Années 1920. Fonctionne.', 'prix_vente' => 1800, 'mode' => 'achat_immediat', 'nb_vues' => 345],
            ['category_id' => 20, 'titre' => '15 cartes anciennes - Protectorat', 'description' => '15 cartes postales anciennes. Casablanca, Fès, Rabat, Tanger.', 'prix_vente' => 320, 'mode' => 'enchere', 'nb_vues' => 234],
            ['category_id' => 20, 'titre' => 'Coffret thé marocain artisanal', 'description' => 'Bois sculpté, 5 thés premium : menthe, orange, épices, safran, berbère.', 'prix_vente' => 150, 'mode' => 'achat_immediat', 'nb_vues' => 189],
        ];

        $templates = [
            1 => 'coin', 2 => 'stamp', 3 => 'banknote', 4 => 'watch', 5 => 'postcard',
            6 => 'stamp', 7 => 'jewel', 8 => 'statue', 9 => 'ceramic', 10 => 'machine',
            11 => 'manuscript', 12 => 'book', 13 => 'car', 14 => 'trophy', 15 => 'cloth',
            16 => 'medal', 17 => 'card', 18 => 'collection', 19 => 'science', 20 => 'misc',
        ];

        $counter = 1;
        foreach ($products as $product) {
            $listing = Listing::create([
                'numero_auto' => sprintf('COL-%s-%06d', date('Y'), $counter++),
                'seller_id' => $seller->id,
                'category_id' => $product['category_id'],
                'titre' => $product['titre'],
                'description' => $product['description'],
                'prix_vente' => $product['prix_vente'],
                'frais_port' => fake()->randomFloat(2, 15, 80),
                'total' => $product['prix_vente'] + fake()->randomFloat(2, 15, 80),
                'mode' => $product['mode'],
                'statut' => 'active',
                'prix_actuel' => $product['mode'] === 'enchere' ? $product['prix_vente'] : null,
                'date_publication' => now()->subDays(rand(1, 20)),
                'date_expiration' => now()->addDays(rand(1, 28)),
                'nb_republications' => 0,
                'nb_vues' => $product['nb_vues'],
                'nb_favoris' => rand(0, 50),
            ]);

            $dir = storage_path('app/public/placeholders');
            if (! is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            $sourceImage = ($counter % 2 === 0) ? base_path('image copy.png') : base_path('image.png');
            $fileName = 'listing_'.$listing->id.'.png';
            copy($sourceImage, $dir.'/'.$fileName);

            ListingPhoto::create([
                'listing_id' => $listing->id,
                'path' => 'placeholders/'.$fileName,
                'ordre' => 0,
                'is_principale' => true,
            ]);
        }
    }

    private function renderTemplate(string $type, string $title, float $price, int $id): string
    {
        $t = htmlspecialchars(mb_substr($title, 0, 42), ENT_XML1);
        $p = number_format($price, 0, ',', ' ');
        $bg = '#FDF6E3';
        $accent = '#D4A843';
        $dark = '#3E2723';
        $mid = '#8D6E63';

        $star = '<polygon points="250,123 255,145 278,145 259,158 266,180 250,167 234,180 241,158 222,145 245,145" fill="'.$accent.'" opacity="0.5"/>';
        $header = '<text x="250" y="85" text-anchor="middle" font-family="Georgia,serif" font-size="12" fill="'.$mid.'" letter-spacing="3">COLLECTION UNIQUE</text><line x1="120" y1="98" x2="380" y2="98" stroke="'.$accent.'" stroke-width="0.5" opacity="0.4"/>';
        $footer = '<text x="250" y="475" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#A1887F">Livraison sécurisée • Authenticité garantie • Paiement sécurisé</text>';
        $border = '<rect x="30" y="30" width="440" height="440" rx="6" fill="none" stroke="'.$accent.'" stroke-width="2" stroke-dasharray="8,4"/>';

        switch ($type) {
            case 'coin':
                return $this->svg($bg, $border.$header.$star.
                    '<circle cx="250" cy="210" r="80" fill="#C9A84C" opacity="0.9"/>'.
                    '<circle cx="250" cy="210" r="74" fill="#D4B85C" opacity="0.85"/>'.
                    '<circle cx="250" cy="210" r="68" fill="none" stroke="#A08030" stroke-width="1.5"/>'.
                    '<circle cx="250" cy="210" r="60" fill="none" stroke="#A08030" stroke-width="0.5"/>'.
                    '<text x="250" y="195" text-anchor="middle" font-family="serif" font-size="28" fill="'.$dark.'" font-weight="bold">5</text>'.
                    '<text x="250" y="218" text-anchor="middle" font-family="serif" font-size="11" fill="'.$dark.'">DIRHAMS</text>'.
                    '<text x="250" y="240" text-anchor="middle" font-family="serif" font-size="9" fill="#5D4037">MAROC</text>'.
                    '<polygon points="250,255 252,261 258,261 253,265 255,271 250,267 245,271 247,265 242,261 248,261" fill="#A08030" opacity="0.4"/>'.
                    '<circle cx="140" cy="380" r="35" fill="#B8960C" opacity="0.7"/>'.
                    '<circle cx="140" cy="380" r="30" fill="#C9A84C" opacity="0.6"/>'.
                    '<text x="140" y="378" text-anchor="middle" font-family="serif" font-size="14" fill="'.$dark.'" font-weight="bold">1</text>'.
                    '<text x="140" y="395" text-anchor="middle" font-family="serif" font-size="7" fill="'.$dark.'">RIAL</text>'.
                    '<circle cx="360" cy="380" r="35" fill="#8B7010" opacity="0.7"/>'.
                    '<circle cx="360" cy="380" r="30" fill="#A08030" opacity="0.6"/>'.
                    '<text x="360" y="378" text-anchor="middle" font-family="serif" font-size="14" fill="#FDF6E3" font-weight="bold">10</text>'.
                    '<text x="360" y="395" text-anchor="middle" font-family="serif" font-size="7" fill="#FDF6E3">FRANCS</text>'.
                    '<text x="250" y="330" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="'.$dark.'" font-weight="bold">Monnaies de Collection</text>'.
                    '<text x="250" y="355" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="'.$mid.'" letter-spacing="2">HISTOIRE • VALEUR • PASSION</text>'.
                    $footer
                );

            case 'stamp':
                $miniStamps = '<g transform="translate(80,340)"><rect width="100" height="90" rx="3" fill="#F5E6C8" stroke="'.$accent.'" stroke-width="0.5"/><rect x="6" y="6" width="88" height="78" rx="2" fill="none" stroke="'.$accent.'" stroke-width="0.3" stroke-dasharray="3,2"/><text x="50" y="30" text-anchor="middle" font-family="serif" font-size="16" fill="'.$accent.'" font-weight="bold">10</text><text x="50" y="44" text-anchor="middle" font-family="serif" font-size="8" fill="#5D4037">MAROC</text><text x="50" y="58" text-anchor="middle" font-family="serif" font-size="7" fill="'.$mid.'">POSTES</text><rect x="25" y="62" width="50" height="15" rx="1" fill="'.$accent.'" opacity="0.15"/></g>'.
                    '<g transform="translate(200,340)"><rect width="100" height="90" rx="3" fill="#E8D5B7" stroke="'.$accent.'" stroke-width="0.5"/><rect x="6" y="6" width="88" height="78" rx="2" fill="none" stroke="'.$accent.'" stroke-width="0.3" stroke-dasharray="3,2"/><text x="50" y="28" text-anchor="middle" font-family="serif" font-size="14" fill="'.$accent.'" font-weight="bold">25</text><text x="50" y="42" text-anchor="middle" font-family="serif" font-size="8" fill="#5D4037">MAROC</text><rect x="25" y="48" width="50" height="28" rx="2" fill="'.$accent.'" opacity="0.15"/></g>'.
                    '<g transform="translate(320,340)"><rect width="100" height="90" rx="3" fill="#D4A843" opacity="0.3" stroke="'.$accent.'" stroke-width="0.5"/><rect x="6" y="6" width="88" height="78" rx="2" fill="none" stroke="'.$accent.'" stroke-width="0.3" stroke-dasharray="3,2"/><text x="50" y="30" text-anchor="middle" font-family="serif" font-size="16" fill="'.$accent.'" font-weight="bold">5</text><text x="50" y="44" text-anchor="middle" font-family="serif" font-size="8" fill="#5D4037">MAROC</text><text x="50" y="58" text-anchor="middle" font-family="serif" font-size="7" fill="'.$mid.'">POSTES</text><path d="M30,68 Q50,78 70,68" fill="none" stroke="'.$accent.'" stroke-width="0.5"/></g>';

                return $this->svg($bg, $border.$header.$star.
                    '<text x="250" y="165" text-anchor="middle" font-family="Georgia,serif" font-size="34" fill="'.$dark.'" font-weight="bold">Timbres</text>'.
                    '<text x="250" y="200" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="'.$accent.'">de Collection</text>'.
                    '<line x1="150" y1="215" x2="350" y2="215" stroke="'.$accent.'" stroke-width="0.5" opacity="0.4"/>'.
                    '<text x="250" y="240" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="'.$mid.'" letter-spacing="2">RARETÉ • HISTOIRE • ÉLÉGANCE</text>'.
                    $miniStamps.$footer
                );

            case 'banknote':
                return $this->svg($bg, $border.$header.$star.
                    '<rect x="80" y="140" width="340" height="160" rx="8" fill="#E8F5E9" stroke="#27AE60" stroke-width="1.5"/>'.
                    '<rect x="90" y="150" width="320" height="140" rx="4" fill="none" stroke="#27AE60" stroke-width="0.5" stroke-dasharray="4,3"/>'.
                    '<text x="250" y="185" text-anchor="middle" font-family="serif" font-size="12" fill="#27AE60" letter-spacing="2">BANQUE DU MAROC</text>'.
                    '<text x="250" y="230" text-anchor="middle" font-family="serif" font-size="42" fill="#1B5E20" font-weight="bold">100</text>'.
                    '<text x="250" y="260" text-anchor="middle" font-family="serif" font-size="14" fill="#27AE60">DIRHAMS</text>'.
                    '<circle cx="130" cy="220" r="25" fill="none" stroke="#27AE60" stroke-width="0.5" opacity="0.4"/>'.
                    '<circle cx="370" cy="220" r="25" fill="none" stroke="#27AE60" stroke-width="0.5" opacity="0.4"/>'.
                    '<text x="250" y="360" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="'.$dark.'" font-weight="bold">Billets de Collection</text>'.
                    '<text x="250" y="390" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="'.$mid.'" letter-spacing="2">HISTOIRE MONÉTAIRE DU MAROC</text>'.
                    $footer
                );

            case 'watch':
                return $this->svg($bg, $border.$header.
                    '<circle cx="250" cy="230" r="90" fill="none" stroke="#2C3E50" stroke-width="3"/>'.
                    '<circle cx="250" cy="230" r="85" fill="#F5F0E0"/>'.
                    '<circle cx="250" cy="230" r="80" fill="none" stroke="#2C3E50" stroke-width="0.8"/>'.
                    '<line x1="250" y1="155" x2="250" y2="162" stroke="#2C3E50" stroke-width="1.5"/>'.
                    '<line x1="250" y1="298" x2="250" y2="305" stroke="#2C3E50" stroke-width="1.5"/>'.
                    '<line x1="175" y1="230" x2="182" y2="230" stroke="#2C3E50" stroke-width="1.5"/>'.
                    '<line x1="318" y1="230" x2="325" y2="230" stroke="#2C3E50" stroke-width="1.5"/>'.
                    '<line x1="250" y1="230" x2="250" y2="180" stroke="#2C3E50" stroke-width="2.5"/>'.
                    '<line x1="250" y1="230" x2="285" y2="230" stroke="#D4A843" stroke-width="1.5"/>'.
                    '<circle cx="250" cy="230" r="4" fill="#2C3E50"/>'.
                    '<text x="250" y="130" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="'.$dark.'" font-weight="bold">Montres</text>'.
                    '<text x="250" y="370" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="#2C3E50">de Collection</text>'.
                    $footer
                );

            case 'jewel':
                return $this->svg($bg, $border.$header.$star.
                    '<polygon points="250,140 310,210 280,210 320,290 180,290 220,210 190,210" fill="#1ABC9C" opacity="0.15" stroke="#1ABC9C" stroke-width="1.5"/>'.
                    '<polygon points="250,160 295,220 275,220 305,280 195,280 225,220 205,220" fill="#1ABC9C" opacity="0.1"/>'.
                    '<line x1="250" y1="140" x2="250" y2="290" stroke="#1ABC9C" stroke-width="0.5" opacity="0.3"/>'.
                    '<line x1="180" y1="210" x2="320" y2="210" stroke="#1ABC9C" stroke-width="0.5" opacity="0.3"/>'.
                    '<text x="250" y="340" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="'.$dark.'" font-weight="bold">Bijoux</text>'.
                    '<text x="250" y="370" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="#1ABC9C">Artisanat Marocain</text>'.
                    $footer
                );

            case 'book':
                return $this->svg($bg, $border.$header.$star.
                    '<rect x="120" y="140" width="260" height="180" rx="4" fill="#5D4037" opacity="0.15" stroke="#5D4037" stroke-width="1.5"/>'.
                    '<rect x="130" y="150" width="240" height="160" rx="2" fill="#FFFEF8" stroke="#5D4037" stroke-width="0.5"/>'.
                    '<line x1="150" y1="180" x2="350" y2="180" stroke="#5D4037" stroke-width="0.4" opacity="0.3"/>'.
                    '<line x1="150" y1="200" x2="350" y2="200" stroke="#5D4037" stroke-width="0.4" opacity="0.3"/>'.
                    '<line x1="150" y1="220" x2="350" y2="220" stroke="#5D4037" stroke-width="0.4" opacity="0.3"/>'.
                    '<line x1="150" y1="240" x2="310" y2="240" stroke="#5D4037" stroke-width="0.4" opacity="0.3"/>'.
                    '<line x1="150" y1="260" x2="330" y2="260" stroke="#5D4037" stroke-width="0.4" opacity="0.3"/>'.
                    '<line x1="150" y1="280" x2="290" y2="280" stroke="#5D4037" stroke-width="0.4" opacity="0.3"/>'.
                    '<text x="250" y="370" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="'.$dark.'" font-weight="bold">Livres Anciens</text>'.
                    '<text x="250" y="398" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="#5D4037">Rareté &amp; Histoire</text>'.
                    $footer
                );

            default:
                return $this->svg($bg, $border.$header.$star.
                    '<rect x="150" y="150" width="200" height="140" rx="8" fill="'.$accent.'" opacity="0.12" stroke="'.$accent.'" stroke-width="1"/>'.
                    '<text x="250" y="220" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="'.$dark.'" font-weight="bold">'.$t.'</text>'.
                    '<text x="250" y="260" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="'.$accent.'" font-weight="bold">'.$p.' MAD</text>'.
                    $footer
                );
        }
    }

    private function svg(string $bg, string $content): string
    {
        return '<?xml version="1.0" encoding="UTF-8"?>'.
            '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">'.
            '<rect width="500" height="500" fill="'.$bg.'"/>'.
            $content.
            '</svg>';
    }
}
