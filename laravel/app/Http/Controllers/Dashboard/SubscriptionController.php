<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Traits\StructuredLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SubscriptionController extends Controller
{
    use StructuredLogger;

    public function index(Request $request): Response
    {
        try {
            $query = Subscription::with(['user', 'plan']);

            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('plan_id')) {
                $query->where('plan_id', $request->plan_id);
            }

            $subscriptions = $query->latest('started_at')
                ->paginate(15)
                ->withQueryString();

            $summary = [
                'total' => Subscription::count(),
                'active' => Subscription::where('status', Subscription::STATUS_ACTIVE)->count(),
                'cancelled' => Subscription::where('status', Subscription::STATUS_CANCELLED)->count(),
                'expired' => Subscription::where('status', Subscription::STATUS_EXPIRED)->count(),
                'this_month' => Subscription::where('started_at', '>=', now()->startOfMonth())->count(),
            ];

            $plans = Plan::where('is_active', true)->get(['id', 'name', 'slug']);

            return Inertia::render('dashboard/subscriptions/index', [
                'subscriptions' => $subscriptions,
                'filters' => $request->only(['search', 'status', 'plan_id']),
                'summary' => $summary,
                'plans' => $plans,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load subscriptions. Please try again.');
        }
    }

    public function show(Subscription $subscription): Response
    {
        try {
            $subscription->load(['user', 'plan']);

            return Inertia::render('dashboard/subscriptions/show', [
                'subscription' => $subscription,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'subscription_id' => $subscription->id]);
            return back()->with('error', 'Failed to load subscription details. Please try again.');
        }
    }
}
