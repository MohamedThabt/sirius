<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\User;
use App\Traits\StructuredLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PlanController extends Controller
{
    use StructuredLogger;

    /**
     * Display a paginated list of plans with optional search filtering.
     *
     * Supports filtering by:
     * - search: Filter by plan name (optional)
     *
     * Includes the count of users for each plan.
     *
     * @param Request $request The incoming HTTP request
     * @return Response Inertia response rendering the plans index page
     */
    public function index(Request $request): Response
    {
        try {
            $query = Plan::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where('name', 'like', "%{$search}%");
            }

            $plans = $query->withCount('users')
                ->latest()
                ->paginate(15)
                ->withQueryString();

            // Summary stats
            $summary = [
                'total' => Plan::count(),
                'total_users' => User::count(),
                'users_with_plans' => User::whereNotNull('plan_id')->count(),
                'users_without_plans' => User::whereNull('plan_id')->count(),
            ];

            // Users per plan
            $usersPerPlan = Plan::withCount('users')->get()->map(function ($plan) {
                return [
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'user_count' => $plan->users_count,
                    'users_this_month' => User::where('plan_id', $plan->id)
                        ->where('created_at', '>=', now()->startOfMonth())
                        ->count(),
                ];
            });

            return Inertia::render('dashboard/plans/index', [
                'plans' => $plans,
                'filters' => $request->only(['search']),
                'summary' => $summary,
                'usersPerPlan' => $usersPerPlan,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load plans. Please try again.');
        }
    }

    /**
     * Display detailed information about a specific plan.
     *
     * Loads the plan with its users and calculates stats.
     *
     * @param Plan $plan The plan to display
     * @return Response Inertia response rendering the plan show page
     */
    public function show(Plan $plan): Response
    {
        try {
            // Load users on this plan with pagination
            $users = User::where('plan_id', $plan->id)
                ->withCount('projects')
                ->latest()
                ->paginate(15);

            // Calculate plan stats
            $planStats = [
                'total_users' => User::where('plan_id', $plan->id)->count(),
                'users_this_month' => User::where('plan_id', $plan->id)
                    ->where('created_at', '>=', now()->startOfMonth())
                    ->count(),
                'users_this_week' => User::where('plan_id', $plan->id)
                    ->where('created_at', '>=', now()->startOfWeek())
                    ->count(),
                'users_with_projects' => User::where('plan_id', $plan->id)
                    ->has('projects')
                    ->count(),
                'users_with_github' => User::where('plan_id', $plan->id)
                    ->has('githubToken')
                    ->count(),
            ];

            return Inertia::render('dashboard/plans/show', [
                'plan' => $plan->toArray(),
                'users' => $users,
                'planStats' => $planStats,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'plan_id' => $plan->id]);
            return back()->with('error', 'Failed to load plan details. Please try again.');
        }
    }
}
