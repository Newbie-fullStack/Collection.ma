<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Listing extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'numero_auto',
        'seller_id',
        'category_id',
        'titre',
        'description',
        'prix_vente',
        'frais_port',
        'total',
        'mode',
        'statut',
        'prix_actuel',
        'date_publication',
        'date_expiration',
        'date_publication_planifiee',
        'nb_republications',
        'extensions_anti_snipe',
        'nb_vues',
        'nb_favoris',
    ];

    protected function casts(): array
    {
        return [
            'prix_vente' => 'decimal:2',
            'frais_port' => 'decimal:2',
            'total' => 'decimal:2',
            'prix_actuel' => 'decimal:2',
            'date_publication' => 'datetime',
            'date_expiration' => 'datetime',
            'date_publication_planifiee' => 'datetime',
            'nb_republications' => 'integer',
            'extensions_anti_snipe' => 'integer',
            'nb_vues' => 'integer',
            'nb_favoris' => 'integer',
        ];
    }

    // --- Relationships ---

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(ListingPhoto::class)->orderBy('ordre');
    }

    public function bids(): HasMany
    {
        return $this->hasMany(Bid::class)->orderByDesc('montant');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function winningBid(): HasOne
    {
        return $this->hasOne(Bid::class)->where('statut', 'gagnee');
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
    }

    // --- Scopes ---

    public function scopeActive($query)
    {
        return $query->where('statut', 'active');
    }

    public function scopeEncheres($query)
    {
        return $query->where('mode', 'enchere');
    }

    public function scopeAchatImmadiat($query)
    {
        return $query->where('mode', 'achat_immediat');
    }

    public function scopeExpired($query)
    {
        return $query->where('date_expiration', '<=', now())->where('statut', 'active');
    }

    // --- Helpers ---

    public function generateNumeroAuto(): string
    {
        $year = date('Y');
        $nextNumber = static::whereYear('created_at', $year)->max('id') ?? 0;

        return sprintf('COL-%s-%06d', $year, $nextNumber + 1);
    }

    public function isEnchere(): bool
    {
        return $this->mode === 'enchere';
    }

    public function isExpired(): bool
    {
        return $this->date_expiration && $this->date_expiration->isPast();
    }

    public function getRemainingTimeAttribute(): ?array
    {
        if (! $this->date_expiration || $this->isExpired()) {
            return null;
        }
        $diff = now()->diff($this->date_expiration);

        return [
            'jours' => $diff->days,
            'heures' => $diff->h,
            'minutes' => $diff->i,
        ];
    }

    public function resolveRouteBinding(mixed $value, $field = null): ?Model
    {
        $query = static::query();

        if (is_numeric($value) || ctype_digit((string) $value)) {
            $query->where('id', (int) $value);
        } else {
            $query->where('numero_auto', $value);
        }

        return $query->first();
    }
}
