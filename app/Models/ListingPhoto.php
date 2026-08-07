<?php

namespace App\Models;

use App\Services\MediaService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'path',
        'ordre',
        'is_principale',
    ];

    protected $appends = ['url'];

    protected function casts(): array
    {
        return [
            'ordre' => 'integer',
            'is_principale' => 'boolean',
        ];
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function getUrlAttribute(): ?string
    {
        return MediaService::url($this->path);
    }
}
