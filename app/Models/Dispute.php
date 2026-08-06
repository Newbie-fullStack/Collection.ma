<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispute extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'initiator_id',
        'raison',
        'description',
        'preuves',
        'statut',
        'decision_admin',
        'remboursement_montant',
        'date_resolution',
    ];

    protected function casts(): array
    {
        return [
            'preuves' => 'array',
            'remboursement_montant' => 'decimal:2',
            'date_resolution' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function initiator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiator_id');
    }

    public function scopeOpen($query)
    {
        return $query->where('statut', 'ouverte');
    }

    public function scopeInProgress($query)
    {
        return $query->where('statut', 'en_examen');
    }
}
