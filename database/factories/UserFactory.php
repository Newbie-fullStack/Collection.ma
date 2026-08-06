<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'pseudo' => fake()->unique()->userName(),
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'age' => fake()->numberBetween(18, 80),
            'gsm' => fake()->numerify('06########'),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'adresse_exacte' => fake()->address(),
            'role' => 'both',
            'statut_kyc' => 'non_verifie',
            'note_moyenne' => 0,
            'langue_preferee' => 'fr',
            'cgu_acceptee_version' => '1.0',
            'cgu_acceptee_le' => now(),
            'cgu_acceptee_ip' => '127.0.0.1',
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
