<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedSearch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedSearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $searches = SavedSearch::where('user_id', $request->user()->id)
            ->with('category:id,nom_fr,nom_ar,slug')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($searches);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'mot_cle' => 'nullable|string|max:200',
            'category_id' => 'nullable|exists:categories,id',
            'prix_min' => 'nullable|numeric|min:0',
            'prix_max' => 'nullable|numeric|min:0',
            'mode' => 'nullable|in:enchere,achat_immediat',
            'alerte_active' => 'sometimes|boolean',
            'frequence_alerte' => 'sometimes|in:instantanee,quotidienne,hebdomadaire',
        ]);

        $validated['user_id'] = $request->user()->id;

        $search = SavedSearch::create($validated);

        return response()->json($search->load('category:id,nom_fr,nom_ar,slug'), 201);
    }

    public function update(Request $request, SavedSearch $savedSearch): JsonResponse
    {
        if ($savedSearch->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'mot_cle' => 'nullable|string|max:200',
            'category_id' => 'nullable|exists:categories,id',
            'prix_min' => 'nullable|numeric|min:0',
            'prix_max' => 'nullable|numeric|min:0',
            'mode' => 'nullable|in:enchere,achat_immediat',
            'alerte_active' => 'sometimes|boolean',
            'frequence_alerte' => 'sometimes|in:instantanee,quotidienne,hebdomadaire',
        ]);

        $savedSearch->update($validated);

        return response()->json($savedSearch->load('category.name'));
    }

    public function destroy(Request $request, SavedSearch $savedSearch): JsonResponse
    {
        if ($savedSearch->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $savedSearch->delete();

        return response()->json(['message' => 'Recherche supprimée']);
    }
}
