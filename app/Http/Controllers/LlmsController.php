<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Listing;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\URL;

class LlmsController extends Controller
{
    /**
     * /llms.txt — a concise, LLM-consumable overview of the marketplace.
     */
    public function index(): Response
    {
        $base = URL::to('/');

        $content = <<<TXT
# collection.ma

> collection.ma est une place de marché marocaine pour les objets de collection :
> timbres, pièces & monnaie, montres, cartes postales, figurines, livres, vinyles et plus.
> Les achats passent par un système de séquestre (escrow), chaque vente est sécurisée.

## Key pages

- [Accueil]({$base}/)
- [Parcourir la collection]({$base}/listings)
- [Catégories]({$base}/categories)
- [Comment ça marche]({$base}/comment-ca-marche)
- [Foire aux questions]({$base}/aide)
- [Conditions générales]({$base}/cgv)
- [Devenir vendeur]({$base}/devenir-vendeur)

## Optional
- Vendre un objet de collection (enchères ou achat immédiat).
- Enchères en temps réel avec contre-offres automatiques.
- Notifications email et SMS.
- Espace vendeur : gestion des annonces, ventes, factures et retraits.
- Langues : français (fr) et arabe (ar).

> Ce fichier est destiné aux modèles de langage (LLM) pour comprendre le périmètre du site.
TXT;

        return new Response($content, 200, ['Content-Type' => 'text/plain; charset=utf-8']);
    }

    /**
     * /llms-full.txt — a richer listing including live categories and a sample of listings.
     */
    public function full(): Response
    {
        $base = URL::to('/');
        $categories = Category::orderBy('ordre_affichage')->limit(40)->get()
            ->map(fn ($c) => "- {$c->nom_fr} ({$c->slug}): {$base}/categories/{$c->slug}")
            ->implode("\n");

        $featured = Listing::where('statut', 'active')
            ->with('category:id,nom_fr')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn ($l) => "- [{$l->titre}]({$base}/listings/{$l->numero_auto}) — {$l->category?->nom_fr} · {$l->prix_vente} MAD · {$l->mode}")
            ->implode("\n");

        $content = <<<TXT
# collection.ma

> Place de marché marocaine spécialisée dans les objets de collection.
> Toutes les transactions passent par un séquestre et une commission de 5 % est appliquée au vendeur.

## Categories
{$categories}

## Featured listings
{$featured}

## Key concepts
- Achats via escrow sécurisé.
- Portefeuille interne rechargé pour vos achats.
- Vendeurs vérifiés par KYC (CIN + contrat signé).
- Enchérissez en direct ou utilisez l'achat immédiat.
TXT;

        return new Response($content, 200, ['Content-Type' => 'text/plain; charset=utf-8']);
    }
}