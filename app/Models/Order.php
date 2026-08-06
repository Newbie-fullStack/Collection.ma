<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_commande',
        'listing_id',
        'buyer_id',
        'seller_id',
        'prix',
        'frais_port',
        'commission_montant',
        'commission_taux',
        'total',
        'statut',
        'tracking_number',
        'transporteur',
        'date_expedition',
        'date_confirmation_limite',
        'date_confirmation',
        'date_virement',
    ];

    protected function casts(): array
    {
        return [
            'prix' => 'decimal:2',
            'frais_port' => 'decimal:2',
            'commission_montant' => 'decimal:2',
            'commission_taux' => 'decimal:2',
            'total' => 'decimal:2',
            'date_expedition' => 'datetime',
            'date_confirmation_limite' => 'datetime',
            'date_confirmation' => 'datetime',
            'date_virement' => 'datetime',
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

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function dispute(): HasOne
    {
        return $this->hasOne(Dispute::class);
    }

    public function generateNumeroCommande(): string
    {
        $year = date('Y');
        $nextNumber = static::whereYear('created_at', $year)->count() + 1;

        return sprintf('ORD-%s-%06d', $year, $nextNumber);
    }

    public function scopeAwaitingPayment($query)
    {
        return $query->where('statut', 'attente_paiement');
    }

    public function scopeInEscrow($query)
    {
        return $query->where('statut', 'sequestre');
    }

    public function scopeShipped($query)
    {
        return $query->where('statut', 'expedie');
    }
}
