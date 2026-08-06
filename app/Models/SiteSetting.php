<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        'cle',
        'valeur',
        'type',
        'groupe',
    ];

    public static function get(string $cle, mixed $default = null): mixed
    {
        $setting = static::where('cle', $cle)->first();
        if (! $setting) {
            return $default;
        }

        return match ($setting->type) {
            'boolean' => (bool) $setting->valeur,
            'integer' => (int) $setting->valeur,
            'decimal' => (float) $setting->valeur,
            'json' => json_decode($setting->valeur, true),
            default => $setting->valeur,
        };
    }

    public static function set(string $cle, mixed $valeur, string $type = 'string', string $groupe = 'general'): static
    {
        return static::updateOrCreate(
            ['cle' => $cle],
            [
                'valeur' => is_array($valeur) ? json_encode($valeur) : (string) $valeur,
                'type' => $type,
                'groupe' => $groupe,
            ]
        );
    }

    public static function getCommissionRate(): float
    {
        return (float) static::get('commission_taux', 5.0);
    }
}
