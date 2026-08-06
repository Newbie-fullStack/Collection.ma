<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $year = date('Y');
        $num = fake()->unique()->numberBetween(1, 999999);

        return [
            'numero_commande' => sprintf('ORD-%s-%06d', $year, $num),
            'listing_id' => 1,
            'buyer_id' => User::factory(),
            'seller_id' => User::factory(),
            'prix' => fake()->randomFloat(2, 10, 5000),
            'frais_port' => fake()->randomFloat(2, 0, 100),
            'commission_montant' => 0,
            'commission_taux' => 5.00,
            'total' => fake()->randomFloat(2, 10, 5100),
            'statut' => 'attente_paiement',
        ];
    }
}
