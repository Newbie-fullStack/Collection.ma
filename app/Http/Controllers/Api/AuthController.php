<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'pseudo' => 'required|string|max:50|unique:users,pseudo',
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'age' => 'required|integer|min:18|max:120',
            'gsm' => 'required|string|max:20',
            'email' => 'required|email|unique:users,email',
            'adresse_exacte' => 'required|string',
            'rib' => 'nullable|string|min:24|max:34',
            'password' => ['required', 'confirmed', PasswordRule::min(8)->mixedCase()->numbers()],
            'langue_preferee' => 'in:fr,ar',
            'cgu_acceptee' => 'accepted',
        ], [
            'email.required' => 'L\'email est obligatoire',
            'email.email' => 'L\'email n\'est pas valide',
            'email.unique' => 'Cet email est déjà utilisé',
            'password.required' => 'Le mot de passe est obligatoire',
            'password.confirmed' => 'Les mots de passe ne correspondent pas',
            'password.min' => 'Le mot de passe doit contenir au moins :min caractères',
            'password.mixed' => 'Le mot de passe doit contenir des majuscules et des minuscules',
            'password.numbers' => 'Le mot de passe doit contenir au moins un chiffre',
            'cgu_acceptee.accepted' => 'Vous devez accepter les conditions générales',
            'age.min' => 'Vous devez avoir au moins 18 ans',
            'pseudo.required' => 'Le pseudo est obligatoire',
            'nom.required' => 'Le nom est obligatoire',
            'prenom.required' => 'Le prénom est obligatoire',
            'age.required' => 'L\'âge est obligatoire',
            'gsm.required' => 'Le téléphone est obligatoire',
            'adresse_exacte.required' => 'L\'adresse est obligatoire',
            'rib.min' => 'Le RIB doit contenir au moins :min caractères',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'pseudo' => $request->pseudo,
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'age' => $request->age,
            'gsm' => $request->gsm,
            'email' => $request->email,
            'adresse_exacte' => $request->adresse_exacte,
            'rib' => $request->rib,
            'password' => $request->password,
            'langue_preferee' => $request->langue_preferee ?? 'fr',
            'role' => 'acheteur',
            'cgu_acceptee_version' => '1.0',
            'cgu_acceptee_le' => now(),
            'cgu_acceptee_ip' => $request->ip(),
        ]);

        // Create wallet
        Wallet::create(['user_id' => $user->id]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants incorrects'], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Déconnecté']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $validator = Validator::make($request->all(), [
            'pseudo' => 'sometimes|string|max:50|unique:users,pseudo,'.$user->id,
            'nom' => 'sometimes|string|max:100',
            'prenom' => 'sometimes|string|max:100',
            'gsm' => 'sometimes|string|max:20',
            'adresse_exacte' => 'sometimes|string',
            'langue_preferee' => 'sometimes|in:fr,ar',
        ])->validate();

        $user->update($validated);

        return response()->json($user->fresh());
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required',
            'password' => ['required', 'confirmed', PasswordRule::min(8)->mixedCase()->numbers()],
        ]);

        if (! Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect'], 422);
        }

        $request->user()->update(['password' => $request->password]);

        return response()->json(['message' => 'Mot de passe modifié']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();
        $token = Str::random(64);

        \DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        // In production, send email with reset link
        // Mail::to($user->email)->send(new ResetPasswordMail($token, $user->email));

        return response()->json([
            'message' => 'Email de réinitialisation envoyé',
            // Dev mode: return token for testing
            'token' => $token,
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email|exists:users,email',
            'password' => ['required', 'confirmed', PasswordRule::min(8)->mixedCase()->numbers()],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $resetToken = \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (! $resetToken || ! Hash::check($request->token, $resetToken->token)) {
            return response()->json(['message' => 'Token invalide'], 422);
        }

        $user = User::where('email', $request->email)->first();
        $user->update(['password' => $request->password]);

        \DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé']);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        // Delete user's tokens
        $user->tokens()->delete();

        // Delete user's wallet transactions
        if ($user->wallet) {
            $user->wallet->transactions()->delete();
            $user->wallet->delete();
        }

        // Delete user
        $user->delete();

        return response()->json(['message' => 'Compte supprimé']);
    }
}
