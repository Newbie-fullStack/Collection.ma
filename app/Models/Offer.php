<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Offer extends Model
{
    use HasFactory;

    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_ACCEPTEE = 'acceptee';
    public const STATUT_REFUSEE = 'refusee';
    public const STATUT_ANNULEE = 'annulee';

    protected $fillable = [
        'listing_id',
        'buyer_id',
        'seller_id',
        'montant',
        'message',
        'statut',
        'date_traitement',
    ];

    protected function casts(): array
    {
        return [
            'montant' => 'decimal:2',
            'date_traitement' => 'datetime',
        ];
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function scopePending($query)
    {
        return $query->where('statut', self::STATUT_EN_ATTENTE);
    }
}