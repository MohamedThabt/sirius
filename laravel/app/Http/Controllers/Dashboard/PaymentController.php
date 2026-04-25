<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Mail\ProUpgradeAcceptedMail;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\UserCredit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Payment::query()->with(['user:id,name,email']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = in_array((int) $request->input('per_page'), [10, 25, 50, 100])
            ? (int) $request->input('per_page')
            : 10;

        $payments = $query->latest()->paginate($perPage)->withQueryString();

        $summary = [
            'total'    => Payment::count(),
            'pending'  => Payment::where('status', Payment::STATUS_PENDING)->count(),
            'accepted' => Payment::where('status', Payment::STATUS_ACCEPTED)->count(),
            'denied'   => Payment::where('status', Payment::STATUS_DENIED)->count(),
        ];

        return Inertia::render('dashboard/payments/index', [
            'payments' => $payments,
            'filters'  => $request->only(['search', 'status', 'per_page']),
            'summary'  => $summary,
        ]);
    }

    public function show(Payment $payment): Response
    {
        $payment->load('user:id,name,email');

        return Inertia::render('dashboard/payments/show', [
            'payment'      => $payment,
            'imageUrl'     => asset('storage/' . $payment->transfer_image_path),
        ]);
    }

    public function update(Request $request, Payment $payment): RedirectResponse
    {
        $request->validate([
            'action'     => 'required|in:accept,deny',
            'admin_note' => 'nullable|string|max:500',
        ]);

        try {
            if ($request->action === 'accept') {
                DB::transaction(function () use ($payment, $request) {
                    $proPlan = Plan::where('slug', 'pro')->firstOrFail();

                    $payment->user->subscriptions()
                        ->where('status', Subscription::STATUS_ACTIVE)
                        ->update(['status' => Subscription::STATUS_CANCELLED]);

                    Subscription::create([
                        'user_id'    => $payment->user_id,
                        'plan_id'    => $proPlan->id,
                        'status'     => Subscription::STATUS_ACTIVE,
                        'started_at' => now(),
                    ]);

                    $userCredit = UserCredit::firstOrCreate(
                        ['user_id' => $payment->user_id],
                        [
                            'credits_balance'    => 0,
                            'total_this_month'   => 0,
                            'billing_cycle_start' => now()->startOfMonth(),
                        ]
                    );
                    $userCredit->update([
                        'credits_balance'    => $proPlan->credits_per_cycle,
                        'total_this_month'   => $proPlan->credits_per_cycle,
                        'billing_cycle_start' => now()->startOfMonth(),
                        'last_reset_at'      => now(),
                    ]);

                    $payment->update([
                        'status'      => Payment::STATUS_ACCEPTED,
                        'admin_note'  => $request->admin_note,
                        'reviewed_at' => now(),
                    ]);
                });

                $payment->load('user');
                $proPlan = Plan::where('slug', 'pro')->firstOrFail();
                Mail::to($payment->user->email)->send(
                    new ProUpgradeAcceptedMail($payment->user, $proPlan->credits_per_cycle)
                );

                return back()->with('success', 'Payment accepted. User upgraded to Pro and notified by email.');
            }

            $payment->update([
                'status'      => Payment::STATUS_DENIED,
                'admin_note'  => $request->admin_note,
                'reviewed_at' => now(),
            ]);

            return back()->with('success', 'Payment request denied.');
        } catch (Throwable $e) {
            report($e);
            return back()->with('error', 'Failed to process payment. Please try again.');
        }
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        try {
            $path = $payment->transfer_image_path;
            if (is_string($path) && $path !== '') {
                Storage::disk('public')->delete($path);
            }
            $payment->delete();
            return redirect()->route('admin.payments.index')->with('success', 'Payment record deleted.');
        } catch (Throwable $e) {
            report($e);
            return back()->with('error', 'Failed to delete payment record. Please try again.');
        }
    }
}
