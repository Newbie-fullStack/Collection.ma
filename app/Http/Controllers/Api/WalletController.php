<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WalletController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['solde' => 0, 'solde_disponible' => 0, 'solde_en_attente' => 0]
        );

        return response()->json($wallet);
    }

    public function transactions(Request $request): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->firstOrFail();

        $transactions = $wallet->transactions()
            ->with('order:numero_commande')
            ->orderByDesc('created_at')
            ->paginate(30);

        return response()->json($transactions);
    }

    public function topup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:10|max:100000',
        ]);

        $amount = round($validated['amount'], 2);

        // Non-wallet driver (CMI) → create the gateway deposit request (returns redirect/ref).
        if (PaymentService::driver() !== 'wallet') {
            $result = PaymentService::createDeposit($request->user()->id, $amount);

            return response()->json([
                'message' => 'Redirection vers le paiement',
                'reference' => $result['reference'],
                'mode' => $result['mode'],
                'montant' => $amount,
            ]);
        }

        $reference = PaymentService::createDeposit($request->user()->id, $amount)['reference'];

        return DB::transaction(function () use ($request, $amount, $reference) {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $request->user()->id],
                ['solde' => 0, 'solde_disponible' => 0, 'solde_en_attente' => 0]
            );

            $wallet->credit($amount, 'depot', null, "Dépôt via {$reference}");

            // In production: integrate payment gateway (Stripe, etc.)
            // For now, simulate instant top-up

            return response()->json([
                'message' => 'Dépôt effectué',
                'reference' => $reference,
                'montant' => $amount,
                'nouveau_solde' => $wallet->fresh()->solde,
            ]);
        });
    }

    public function requestWithdrawal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:50|max:100000',
        ]);

        $user = $request->user();
        $amount = round($validated['amount'], 2);

        if (! $user->rib) {
            return response()->json(['message' => 'Veuillez ajouter votre RIB dans les paramètres'], 422);
        }

        $wallet = Wallet::where('user_id', $user->id)->first();

        if (! $wallet || $wallet->solde_disponible < $amount) {
            return response()->json(['message' => 'Solde insuffisant'], 422);
        }

        return DB::transaction(function () use ($user, $wallet, $amount) {
            // Hold the requested amount: remove from available, park it pending admin review.
            $wallet->decrement('solde_disponible', $amount);
            $wallet->increment('solde_en_attente', $amount);

            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'retrait',
                'montant' => -$amount,
                'description' => "Demande de retrait vers {$user->rib} - En attente de traitement",
                'statut' => 'en_attente',
            ]);

            return response()->json([
                'message' => 'Demande de retrait envoyée',
                'montant' => $amount,
            ]);
        });
    }

    public function withdrawals(Request $request): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->firstOrFail();

        $withdrawals = $wallet->transactions()
            ->where('type', 'retrait')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($withdrawals);
    }
}
