<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\Category;
use App\Models\Dispute;
use App\Models\Invoice;
use App\Models\Listing;
use App\Models\Order;
use App\Models\SiteSetting;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // Admin check is applied via route middleware in routes/api.php

    public function dashboard(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'utilisateurs' => User::count(),
                'vendeurs' => User::whereIn('role', ['vendeur', 'both'])->count(),
                'annonces_actives' => Listing::where('statut', 'active')->count(),
                'annonces_vendues' => Listing::where('statut', 'vendue')->count(),
                'commandes_en_cours' => Order::whereIn('statut', ['sequestre', 'expedie'])->count(),
                'litiges_ouverts' => Dispute::whereIn('statut', ['ouverte', 'en_examen'])->count(),
                'ca_total' => Order::where('statut', 'vire_vendeur')->sum('commission_montant'),
                'en_attente_virement' => Wallet::sum('solde_disponible'),
            ],
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::withCount(['listings', 'sellerOrders']);

        if ($request->role) {
            $query->where('role', $request->role);
        }
        if ($request->q) {
            $query->where(function ($q) use ($request) {
                $q->where('pseudo', 'like', "%{$request->q}%")
                    ->orWhere('email', 'like', "%{$request->q}%")
                    ->orWhere('nom', 'like', "%{$request->q}%");
            });
        }

        return response()->json($query->orderByDesc('created_at')->paginate(30));
    }

    public function toggleUserStatus(Request $request, User $user): JsonResponse
    {
        $newStatus = $user->statut_kyc === 'verifie' ? 'non_verifie' : 'verifie';
        $user->update(['statut_kyc' => $newStatus]);

        return response()->json($user->fresh());
    }

    public function suspendUser(Request $request, User $user): JsonResponse
    {
        $user->update(['statut_kyc' => 'rejete']);

        return response()->json($user->fresh());
    }

    public function listings(Request $request): JsonResponse
    {
        $query = Listing::with(['seller:pseudo', 'category:nom_fr']);

        if ($request->statut) {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->orderByDesc('created_at')->paginate(30));
    }

    public function approveListing(Request $request, Listing $listing): JsonResponse
    {
        $listing->update(['statut' => 'active']);

        return response()->json($listing->fresh());
    }

    public function suspendListing(Request $request, Listing $listing): JsonResponse
    {
        $listing->update(['statut' => 'suspendue']);

        return response()->json($listing->fresh());
    }

    public function categories(): JsonResponse
    {
        return response()->json(Category::orderBy('ordre_affichage')->get());
    }

    public function updateCategory(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'nom_fr' => 'sometimes|string',
            'nom_ar' => 'sometimes|string',
            'active' => 'sometimes|boolean',
        ]);

        $category->update($validated);

        return response()->json($category->fresh());
    }

    public function advertisements(): JsonResponse
    {
        return response()->json(Advertisement::orderByDesc('created_at')->get());
    }

    public function storeAdvertisement(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titre' => 'required|string',
            'image' => 'required|image|max:2048',
            'lien' => 'nullable|url',
            'position' => 'required|in:top_gauche,top_droite,bottom_gauche,bottom_droite',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
        ]);

        $path = $request->file('image')->store('advertisements', 'public');

        $ad = Advertisement::create([
            'titre' => $validated['titre'],
            'image_path' => $path,
            'lien' => $validated['lien'] ?? null,
            'position' => $validated['position'],
            'date_debut' => $validated['date_debut'] ?? null,
            'date_fin' => $validated['date_fin'] ?? null,
        ]);

        return response()->json($ad, 201);
    }

    public function commissions(): JsonResponse
    {
        return response()->json([
            'taux' => SiteSetting::getCommissionRate(),
        ]);
    }

    public function updateCommission(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'taux' => 'required|numeric|min:0|max:50',
        ]);

        SiteSetting::set('commission_taux', $validated['taux'], 'decimal', 'finance');

        return response()->json(['taux' => $validated['taux']]);
    }

    public function disputes(Request $request): JsonResponse
    {
        $query = Dispute::with(['order:numero_commande', 'initiator:pseudo']);

        if ($request->statut) {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->orderByDesc('created_at')->paginate(30));
    }

    public function resolveDispute(Request $request, Dispute $dispute): JsonResponse
    {
        $validated = $request->validate([
            'decision' => 'required|in:acheteur,vendeur',
            'remboursement_montant' => 'nullable|numeric|min:0',
        ]);

        $newStatut = $validated['decision'] === 'acheteur' ? 'resolue_acheteur' : 'resolue_vendeur';

        $dispute->update([
            'statut' => $newStatut,
            'decision_admin' => $validated['decision'],
            'remboursement_montant' => $validated['remboursement_montant'] ?? null,
            'date_resolution' => now(),
        ]);

        return response()->json($dispute->fresh());
    }

    public function invoices(Request $request): JsonResponse
    {
        $query = Invoice::with(['order:numero_commande', 'user:pseudo,email']);

        if ($request->type) {
            $query->where('type', $request->type);
        }

        return response()->json($query->orderByDesc('created_at')->paginate(30));
    }

    /**
     * Advanced analytics: time-series of sales & commissions plus key breakdowns.
     * Period filter: '7d' | '30d' | '90d' | '12m' (default 30d).
     */
    public function analytics(Request $request): JsonResponse
    {
        $period = $request->get('period', '30d');

        $range = match ($period) {
            '7d' => now()->subDays(7),
            '90d' => now()->subDays(90),
            '12m' => now()->subMonths(12),
            default => now()->subDays(30),
        };

        // Daily sales & commissions over the window.
        $salesSeries = Order::where('statut', 'vire_vendeur')
            ->where('orders.created_at', '>=', $range)
            ->selectRaw('DATE(orders.created_at) as jour, SUM(orders.total) as ventes, SUM(orders.commission_montant) as commissions, COUNT(*) as commandes')
            ->groupBy('jour')
            ->orderBy('jour')
            ->get();

        // Sales by category (top sellers).
        $byCategory = Order::where('orders.created_at', '>=', $range)
            ->join('listings', 'listings.id', '=', 'orders.listing_id')
            ->join('categories', 'categories.id', '=', 'listings.category_id')
            ->selectRaw('categories.nom_fr, COUNT(*) as commandes, SUM(orders.total) as ca')
            ->groupBy('categories.id', 'categories.nom_fr')
            ->orderByDesc('ca')
            ->limit(10)
            ->get();

        // Top sellers by revenue.
        $topSellers = Order::where('orders.created_at', '>=', $range)
            ->join('listings', 'listings.id', '=', 'orders.listing_id')
            ->join('users', 'users.id', '=', 'listings.seller_id')
            ->selectRaw('users.pseudo, COUNT(*) as commandes, SUM(orders.total) as ca')
            ->groupBy('users.id', 'users.pseudo')
            ->orderByDesc('ca')
            ->limit(10)
            ->get();

        return response()->json([
            'periode' => $period,
            'series' => $salesSeries,
            'par_categorie' => $byCategory,
            'top_vendeurs' => $topSellers,
        ]);
    }
}
