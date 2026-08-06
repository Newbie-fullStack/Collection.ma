<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = Favorite::where('user_id', $request->user()->id)
            ->with('listing:numero_auto,titre,prix_actuel,mode,statut,date_expiration')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($favorites);
    }

    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'listing_id' => 'required|exists:listings,id',
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
        ]);

        return response()->json(['favori' => true]);
    }
}
