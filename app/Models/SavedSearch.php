<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedSearch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nom',
        'mot_cle',
        'category_id',
        'prix_min',
        'prix_max',
        'mode',
        'alerte_active',
        'frequence_alerte',
    ];

    protected function casts(): array
    {
        return [
            'prix_min' => 'decimal:2',
            'prix_max' => 'decimal:2',
            'alerte_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
