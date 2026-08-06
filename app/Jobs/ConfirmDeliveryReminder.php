<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\EscrowService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ConfirmDeliveryReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 60;

    /**
     * Daily job: check shipped orders past confirmation deadline → auto-refund.
     */
    public function handle(): void
    {
        $overdueOrders = Order::where('statut', 'expedie')
            ->where('date_confirmation_limite', '<', now())
            ->get();

        foreach ($overdueOrders as $order) {
            // Auto-refund buyer if no confirmation or dispute
            if (! $order->dispute || $order->dispute->statut === 'cloturee') {
                EscrowService::refundBuyer($order);
                Log::info("Auto-refund: Order #{$order->numero_commande} - no confirmation received.");
            } else {
                Log::info("Order #{$order->numero_commande} has open dispute, skipping auto-refund.");
            }
        }

        Log::info('ConfirmDeliveryReminder: processed '.$overdueOrders->count().' overdue orders.');
    }
}
