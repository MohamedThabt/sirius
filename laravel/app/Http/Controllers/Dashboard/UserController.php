<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use App\Models\UsageLog;
use App\Models\User;
use App\Traits\StructuredLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserController extends Controller
{
    use StructuredLogger;

    /**
     * Display a paginated list of users with optional search filtering.
     *
     * Supports filtering by:
     * - search: Filter by user name or email (optional)
     *
     * Includes the count of projects for each user.
     *
     * @param Request $request The incoming HTTP request
     * @return Response Inertia response rendering the users index page
     */
    public function index(Request $request)
    {
        try {
            $query = User::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $users = $query->withCount('projects')
                ->latest()
                ->paginate(15)
                ->withQueryString();

            // Summary stats
            $summary = [
                'total' => User::count(),
                'with_projects' => User::has('projects')->count(),
                'this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
                'with_github' => User::has('githubToken')->count(),
            ];

            return Inertia::render('dashboard/users/index', [
                'users' => $users,
                'filters' => $request->only(['search']),
                'summary' => $summary,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load users. Please try again.');
        }
    }

    /**
     * Display detailed information about a specific user.
     *
     * Loads the user with their projects, team projects, and calculates stats.
     *
     * @param User $user The user to display
     * @return Response Inertia response rendering the user show page
     */
    public function show(User $user)
    {
        try {
            // Load owned projects with feature counts
            $user->load([
                'projects' => function ($query) {
                    $query->withCount('features')
                        ->latest()
                        ->take(10);
                },
                'teamProjects' => function ($query) {
                    $query->with('user:id,name')
                        ->withPivot('role', 'joined_at')
                        ->latest('projects.created_at')
                        ->take(10);
                },
                'githubToken',
                'credits',
                'subscriptions' => function ($query) {
                    $query->with('plan')->latest();
                },
            ]);

            // Get active subscription
            $activeSubscription = $user->activeSubscription();

            // Credits info
            $creditsInfo = [
                'credits_balance' => $user->credits?->credits_balance ?? 0,
                'total_this_month' => $user->credits?->total_this_month ?? 0,
                'billing_cycle_start' => $user->credits?->billing_cycle_start,
                'last_reset_at' => $user->credits?->last_reset_at,
            ];

            // Subscription info
            $subscriptionInfo = $activeSubscription ? [
                'id' => $activeSubscription->id,
                'status' => $activeSubscription->status,
                'plan_name' => $activeSubscription->plan?->name,
                'plan_slug' => $activeSubscription->plan?->slug,
                'started_at' => $activeSubscription->started_at,
                'ends_at' => $activeSubscription->ends_at,
            ] : null;

            // Engagement stats
            $engagementStats = [
                'feedbacks_count' => $user->feedbacks()->count(),
                'issues_count' => $user->issueReports()->count(),
            ];

            // Calculate additional stats
            $userStats = [
                'total_owned_projects' => $user->projects()->count(),
                'total_team_projects' => $user->teamProjects()->count(),
                'total_features_created' => Feature::whereHas('module.project', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->count(),
                'projects_by_status' => $user->projects()
                    ->selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
                'has_github' => $user->githubToken !== null,
                'pending_invitations' => $user->pendingProjectInvitations()->count(),
            ];

            // Usage stats for this user
            $usageStats = [
                'total_logs' => UsageLog::where('user_id', $user->id)->count(),
                'total_credits' => UsageLog::where('user_id', $user->id)->sum('credits_used'),
                'total_tokens' => UsageLog::where('user_id', $user->id)->sum('input_tokens') 
                    + UsageLog::where('user_id', $user->id)->sum('output_tokens'),
                'total_cost' => number_format(UsageLog::where('user_id', $user->id)->sum('cost'), 4),
                'this_month_credits' => UsageLog::where('user_id', $user->id)
                    ->where('created_at', '>=', now()->startOfMonth())
                    ->sum('credits_used'),
                'top_actions' => UsageLog::where('user_id', $user->id)
                    ->selectRaw('action_type, COUNT(*) as count, SUM(credits_used) as credits')
                    ->groupBy('action_type')
                    ->orderByDesc('credits')
                    ->limit(5)
                    ->get()
                    ->toArray(),
            ];

            // Recent usage logs for this user
            $recentUsageLogs = UsageLog::where('user_id', $user->id)
                ->latest('created_at')
                ->take(5)
                ->get(['id', 'action_type', 'model', 'credits_used', 'input_tokens', 'output_tokens', 'created_at']);

            return Inertia::render('dashboard/users/show', [
                'user' => $user,
                'userStats' => $userStats,
                'usageStats' => $usageStats,
                'recentUsageLogs' => $recentUsageLogs,
                'creditsInfo' => $creditsInfo,
                'subscriptionInfo' => $subscriptionInfo,
                'engagementStats' => $engagementStats,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'user_id' => $user->id]);
            return back()->with('error', 'Failed to load user details. Please try again.');
        }
    }

    /**
     * Add credits to a user's account.
     *
     * @param Request $request The incoming HTTP request
     * @param User $user The user to add credits to
     * @return \Illuminate\Http\RedirectResponse
     */
    public function addCredits(Request $request, User $user)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|integer|min:1|max:100000',
                'reason' => 'nullable|string|max:255',
            ]);

            // Get or create user credits record
            $userCredit = $user->credits;
            
            if (!$userCredit) {
                $userCredit = $user->credits()->create([
                    'credits_balance' => 0,
                    'total_this_month' => 0,
                    'billing_cycle_start' => now()->startOfMonth(),
                ]);
            }

            // Add credits
            $userCredit->incrementCredits($validated['amount']);

            // Log the action
            $this->logInfo('Admin added credits to user', [
                'action' => 'add_credits',
                'user_id' => $user->id,
                'amount' => $validated['amount'],
                'reason' => $validated['reason'] ?? null,
                'new_balance' => $userCredit->fresh()->credits_balance,
                'admin_id' => auth('admin')->id(),
            ]);

            return back()->with('success', "Successfully added {$validated['amount']} credits to {$user->name}'s account.");
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'add_credits', 'user_id' => $user->id]);
            return back()->with('error', 'Failed to add credits. Please try again.');
        }
    }
    /**
     * Delete a user.
     *
     * @param User $user The user to delete
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(User $user)
    {
        try {
            // Check if user is an admin or has some protection if needed,
            // though for now we assume admins can delete any user.
            
            // Log the action before deletion (so we have the user ID)
            $this->logInfo('Admin deleted user', [
                'action' => 'delete_user',
                'user_id' => $user->id,
                'user_email' => $user->email,
                'admin_id' => auth('admin')->id(),
            ]);

            $user->delete();

            return back()->with('success', 'User deleted successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'destroy', 'user_id' => $user->id]);
            return back()->with('error', 'Failed to delete user. Please try again.');
        }
    }
}
