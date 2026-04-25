<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Plan;
use App\Services\Notification\TelegramNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PaymentController extends Controller
{
    private const SUPPORT_EMAIL = 'mohamedthabetthabet36@gmail.com';
    private const INSTAPAY_LINK = 'https://ipn.eg/S/sirthabet/instapay/3yTZLi';
    private const INSTAPAY_USER = 'sirthabet@instapay';

    /** InstaPay manual Pro upgrade (EGP). Plan `price` may be in another unit for display elsewhere. */
    private const PRO_UPGRADE_AMOUNT_EGP = 200.0;

    public function upgradePro(): Response|RedirectResponse
    {
        $user = auth()->user();

        if ($user->activePlan()?->slug === 'pro') {
            return redirect()->route('projects.index')->with('success', 'You are already on the Pro plan.');
        }

        $proPlan = Plan::query()->where('slug', 'pro')->first();
        $sidebarProjects = $user->projects()
            ->latest('updated_at')
            ->get(['id', 'name', 'status']);

        return Inertia::render('upgrade/pro', [
            'proPlan'      => $proPlan ? [
                'name'             => $proPlan->name,
                'price'            => $proPlan->price,
                'credits_per_cycle' => $proPlan->credits_per_cycle,
            ] : null,
            'instapayLink' => self::INSTAPAY_LINK,
            'instapayUser' => self::INSTAPAY_USER,
            'upgradeAmountEgp' => self::PRO_UPGRADE_AMOUNT_EGP,
            'supportEmail' => self::SUPPORT_EMAIL,
            'sidebarProjects' => $sidebarProjects,
            'pendingInvitationsCount' => $user->pendingProjectInvitations()->count(),
        ]);
    }

    public function acceptProPayment(Request $request, TelegramNotificationService $telegram): RedirectResponse
    {
        $request->validate([
            'transfer_image' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,jpg,png,webp,heic',
                'max:5120',
                'dimensions:min_width=100,min_height=100',
            ],
        ], [
            'transfer_image.required'   => 'Please upload a screenshot of your transfer.',
            'transfer_image.image'      => 'The file must be an image.',
            'transfer_image.mimes'      => 'Only JPEG, PNG, WebP, or HEIC images are allowed.',
            'transfer_image.max'        => 'The image may not be larger than 5 MB.',
            'transfer_image.dimensions' => 'The image is too small to be a valid transfer screenshot.',
        ]);

        try {
            $user = auth()->user();

            $path = $request->file('transfer_image')
                ->store('payments', 'public');

            $payment = Payment::create([
                'user_id'            => $user->id,
                'plan_slug'          => 'pro',
                'amount'             => self::PRO_UPGRADE_AMOUNT_EGP,
                'currency'           => 'EGP',
                'payment_method'     => 'instapay',
                'transfer_image_path' => $path,
                'status'             => Payment::STATUS_PENDING,
            ]);

            $telegram->notifyNewProPaymentRequest($payment, $user);

            return back()->with('success', 'Payment proof submitted successfully! We will review your transfer and activate your Pro plan within 24 hours.');
        } catch (Throwable $e) {
            if (isset($path)) {
                Storage::disk('public')->delete($path);
            }
            report($e);
            return back()->with('error', 'Failed to submit payment proof. Please try again or contact support.');
        }
    }
}
