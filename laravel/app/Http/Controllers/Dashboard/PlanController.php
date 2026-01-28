<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Plan\StorePlanRequest;
use App\Http\Requests\Plan\UpdatePlanRequest;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Traits\StructuredLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PlanController extends Controller
{
    use StructuredLogger;

    public function index(Request $request): Response
    {
        try {
            $query = Plan::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where('name', 'like', "%{$search}%");
            }

            $plans = $query->withCount('activeSubscribers')
                ->latest()
                ->paginate(15)
                ->withQueryString();

            $activeSubscribersCount = Subscription::where('status', Subscription::STATUS_ACTIVE)
                ->distinct('user_id')
                ->count('user_id');

            $totalUsers = User::count();
            $usersWithoutPlans = $totalUsers - $activeSubscribersCount;

            $summary = [
                'total' => Plan::count(),
                'total_users' => $totalUsers,
                'users_with_plans' => $activeSubscribersCount,
                'users_without_plans' => $usersWithoutPlans,
            ];

            $usersPerPlan = Plan::withCount('activeSubscribers')->get()->map(function ($plan) {
                $subscribersThisMonth = Subscription::where('plan_id', $plan->id)
                    ->where('status', Subscription::STATUS_ACTIVE)
                    ->where('started_at', '>=', now()->startOfMonth())
                    ->count();

                return [
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'active_subscribers' => $plan->active_subscribers_count,
                    'subscribers_this_month' => $subscribersThisMonth,
                ];
            });

            return Inertia::render('dashboard/plans/index', [
                'plans' => $plans->through(function ($plan) {
                    return [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'slug' => $plan->slug,
                        'price' => $plan->price,
                        'credits_per_cycle' => $plan->credits_per_cycle,
                        'billing_cycle' => $plan->billing_cycle,
                        'is_active' => $plan->is_active,
                        'users_count' => $plan->active_subscribers_count,
                        'created_at' => $plan->created_at,
                    ];
                }),
                'filters' => $request->only(['search']),
                'summary' => $summary,
                'usersPerPlan' => $usersPerPlan,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load plans. Please try again.');
        }
    }

    public function show(Plan $plan): Response
    {
        try {
            // Get active subscription user IDs
            $activeSubscriptionUserIds = Subscription::where('plan_id', $plan->id)
                ->where('status', Subscription::STATUS_ACTIVE)
                ->pluck('user_id');

            // Load subscribers with pagination
            $subscribers = User::whereIn('id', $activeSubscriptionUserIds)
                ->withCount('projects')
                ->paginate(15);

            $planStats = [
                'total_users' => $activeSubscriptionUserIds->count(),
                'users_this_month' => Subscription::where('plan_id', $plan->id)
                    ->where('status', Subscription::STATUS_ACTIVE)
                    ->where('started_at', '>=', now()->startOfMonth())
                    ->count(),
                'users_this_week' => Subscription::where('plan_id', $plan->id)
                    ->where('status', Subscription::STATUS_ACTIVE)
                    ->where('started_at', '>=', now()->startOfWeek())
                    ->count(),
                'users_with_projects' => User::whereIn('id', $activeSubscriptionUserIds)->has('projects')->count(),
                'users_with_github' => User::whereIn('id', $activeSubscriptionUserIds)->has('githubToken')->count(),
            ];

            return Inertia::render('dashboard/plans/show', [
                'plan' => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'slug' => $plan->slug,
                    'price' => $plan->price,
                    'credits_per_cycle' => $plan->credits_per_cycle,
                    'billing_cycle' => $plan->billing_cycle,
                    'is_active' => $plan->is_active,
                    'created_at' => $plan->created_at,
                    'updated_at' => $plan->updated_at,
                ],
                'subscribers' => $subscribers,
                'planStats' => $planStats,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'plan_id' => $plan->id]);
            return back()->with('error', 'Failed to load plan details. Please try again.');
        }
    }

    public function store(StorePlanRequest $request): JsonResponse
    {
        try {
            $plan = Plan::create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Plan created successfully.',
                'plan' => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'slug' => $plan->slug,
                    'price' => $plan->price,
                    'credits_per_cycle' => $plan->credits_per_cycle,
                    'billing_cycle' => $plan->billing_cycle,
                    'is_active' => $plan->is_active,
                    'users_count' => 0,
                    'created_at' => $plan->created_at,
                ],
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'store']);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create plan. Please try again.',
            ], 500);
        }
    }

    public function update(UpdatePlanRequest $request, Plan $plan): JsonResponse
    {
        try {
            $plan->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Plan updated successfully.',
                'plan' => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'slug' => $plan->slug,
                    'price' => $plan->price,
                    'credits_per_cycle' => $plan->credits_per_cycle,
                    'billing_cycle' => $plan->billing_cycle,
                    'is_active' => $plan->is_active,
                    'users_count' => $plan->active_subscribers_count,
                    'created_at' => $plan->created_at,
                ],
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'update', 'plan_id' => $plan->id]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update plan. Please try again.',
            ], 500);
        }
    }
}
