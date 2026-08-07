<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bid extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'bidder_id',
        'montant',
        'auto_bid_max',
        'is_auto_bid',
        'statut',
        'suspect',
        'motif_suspect',
    ];

    protected function casts(): array
    {
        return [
            'montant' => 'decimal:2',
            'auto_bid_max' => 'decimal:2',
            'is_auto_bid' => 'boolean',
            'suspect' => 'boolean',
        ];
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function bidder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'bidder_id');
    }

    public function scopeActive($query)
    {
        return $query->where('statut', 'active');
    }

    public function scopeWinning($query)
    {
        return $query->where('statut', 'gagnee');
    }
}
