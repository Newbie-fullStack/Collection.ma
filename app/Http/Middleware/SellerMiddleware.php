<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SellerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isVendeur()) {
            return response()->json([
                'message' => 'Accès vendeur requis. Devenez un vendeur vérifié pour accéder à cet espace.',
                'needs_vendor' => true,
            ], 403);
        }

        return $next($request);
    }
}
