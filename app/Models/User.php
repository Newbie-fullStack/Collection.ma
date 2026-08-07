<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'pseudo',
        'nom',
        'prenom',
        'age',
        'gsm',
        'email',
        'adresse_exacte',
        'rib',
        'role',
        'statut_kyc',
        'note_moyenne',
        'langue_preferee',
        'cgu_acceptee_version',
        'cgu_acceptee_le',
        'cgu_acceptee_ip',
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'vendeur_verifie_le',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected $appends = ['est_verifie'];

    protected function casts(): array
    {
        return [
            'age' => 'integer',
            'rib' => 'encrypted',
            'note_moyenne' => 'decimal:2',
            'email_verified_at' => 'datetime',
            'cgu_acceptee_le' => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'vendeur_verifie_le' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // --- Relationships ---

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class, 'seller_id');
    }

    public function bids(): HasMany
    {
        return $this->hasMany(Bid::class, 'bidder_id');
    }

    public function buyerOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    public function sellerOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'seller_id');
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedReviews(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewed_id');
    }

    public function givenReviews(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class, 'initiator_id');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function savedSearches(): HasMany
    {
        return $this->hasMany(SavedSearch::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function vendorApplications(): HasMany
    {
        return $this->hasMany(VendorApplication::class);
    }

    public function offersMade(): HasMany
    {
        return $this->hasMany(Offer::class, 'buyer_id');
    }

    public function offersReceived(): HasMany
    {
        return $this->hasMany(Offer::class, 'seller_id');
    }

    // --- Helpers ---

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isVendeur(): bool
    {
        return in_array($this->role, ['vendeur', 'both']);
    }

    public function isAcheteur(): bool
    {
        return in_array($this->role, ['acheteur', 'both']);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->prenom} {$this->nom}";
    }

    /**
     * Whether this user has completed reinforced KYC (verified vendor).
     */
    public function getEstVerifieAttribute(): bool
    {
        return $this->statut_kyc === 'verifie' && $this->vendeur_verifie_le !== null;
    }
}
