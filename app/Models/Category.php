<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom_fr',
        'nom_ar',
        'slug',
        'icon',
        'ordre_affichage',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'ordre_affichage' => 'integer',
            'active' => 'boolean',
        ];
    }

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }

    public function getNameAttribute(): string
    {
        return app()->getLocale() === 'ar' ? $this->nom_ar : $this->nom_fr;
    }
}
