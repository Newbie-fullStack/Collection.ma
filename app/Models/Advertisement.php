<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'image_path',
        'lien',
        'position',
        'largeur',
        'hauteur',
        'date_debut',
        'date_fin',
        'active',
        'nb_impressions',
        'nb_clics',
    ];

    protected function casts(): array
    {
        return [
            'largeur' => 'integer',
            'hauteur' => 'integer',
            'date_debut' => 'datetime',
            'date_fin' => 'datetime',
            'active' => 'boolean',
            'nb_impressions' => 'integer',
            'nb_clics' => 'integer',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('active', true)
            ->where(function ($q) {
                $q->whereNull('date_debut')->orWhere('date_debut', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('date_fin')->orWhere('date_fin', '>=', now());
            });
    }

    public function scopeForPosition($query, string $position)
    {
        return $query->where('position', $position);
    }
}
