<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Listing;
use App\Models\ListingPhoto;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ListingController extends Controller
{
    public function categories(): JsonResponse
    {
        return response()->json(
            Category::orderBy('ordre_affichage')->orderBy('nom_fr')->get()
        );
    }

    /**
     * Public seller profile: pseudo, verified badge, average rating, active listings.
     */
    public function sellerProfile(int $userId): JsonResponse
    {
        $seller = User::where('id', $userId)
            ->whereIn('role', ['vendeur', 'both'])
            ->first(['id', 'pseudo', 'prenom', 'nom', 'note_moyenne', 'statut_kyc', 'vendeur_verifie_le']);

        if (! $seller) {
            return response()->json(['message' => 'Vendeur introuvable'], 404);
        }

        $listings = Listing::where('seller_id', $userId)
            ->where('statut', 'active')
            ->with(['category:id,nom_fr,nom_ar,slug', 'photos'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'vendeur' => $seller,
            'listings' => $listings,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Listing::with(['seller:id,pseudo,nom,prenom,statut_kyc,vendeur_verifie_le', 'category:id,nom_fr,nom_ar,slug', 'photos'])
            ->where('statut', 'active');

        if ($request->category) {
            $query->where('category_id', $request->category);
        }
        if ($request->mode) {
            $query->where('mode', $request->mode);
        }
        if ($request->numero_auto) {
            $query->where('numero_auto', $request->numero_auto);
        }
        if ($request->q) {
            $query->where(function ($q) use ($request) {
                $q->where('titre', 'like', "%{$request->q}%")
                    ->orWhere('description', 'like', "%{$request->q}%")
                    ->orWhere('numero_auto', 'like', "%{$request->q}%");
            });
        }
        if ($request->prix_min) {
            $query->where('prix_actuel', '>=', $request->prix_min);
        }
        if ($request->prix_max) {
            $query->where('prix_actuel', '<=', $request->prix_max);
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $listings = $query->paginate($request->get('per_page', 20));

        return response()->json($listings);
    }

    public function show(Listing $listing): JsonResponse
    {
        $listing->load(['seller:id,pseudo,nom,prenom,statut_kyc,vendeur_verifie_le'.', category:id,nom_fr,nom_ar,slug,icon', 'photos', 'bids' => function ($q) {
            $q->with('bidder:id,pseudo')->orderByDesc('montant')->limit(10);
        }]);

        // Increment views
        $listing->increment('nb_vues');

        return response()->json($listing);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:300',
            'description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'mode' => 'required|in:enchere,achat_immediat',
            'prix_vente' => 'required|numeric|min:0',
            'frais_port' => 'nullable|numeric|min:0',
            'statut' => 'sometimes|in:brouillon,active',
            'date_publication_planifiee' => 'nullable|date|after:now',
            'photos' => 'nullable|array|max:20',
            'photos.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $total = $validated['prix_vente'] + ($validated['frais_port'] ?? 0);

        // A scheduled publication keeps the listing as a draft until its date arrives.
        $isScheduled = ! empty($validated['date_publication_planifiee']);
        $statut = $validated['statut'] ?? 'active';
        if ($isScheduled) {
            $statut = 'brouillon';
        }

        return DB::transaction(function () use ($validated, $total, $request, $statut, $isScheduled) {
            $listing = Listing::create([
                'numero_auto' => $this->generateNumero(),
                'seller_id' => $request->user()->id,
                'category_id' => $validated['category_id'],
                'titre' => $validated['titre'],
                'description' => $validated['description'],
                'prix_vente' => $validated['prix_vente'],
                'frais_port' => $validated['frais_port'] ?? 0,
                'total' => $total,
                'mode' => $validated['mode'],
                'statut' => $statut,
                'prix_actuel' => $validated['mode'] === 'enchere' ? $validated['prix_vente'] : null,
                'date_publication' => $isScheduled ? null : now(),
                'date_publication_planifiee' => $validated['date_publication_planifiee'] ?? null,
                'date_expiration' => $isScheduled ? null : now()->addDays(28),
            ]);

            // Handle photo uploads
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $index => $photo) {
                    $path = $photo->store('listings/'.$listing->id, 'public');
                    ListingPhoto::create([
                        'listing_id' => $listing->id,
                        'path' => $path,
                        'ordre' => $index,
                        'is_principale' => $index === 0,
                    ]);
                }
            }

            return response()->json($listing->load('photos'), 201);
        });
    }

    public function update(Request $request, Listing $listing): JsonResponse
    {
        if ($listing->seller_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'titre' => 'sometimes|string|max:300',
            'description' => 'sometimes|string',
            'category_id' => 'sometimes|exists:categories,id',
            'mode' => 'sometimes|in:enchere,achat_immediat',
            'prix_vente' => 'sometimes|numeric|min:0',
            'frais_port' => 'nullable|numeric|min:0',
            'date_publication_planifiee' => 'nullable|date|after:now',
        ]);

        $listing->update($validated);

        // Scheduling a publication keeps it in draft until the planned date.
        if (array_key_exists('date_publication_planifiee', $validated)) {
            if (! empty($validated['date_publication_planifiee'])) {
                $listing->update(['statut' => 'brouillon', 'date_publication' => null]);
            } else {
                $listing->update(['date_publication_planifiee' => null]);
            }
        }

        if (isset($validated['frais_port']) || isset($validated['prix_vente'])) {
            $listing->update(['total' => $listing->prix_vente + ($listing->frais_port ?? 0)]);
        }

        return response()->json($listing->fresh());
    }

    public function destroy(Request $request, Listing $listing): JsonResponse
    {
        if ($listing->seller_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($listing->statut === 'vendue') {
            return response()->json(['message' => 'Impossible de supprimer une annonce vendue'], 422);
        }

        $listing->update(['statut' => 'suspendue']);

        return response()->json(['message' => 'Annonce suspendue']);
    }

    public function myListings(Request $request): JsonResponse
    {
        $listings = Listing::where('seller_id', $request->user()->id)
            ->with(['category:id,nom_fr,nom_ar,slug', 'photos'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($listings);
    }

    protected function generateNumero(): string
    {
        $year = date('Y');
        $nextNumber = Listing::whereYear('created_at', $year)->count() + 1;

        return sprintf('COL-%s-%06d', $year, $nextNumber);
    }
}
