<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'solde',
        'solde_disponible',
        'solde_en_attente',
        'devise',
    ];

    protected function casts(): array
    {
        return [
            'solde' => 'decimal:2',
            'solde_disponible' => 'decimal:2',
            'solde_en_attente' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class)->orderByDesc('created_at');
    }

    public function credit(float $montant, string $type, ?int $orderId = null, string $description = ''): WalletTransaction
    {
        $this->increment('solde', $montant);
        $this->increment('solde_disponible', $montant);

        return $this->transactions()->create([
            'order_id' => $orderId,
            'type' => $type,
            'montant' => $montant,
            'description' => $description,
            'statut' => 'complete',
        ]);
    }

    public function debit(float $montant, string $type, ?int $orderId = null, string $description = ''): WalletTransaction
    {
        $this->decrement('solde', $montant);
        $this->decrement('solde_disponible', $montant);

        return $this->transactions()->create([
            'order_id' => $orderId,
            'type' => $type,
            'montant' => -$montant,
            'description' => $description,
            'statut' => 'complete',
        ]);
    }
}
