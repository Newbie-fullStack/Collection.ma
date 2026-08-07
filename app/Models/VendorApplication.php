<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorApplication extends Model
{
    use HasFactory;

    public const STATUT_EN_ATTENTE = 'en_attente';

    public const STATUT_COMPLEMENT = 'complement_demande';

    public const STATUT_VALIDE = 'valide';

    public const STATUT_REFUSE = 'refuse';

    protected $fillable = [
        'user_id',
        'date_naissance',
        'adresse_confirmee',
        'cin_recto',
        'cin_recto_mime',
        'cin_verso',
        'cin_verso_mime',
        'rib',
        'contrat_pdf_genere',
        'contrat_mime',
        'version_cgv',
        'date_generation',
        'contrat_signe',
        'contrat_signe_mime',
        'statut',
        'motif_refus',
        'message_complement',
        'date_soumission',
        'date_traitement',
        'traite_par',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'date_generation' => 'datetime',
        'date_soumission' => 'datetime',
        'date_traitement' => 'datetime',
        'rib' => 'encrypted',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function traitant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'traite_par');
    }
}
