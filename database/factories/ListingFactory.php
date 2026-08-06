<?php

namespace Database\Factories;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Listing>
 */
class ListingFactory extends Factory
{
    protected $model = Listing::class;

    public function definition(): array
    {
        $year = date('Y');
        $num = fake()->unique()->numberBetween(1, 999999);

        return [
            'numero_auto' => sprintf('COL-%s-%06d', $year, $num),
            'seller_id' => User::factory(),
            'category_id' => 1,
            'titre' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'prix_vente' => fake()->randomFloat(2, 10, 5000),
            'frais_port' => fake()->randomFloat(2, 0, 100),
            'total' => fake()->randomFloat(2, 10, 5100),
            'mode' => 'enchere',
            'statut' => 'active',
            'prix_actuel' => fake()->randomFloat(2, 10, 5000),
            'date_publication' => now(),
            'date_expiration' => now()->addDays(28),
            'nb_republications' => 0,
            'nb_vues' => 0,
            'nb_favoris' => 0,
        ];
    }

    public function achatImmadiat(): static
    {
        return $this->state(fn (array $attributes) => [
            'mode' => 'achat_immediat',
            'prix_actuel' => null,
        ]);
    }

    public function brouillon(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'brouillon',
        ]);
    }
}
