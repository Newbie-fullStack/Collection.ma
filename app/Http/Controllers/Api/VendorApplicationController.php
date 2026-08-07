<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VendorApplication;
use App\Services\NotificationsService;
use App\Services\SimplePdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class VendorApplicationController extends Controller
{
    private const MAX_SIZE_KB = 5120; // 5 Mo

    private const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf'];

    private const DOC_TYPES = [
        'cin_recto' => 'cin_recto_mime',
        'cin_verso' => 'cin_verso_mime',
        'contrat_signe' => 'contrat_signe_mime',
    ];

    /**
     * Download the current generated seller contract (achter-level, pre-signature).
     */
    public function contract(Request $request): Response
    {
        $app = VendorApplication::where('user_id', $request->user()->id)->orderByDesc('id')->first();

        $lines = [
            'CONTRAT VENDEUR Collection.ma - Version CGV '.($app?->version_cgv ?? '1.0'),
            '',
            "Entre la plateforme Collection.ma et l'utilisateur / vendeur :",
            'Pseudo : '.$request->user()->pseudo.'   Nom : '.$request->user()->full_name,
            '',
            'CONDITIONS GÉNÉRALES DE VENTE (CGV)',
            '1. Commission plateforme : 5% du prix de vente.',
            '2. Séquestre : les fonds de chaque vente sont placés en séquestre',
            "   jusqu'à confirmation de réception par l'acheteur.",
            '3. Délais de virement : virement au vendeur sous 24-72h après',
            '   confirmation de réception.',
            "4. Obligations d'expédition : expédier sous 48h dès commande, avec",
            '   numéro de suivi. Retard = litige possible.',
            "5. Politique de litige : litiges traités par l'administration sur",
            "   preuves d'expédition et de réception.",
            '6. Les présentes CGV sont acceptées par signature du contrat.',
            '',
            'Date de génération : '.now()->format('d/m/Y H:i'),
        ];

        $builder = new SimplePdf;
        $y = 760;
        foreach ($lines as $i => $line) {
            $size = ($i === 0 || $i === 5) ? 16 : 11;
            $builder->addLine($line, $size, 50, $y);
            $y -= (($i === 0 || $i === 5) ? 26 : 17);
        }
        $pdf = $builder->output();

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="contrat-vendeur.pdf"',
        ]);
    }

    /**
     * Store a new vendor application (multipart).
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isVendeur()) {
            return response()->json(['message' => 'Vous êtes déjà vendeur'], 422);
        }

        $open = VendorApplication::where('user_id', $user->id)
            ->whereIn('statut', [VendorApplication::STATUT_EN_ATTENTE, VendorApplication::STATUT_COMPLEMENT])
            ->exists();

        if ($open && $request->boolean('resubmit') !== true) {
            return response()->json(['message' => 'Une demande est déjà en cours de traitement'], 422);
        }

        $validated = $request->validate([
            'date_naissance' => 'required|date|before:'.now()->subYears(18)->toDateString(),
            'adresse_confirmee' => 'required|string|max:255',
            'rib' => 'required|string|min:24|max:34',
            'cin_recto' => 'required|file|max:'.self::MAX_SIZE_KB,
            'cin_verso' => 'required|file|max:'.self::MAX_SIZE_KB,
            'contrat_signe' => 'required|file|max:'.self::MAX_SIZE_KB,
        ]);

        foreach (['cin_recto', 'cin_verso', 'contrat_signe'] as $field) {
            $mime = $request->file($field)->getMimeType();
            if (! in_array($mime, self::ALLOWED_MIME)) {
                return response()->json(['errors' => [$field => ['Format non autorisé (jpg, png, pdf uniquement)']]], 422);
            }
        }

        $app = new VendorApplication([
            'user_id' => $user->id,
            'date_naissance' => $validated['date_naissance'],
            'adresse_confirmee' => $validated['adresse_confirmee'],
            'rib' => $validated['rib'],
            'statut' => VendorApplication::STATUT_EN_ATTENTE,
            'date_soumission' => now(),
        ]);

        $app->cin_recto = $request->file('cin_recto')->get();
        $app->cin_recto_mime = $request->file('cin_recto')->getMimeType();
        $app->cin_verso = $request->file('cin_verso')->get();
        $app->cin_verso_mime = $request->file('cin_verso')->getMimeType();
        $app->contrat_signe = $request->file('contrat_signe')->get();
        $app->contrat_signe_mime = $request->file('contrat_signe')->getMimeType();

        $app->version_cgv = '1.0';
        $app->date_generation = now();
        $app->save();

        return response()->json($app->only(['id', 'statut', 'date_soumission']), 201);
    }

    /**
     * Allow a refused user to submit a fresh application.
     */
    public function resubmit(Request $request, VendorApplication $vendorApplication): JsonResponse
    {
        if ($vendorApplication->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        if ($vendorApplication->statut !== VendorApplication::STATUT_REFUSE) {
            return response()->json(['message' => 'Impossible de resoumettre cette demande'], 422);
        }

        $vendorApplication->update([
            'statut' => VendorApplication::STATUT_EN_ATTENTE,
            'motif_refus' => null,
            'date_soumission' => now(),
        ]);

        return response()->json($vendorApplication->only(['id', 'statut']));
    }

    /**
     * Current user's latest application.
     */
    public function me(Request $request): JsonResponse
    {
        $app = VendorApplication::where('user_id', $request->user()->id)
            ->orderByDesc('id')
            ->first();

        if (! $app) {
            return response()->json(null);
        }

        return response()->json([
            'id' => $app->id,
            'statut' => $app->statut,
            'motif_refus' => $app->motif_refus,
            'message_complement' => $app->message_complement,
            'date_soumission' => $app->date_soumission,
            'date_traitement' => $app->date_traitement,
        ]);
    }

    // ── Admin ─────────────────────────────────────────────

    public function adminIndex(Request $request): JsonResponse
    {
        $apps = VendorApplication::query()
            ->with('user:id,pseudo,nom,prenom,email,role,statut_kyc')
            ->when($request->statut, fn (Builder $q) => $q->where('statut', $request->statut))
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($apps);
    }

    public function adminShow(Request $request, VendorApplication $vendorApplication): JsonResponse
    {
        return response()->json($vendorApplication->load('user:id,pseudo,nom,prenom,email,role,statut_kyc,vendeur_verifie_le'));
    }

    /**
     * Stream a document (owner/admin only). Returns binary, never a permanent URL.
     */
    public function adminDocument(Request $request, VendorApplication $vendorApplication, string $type): Response|JsonResponse
    {
        if (! in_array($type, array_keys(self::DOC_TYPES))) {
            return response()->json(['message' => 'Type de document inconnu'], 404);
        }

        $blob = $vendorApplication->{$type};
        $mime = $vendorApplication->{self::DOC_TYPES[$type]} ?? 'application/pdf';

        if (! $blob) {
            return response()->json(['message' => 'Document indisponible'], 404);
        }

        return response($blob, 200, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="'.$type.'.'.($mime === 'application/pdf' ? 'pdf' : 'jpg').'"',
        ]);
    }

    public function adminContractDownload(Request $request, VendorApplication $vendorApplication): Response|JsonResponse
    {
        if (! $vendorApplication->contrat_pdf_genere) {
            return response()->json(['message' => 'Contrat non généré'], 404);
        }

        return response($vendorApplication->contrat_pdf_genere, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="contrat-vendeur-'.$vendorApplication->id.'.pdf"',
        ]);
    }

    public function approve(Request $request, VendorApplication $vendorApplication): JsonResponse
    {
        if ($vendorApplication->statut === VendorApplication::STATUT_VALIDE) {
            return response()->json(['message' => 'Demande déjà approuvée'], 422);
        }

        $user = $vendorApplication->user;
        $newRole = $user->isAcheteur() ? 'both' : 'vendeur';

        $user->update([
            'role' => $newRole,
            'statut_kyc' => 'verifie',
            'vendeur_verifie_le' => now(),
        ]);

        $vendorApplication->update([
            'statut' => VendorApplication::STATUT_VALIDE,
            'date_traitement' => now(),
            'motif_refus' => null,
            'traite_par' => $request->user()->id,
        ]);

        NotificationsService::notify(
            $user,
            'vendor_approved',
            'Votre demande vendeur a été approuvée. Votre espace vendeur est actif.',
            'تمت الموافقة على طلب بيعك. مساحة البائع متاحة الآن.',
            'Votre demande vendeur a été approuvée. Votre espace vendeur est actif.',
            'تمت الموافقة على طلب بيعك. مساحة البائع متاحة الآن.',
            '/vendeur'
        );

        return response()->json(['message' => 'Demande approuvée', 'user_role' => $newRole]);
    }

    public function reject(Request $request, VendorApplication $vendorApplication): JsonResponse
    {
        $validated = $request->validate([
            'motif' => 'required|string|max:500',
        ]);

        $vendorApplication->update([
            'statut' => VendorApplication::STATUT_REFUSE,
            'motif_refus' => $validated['motif'],
            'date_traitement' => now(),
            'traite_par' => $request->user()->id,
        ]);

        NotificationsService::notify(
            $vendorApplication->user,
            'vendor_rejected',
            'Votre demande vendeur a été refusée.',
            'تم رفض طلب بيعك.',
            'Votre demande vendeur a été refusée. Motif : '.$validated['motif'].'. Vous pouvez soumettre une nouvelle demande.',
            'تم رفض طلب بيعك. السبب: '.$validated['motif'].'. يمكنك إعادة التقديم.',
            '/mon-compte/devenir-vendeur'
        );

        return response()->json(['message' => 'Demande refusée']);
    }

    public function requestComplement(Request $request, VendorApplication $vendorApplication): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:500',
        ]);

        $vendorApplication->update([
            'statut' => VendorApplication::STATUT_COMPLEMENT,
            'message_complement' => $validated['message'],
            'traite_par' => $request->user()->id,
        ]);

        NotificationsService::notify(
            $vendorApplication->user,
            'vendor_complement',
            'Votre demande vendeur nécessite un complément.',
            'طلبك يتطلب استكمال.',
            'Votre demande vendeur nécessite un complément : '.$validated['message'],
            'طلبك يتطلب استكمال: '.$validated['message'],
            '/mon-compte/devenir-vendeur'
        );

        return response()->json(['message' => 'Complément demandé']);
    }
}
