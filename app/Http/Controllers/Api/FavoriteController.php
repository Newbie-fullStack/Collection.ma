<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\FavoriteFolder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = Favorite::where('user_id', $request->user()->id)
            ->with('listing:numero_auto,titre,prix_actuel,mode,statut,date_expiration')
            ->with('folder:id,nom')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($favorites);
    }

    public function folders(Request $request): JsonResponse
    {
        $folders = FavoriteFolder::where('user_id', $request->user()->id)
            ->withCount('favorites')
            ->orderBy('ordre')
            ->get();

        return response()->json($folders);
    }

    public function storeFolder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['ordre'] = FavoriteFolder::where('user_id', $request->user()->id)->max('ordre') + 1;

        $folder = FavoriteFolder::create($validated);

        return response()->json($folder, 201);
    }

    public function destroyFolder(Request $request, FavoriteFolder $folder): JsonResponse
    {
        if ($folder->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Favorites become uncategorized (folder_id → null) rather than deleted.
        Favorite::where('folder_id', $folder->id)->update(['folder_id' => null]);
        $folder->delete();

        return response()->json(['message' => 'Dossier supprimé']);
    }

    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'folder_id' => 'nullable|exists:favorite_folders,id',
        ]);

        $existing = Favorite::where('user_id', $request->user()->id)
            ->where('listing_id', $validated['listing_id'])
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json(['favori' => false]);
        }

        Favorite::create([
            'user_id' => $request->user()->id,
            'listing_id' => $validated['listing_id'],
            'folder_id' => $validated['folder_id'] ?? null,
        ]);

        return response()->json(['favori' => true]);
    }
}
