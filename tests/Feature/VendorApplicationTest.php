<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VendorApplication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class VendorApplicationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(['CategorySeeder', 'SiteSettingsSeeder']);
    }

    private function buyer(): User
    {
        return User::factory()->create(['role' => 'acheteur', 'statut_kyc' => 'non_verifie']);
    }

    public function test_register_assigns_role_acheteur_by_default(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'pseudo' => 'clientdef',
            'nom' => 'Cl',
            'prenom' => 'Defaut',
            'age' => 25,
            'gsm' => '0612345678',
            'email' => 'clientdef@example.com',
            'adresse_exacte' => 'Casablanca',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'cgu_acceptee' => true,
        ]);

        $response->assertStatus(201);
        $this->assertEquals('acheteur', $response->json('user.role'));
    }

    public function test_acheteur_cannot_access_seller_routes(): void
    {
        $user = $this->buyer();

        $response = $this->actingAs($user)->getJson('/api/seller-stats');

        $response->assertStatus(403);
    }

    public function test_acheteur_cannot_create_listing(): void
    {
        $user = $this->buyer();

        $response = $this->actingAs($user)->postJson('/api/listings', [
            'titre' => 'Test',
            'description' => 'Test',
            'category_id' => 1,
            'mode' => 'achat_immediat',
            'prix_vente' => 100,
        ]);

        $response->assertStatus(403)
            ->assertJson(['needs_vendor' => true]);
    }

    public function test_submit_vendor_application_with_documents(): void
    {
        $user = $this->buyer();

        $response = $this->actingAs($user)->post('/api/vendor-applications', [
            'date_naissance' => '1995-05-10',
            'adresse_confirmee' => 'Casablanca',
            'rib' => 'MA640070700000000000000503',
            'cin_recto' => UploadedFile::fake()->create('cin_recto.jpg', 100, 'image/jpeg'),
            'cin_verso' => UploadedFile::fake()->create('cin_verso.jpg', 100, 'image/jpeg'),
            'contrat_signe' => UploadedFile::fake()->create('contrat.pdf', 100, 'application/pdf'),
        ]);

        $response->assertStatus(201)
            ->assertJson(['statut' => 'en_attente']);

        $this->assertDatabaseHas('vendor_applications', [
            'user_id' => $user->id,
            'statut' => 'en_attente',
        ]);

        $app = VendorApplication::where('user_id', $user->id)->firstOrFail();
        $this->assertSame('image/jpeg', $app->cin_recto_mime);
        $this->assertSame('application/pdf', $app->contrat_signe_mime);
    }

    public function test_bytea_round_trip_preserves_binary(): void
    {
        $app = VendorApplication::create([
            'user_id' => $this->buyer()->id,
            'date_naissance' => '1995-01-10',
            'adresse_confirmee' => 'Casablanca',
            'rib' => 'MA640070700000000000000503',
            'cin_recto' => hex2bin('ffd8ffe000104a46494600'),
            'cin_recto_mime' => 'image/jpeg',
            'statut' => 'en_attente',
            'date_soumission' => now(),
        ]);

        $fresh = VendorApplication::findOrFail($app->id);
        $this->assertSame('ffd8ffe000104a46494600', bin2hex((string) $fresh->cin_recto));
        $this->assertNotEquals($fresh->cin_recto, $fresh->rib);
    }

    public function test_rejects_oversized_document(): void
    {
        $user = $this->buyer();

        $response = $this->actingAs($user)->postJson('/api/vendor-applications', [
            'date_naissance' => '1995-01-10',
            'adresse_confirmee' => 'Casablanca',
            'rib' => 'MA640070700000000000000503',
            'cin_recto' => UploadedFile::fake()->create('big.jpg', 7000, 'image/jpeg'),
            'cin_verso' => UploadedFile::fake()->create('cin_verso.jpg', 100, 'image/jpeg'),
            'contrat_signe' => UploadedFile::fake()->create('contrat.pdf', 100, 'application/pdf'),
        ]);

        $response->assertStatus(422);
    }

    public function test_rejects_wrong_document_format(): void
    {
        $user = $this->buyer();

        $response = $this->actingAs($user)->postJson('/api/vendor-applications', [
            'date_naissance' => '1995-01-10',
            'adresse_confirmee' => 'Casablanca',
            'rib' => '123640070700000000000503',
            'cin_recto' => UploadedFile::fake()->create('cin.txt', 100, 'text/plain'),
            'cin_verso' => UploadedFile::fake()->create('cin_verso.jpg', 100, 'image/jpeg'),
            'contrat_signe' => UploadedFile::fake()->create('contrat.pdf', 100, 'application/pdf'),
        ]);

        $response->assertStatus(422);
    }

    public function test_admin_can_approve_application_unlocking_vendor(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = $this->buyer();

        $app = VendorApplication::create([
            'user_id' => $user->id,
            'date_naissance' => '1995-01-10',
            'adresse_confirmee' => 'Casablanca',
            'rib' => 'MA640070700000000000000503',
            'statut' => 'en_attente',
            'date_soumission' => now(),
        ]);

        $response = $this->actingAs($admin)->postJson("/api/admin/vendor-applications/{$app->id}/approve");

        $response->assertOk();

        $this->assertDatabaseHas('users', ['id' => $user->id, 'role' => 'both', 'statut_kyc' => 'verifie']);
        $this->assertDatabaseHas('vendor_applications', ['id' => $app->id, 'statut' => 'valide']);

        $this->assertNotNull($user->fresh()->vendeur_verifie_le);
    }

    public function test_admin_can_reject_without_changing_role(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = $this->buyer();

        $app = VendorApplication::create([
            'user_id' => $user->id,
            'date_naissance' => '1995-01-10',
            'adresse_confirmee' => 'Casablanca',
            'rib' => 'MA640750000000000000503',
            'statut' => 'en_attente',
            'date_soumission' => now(),
        ]);

        $response = $this->actingAs($admin)->postJson("/api/admin/vendor-applications/{$app->id}/reject", [
            'motif' => 'Document illisible',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('vendor_applications', ['id' => $app->id, 'statut' => 'refuse', 'motif_refus' => 'Document illisible']);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'role' => 'acheteur']);

        // A refused user may resubmit
        $resubmit = $this->actingAs($user)->postJson("/api/vendor-applications/{$app->id}/resubmit");
        $resubmit->assertOk();
        $this->assertDatabaseHas('vendor_applications', ['id' => $app->id, 'statut' => 'en_attente']);
    }

    public function test_admin_only_listing(): void
    {
        $user = $this->buyer();

        $response = $this->actingAs($user)->getJson('/api/admin/vendor-applications');

        $response->assertStatus(403);
    }

    public function test_admin_listing_hides_binary_documents(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = $this->buyer();

        VendorApplication::create([
            'user_id' => $user->id,
            'date_naissance' => '1995-01-10',
            'adresse_confirmee' => 'Casablanca',
            'rib' => 'MA640070700000000000000503',
            'cin_recto' => hex2bin('ffd8ffe000104a46494600'),
            'cin_recto_mime' => 'image/jpeg',
            'statut' => 'en_attente',
            'date_soumission' => now(),
        ]);

        $response = $this->actingAs($admin)->getJson('/api/admin/vendor-applications');

        $response->assertOk();
        $this->assertArrayNotHasKey('cin_recto', $response->json('data.0'));
        $this->assertArrayNotHasKey('contrat_signe', $response->json('data.0'));
        $this->assertArrayNotHasKey('cin_verso', $response->json('data.0'));
    }

    public function test_admin_can_stream_document(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = $this->buyer();

        $app = VendorApplication::create([
            'user_id' => $user->id,
            'date_naissance' => '1995-01-10',
            'adresse_confirmee' => 'Casablanca',
            'rib' => 'MA640070700000000000000503',
            'cin_recto' => hex2bin('ffd8ffe000104a46494600'),
            'cin_recto_mime' => 'image/jpeg',
            'statut' => 'en_attente',
            'date_soumission' => now(),
        ]);

        $response = $this->actingAs($admin)->get("/api/admin/vendor-applications/{$app->id}/document/cin_recto");

        $response->assertOk()
            ->assertHeader('Content-Type', 'image/jpeg');
        $this->assertSame('ffd8ffe000104a46494600', bin2hex($response->getContent()));
    }
}
