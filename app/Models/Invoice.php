<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_facture',
        'order_id',
        'user_id',
        'type',
        'sous_total',
        'commission',
        'total',
        'devise',
        'pdf_path',
        'telechargee',
    ];

    protected function casts(): array
    {
        return [
            'sous_total' => 'decimal:2',
            'commission' => 'decimal:2',
            'total' => 'decimal:2',
            'telechargee' => 'boolean',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function generateNumeroFacture(): string
    {
        $year = date('Y');
        $nextNumber = static::whereYear('created_at', $year)->count() + 1;

        return sprintf('FAC-%s-%06d', $year, $nextNumber);
    }
}
