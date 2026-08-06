<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\Order;
use App\Models\SiteSetting;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\EscrowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EscrowServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(['CategorySeeder', 'SiteSettingsSeeder']);
    }

    public function test_calculates_commission_correctly(): void
    {
        $result = EscrowService::calculateCommission(1000);

        $this->assertEquals(5.0, $result['taux']);
        $this->assertEquals(50.00, $result['montant']);
        $this->assertEquals(950.00, $result['net_vendeur']);
    }

    public function test_calculates_commission_with_custom_rate(): void
    {
        SiteSetting::set('commission_taux', 7.5, 'decimal', 'finance');

        $result = EscrowService::calculateCommission(1000);

        $this->assertEquals(7.5, $result['taux']);
        $this->assertEquals(75.00, $result['montant']);
        $this->assertEquals(925.00, $result['net_vendeur']);
    }

    public function test_captures_payment_into_escrow(): void
    {
        $buyer = User::factory()->create();
        $seller = User::factory()->create();
        Wallet::create(['user_id' => $buyer->id]);
        Wallet::create(['user_id' => $seller->id]);

        $listing = Listing::factory()->create(['seller_id' => $seller->id, 'category_id' => 1]);

        $order = Order::factory()->create([
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'listing_id' => $listing->id,
            'prix' => 500,
            'frais_port' => 30,
            'total' => 530,
            'statut' => 'attente_paiement',
        ]);

        $result = EscrowService::capturePayment($order);

        $this->assertEquals('sequestre', $result->statut);

        $platformWallet = Wallet::where('user_id', config('app.platform_admin_user_id', 1))->first();
        $this->assertEquals(530.00, $platformWallet->solde_en_attente);
    }

    public function test_confirms_reception_and_pays_seller_minus_commission(): void
    {
        $buyer = User::factory()->create();
        $seller = User::factory()->create();
        Wallet::create(['user_id' => $buyer->id]);
        Wallet::create(['user_id' => $seller->id]);

        $listing = Listing::factory()->create(['seller_id' => $seller->id, 'category_id' => 1]);

        $order = Order::factory()->create([
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'listing_id' => $listing->id,
            'prix' => 1000,
            'frais_port' => 0,
            'total' => 1000,
            'statut' => 'expedie',
        ]);

        EscrowService::capturePayment($order);

        $result = EscrowService::confirmReception($order->fresh());

        $this->assertEquals('vire_vendeur', $result->statut);
        $this->assertEquals(50.00, $result->commission_montant);

        $sellerWallet = Wallet::where('user_id', $seller->id)->first();
        $this->assertEquals(950.00, $sellerWallet->solde_disponible);

        $this->assertDatabaseHas('invoices', [
            'order_id' => $order->id,
            'type' => 'acheteur',
        ]);
        $this->assertDatabaseHas('invoices', [
            'order_id' => $order->id,
            'type' => 'vendeur',
        ]);
        $this->assertDatabaseHas('invoices', [
            'order_id' => $order->id,
            'type' => 'plateforme',
        ]);
    }

    public function test_refunds_buyer_when_no_confirmation(): void
    {
        $buyer = User::factory()->create();
        $seller = User::factory()->create();
        Wallet::create(['user_id' => $buyer->id, 'solde' => 0, 'solde_disponible' => 0, 'solde_en_attente' => 0]);
        Wallet::create(['user_id' => $seller->id, 'solde' => 0, 'solde_disponible' => 0, 'solde_en_attente' => 0]);

        $listing = Listing::factory()->create(['seller_id' => $seller->id, 'category_id' => 1]);

        $order = Order::factory()->create([
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'listing_id' => $listing->id,
            'prix' => 500,
            'frais_port' => 25,
            'total' => 525,
            'statut' => 'expedie',
        ]);

        EscrowService::capturePayment($order);

        $result = EscrowService::refundBuyer($order->fresh());

        $this->assertEquals('rembourse', $result->statut);

        $buyerWallet = Wallet::where('user_id', $buyer->id)->first();
        $this->assertEquals(525.00, $buyerWallet->solde);

        $this->assertDatabaseHas('wallet_transactions', [
            'type' => 'remboursement',
            'order_id' => $order->id,
        ]);
    }

    public function test_tracks_all_financial_transactions(): void
    {
        $buyer = User::factory()->create();
        $seller = User::factory()->create();
        Wallet::create(['user_id' => $buyer->id]);
        Wallet::create(['user_id' => $seller->id]);

        $listing = Listing::factory()->create(['seller_id' => $seller->id, 'category_id' => 1]);

        $order = Order::factory()->create([
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'listing_id' => $listing->id,
            'prix' => 200,
            'frais_port' => 20,
            'total' => 220,
            'statut' => 'attente_paiement',
        ]);

        EscrowService::capturePayment($order);
        EscrowService::confirmReception($order->fresh());

        $transactions = WalletTransaction::where('order_id', $order->id)->get();
        $this->assertGreaterThanOrEqual(2, $transactions->count());

        $transactions->each(function ($t) {
            $this->assertEquals('complete', $t->statut);
        });
    }
}
