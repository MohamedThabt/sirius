<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\BetaInvitation;
use App\Models\Feedback;
use App\Models\Feature;
use App\Models\GithubToken;
use App\Models\IssueReport;
use App\Models\Module;
use App\Models\Payment;
use App\Models\Project;
use App\Models\UsageLog;
use App\Models\User;
use App\Traits\StructuredLogger;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class DashboardController extends Controller
{
    use StructuredLogger;

    /**
     * Display the admin dashboard with comprehensive statistics.
     *
     * Shows:
     * - Total and contextual counts for users, projects, admins
     * - Feature and PRD counts
     * - Beta invitation stats
     * - GitHub integration stats
     * - Project status breakdown
     * - Recent activity (users, projects, admins, beta invitations)
     *
     * @return Response Inertia response rendering the dashboard index page
     */
    public function index(): Response
    {
        try {
            // User stats
            $totalUsers = User::count();
            $usersWithProjects = User::has('projects')->count();
            $usersThisMonth = User::where('created_at', '>=', now()->startOfMonth())->count();
            $usersThisWeek = User::where('created_at', '>=', now()->startOfWeek())->count();

            // Project stats
            $totalProjects = Project::count();
            $projectsByStatus = Project::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();
            $projectsThisMonth = Project::where('created_at', '>=', now()->startOfMonth())->count();
            $projectsWithPrd = Project::whereNotNull('prd')->where('prd', '!=', '')->count();
            $projectsWithErd = Project::whereNotNull('erd')->where('erd', '!=', '')->count();
            $projectsWithC4 = Project::whereNotNull('c4')->where('c4', '!=', '')->count();

            // Feature stats
            $totalFeatures = Feature::count();
            $featuresByStatus = Feature::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();
            $featuresByPriority = Feature::selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority')
                ->toArray();

            // Module stats
            $totalModules = Module::count();
            $modulesByStatus = Module::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();
            $modulesWithErd = Module::whereNotNull('erd')
                ->where('erd', '!=', '')
                ->count();
            $modulesWithSyncedErd = Module::where('erd_is_synced', true)->count();
            $modulesThisMonth = Module::where('created_at', '>=', now()->startOfMonth())->count();

            // Admin stats
            $totalAdmins = Admin::count();
            $superAdmins = Admin::where('role', Admin::ROLE_SUPER_ADMIN)->count();
            $regularAdmins = Admin::where('role', Admin::ROLE_ADMIN)->count();

            // Beta invitation stats
            $betaPending = BetaInvitation::where('status', BetaInvitation::STATUS_PENDING)->count();
            $betaApproved = BetaInvitation::where('status', BetaInvitation::STATUS_APPROVED)->count();
            $betaDenied = BetaInvitation::where('status', BetaInvitation::STATUS_DENIED)->count();
            $betaTotal = $betaPending + $betaApproved + $betaDenied;

            // Payment stats
            $paymentsPending = Payment::where('status', Payment::STATUS_PENDING)->count();

            // GitHub integration stats
            $usersWithGithub = GithubToken::count();
            $projectsWithRepo = Project::has('repository')->count();

            // Issue stats
            $totalIssues = IssueReport::count();
            $issuesByStatus = IssueReport::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();
            $issuesBySeverity = IssueReport::selectRaw('severity, COUNT(*) as count')
                ->groupBy('severity')
                ->pluck('count', 'severity')
                ->toArray();
            $issuesThisMonth = IssueReport::where('created_at', '>=', now()->startOfMonth())->count();
            $issuesThisWeek = IssueReport::where('created_at', '>=', now()->startOfWeek())->count();
            $openIssues = IssueReport::where('status', IssueReport::STATUS_OPEN)->count();
            $blockerIssues = IssueReport::where('severity', IssueReport::SEVERITY_BLOCKER)->count();

            // Feedback stats
            $totalFeedback = Feedback::count();
            $feedbackByStatus = Feedback::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();
            $feedbackByType = Feedback::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray();
            $feedbackThisMonth = Feedback::where('created_at', '>=', now()->startOfMonth())->count();
            $feedbackThisWeek = Feedback::where('created_at', '>=', now()->startOfWeek())->count();
            $newFeedback = Feedback::where('status', Feedback::STATUS_NEW)->count();

            // Usage stats
            $totalUsageLogs = UsageLog::count();
            $totalCreditsUsed = UsageLog::where('credits_used', '>', 0)->sum('credits_used');
            $totalTokensUsed = UsageLog::sum('input_tokens') + UsageLog::sum('output_tokens');
            $totalCost = UsageLog::sum('cost');
            $usageToday = UsageLog::whereDate('created_at', today())->sum('credits_used');
            $usageThisWeek = UsageLog::where('created_at', '>=', now()->startOfWeek())->sum('credits_used');
            $usageThisMonth = UsageLog::where('created_at', '>=', now()->startOfMonth())->sum('credits_used');
            $usageByActionType = UsageLog::selectRaw('action_type, COUNT(*) as count, SUM(credits_used) as credits')
                ->groupBy('action_type')
                ->orderByDesc('credits')
                ->limit(5)
                ->get()
                ->toArray();
            $usageByModel = UsageLog::selectRaw('model, COUNT(*) as count, SUM(credits_used) as credits')
                ->whereNotNull('model')
                ->groupBy('model')
                ->orderByDesc('credits')
                ->limit(5)
                ->get()
                ->toArray();
            $recentUsageLogs = UsageLog::with('user:id,name,email')
                ->latest('created_at')
                ->take(5)
                ->get(['id', 'user_id', 'action_type', 'model', 'credits_used', 'created_at']);

            // Recent activity
            $recentUsers = User::latest()
                ->take(5)
                ->get(['id', 'name', 'email', 'avatar', 'created_at']);

            $recentProjects = Project::with('user:id,name,email')
                ->latest()
                ->take(5)
                ->get(['id', 'name', 'user_id', 'status', 'created_at', 'updated_at']);

            $recentAdmins = Admin::with('creator:id,name')
                ->latest()
                ->take(5)
                ->get(['id', 'name', 'email', 'role', 'created_by', 'created_at']);

            $recentBetaInvitations = BetaInvitation::with('invitedBy:id,name')
                ->latest()
                ->take(5)
                ->get(['id', 'name', 'email', 'status', 'invited_by', 'created_at']);

            $recentIssues = IssueReport::with('user:id,name,email')
                ->latest()
                ->take(5)
                ->get(['id', 'title', 'status', 'severity', 'user_id', 'created_at']);

            $recentFeedback = Feedback::with('user:id,name,email')
                ->latest()
                ->take(5)
                ->get(['id', 'type', 'message', 'status', 'user_id', 'created_at']);

            // FastAPI Health Check
            $fastApiHealth = $this->getFastApiHealthStatus();

            $stats = [
                // User metrics
                'total_users' => $totalUsers,
                'users_with_projects' => $usersWithProjects,
                'users_this_month' => $usersThisMonth,
                'users_this_week' => $usersThisWeek,

                // Project metrics
                'total_projects' => $totalProjects,
                'projects_by_status' => $projectsByStatus,
                'projects_this_month' => $projectsThisMonth,
                'projects_with_prd' => $projectsWithPrd,
                'projects_with_erd' => $projectsWithErd,
                'projects_with_c4' => $projectsWithC4,

                // Feature metrics
                'total_features' => $totalFeatures,
                'features_by_status' => $featuresByStatus,
                'features_by_priority' => $featuresByPriority,

                // Module metrics
                'total_modules' => $totalModules,
                'modules_by_status' => $modulesByStatus,
                'modules_with_erd' => $modulesWithErd,
                'modules_with_synced_erd' => $modulesWithSyncedErd,
                'modules_this_month' => $modulesThisMonth,

                // Admin metrics
                'total_admins' => $totalAdmins,
                'super_admins' => $superAdmins,
                'regular_admins' => $regularAdmins,

                // Beta metrics
                'beta_pending' => $betaPending,
                'beta_approved' => $betaApproved,
                'beta_denied' => $betaDenied,
                'beta_total' => $betaTotal,

                // Payment metrics
                'payments_pending' => $paymentsPending,

                // GitHub integration
                'users_with_github' => $usersWithGithub,
                'projects_with_repo' => $projectsWithRepo,

                // Issue metrics
                'total_issues' => $totalIssues,
                'issues_by_status' => $issuesByStatus,
                'issues_by_severity' => $issuesBySeverity,
                'issues_this_month' => $issuesThisMonth,
                'issues_this_week' => $issuesThisWeek,
                'open_issues' => $openIssues,
                'blocker_issues' => $blockerIssues,

                // Feedback metrics
                'total_feedback' => $totalFeedback,
                'feedback_by_status' => $feedbackByStatus,
                'feedback_by_type' => $feedbackByType,
                'feedback_this_month' => $feedbackThisMonth,
                'feedback_this_week' => $feedbackThisWeek,
                'new_feedback' => $newFeedback,

                // Usage metrics
                'total_usage_logs' => $totalUsageLogs,
                'total_credits_used' => $totalCreditsUsed,
                'total_tokens_used' => $totalTokensUsed,
                'total_cost' => $totalCost,
                'usage_today' => $usageToday,
                'usage_this_week' => $usageThisWeek,
                'usage_this_month' => $usageThisMonth,
                'usage_by_action_type' => $usageByActionType,
                'usage_by_model' => $usageByModel,
                'recent_usage_logs' => $recentUsageLogs,

                // Recent activity
                'recent_users' => $recentUsers,
                'recent_projects' => $recentProjects,
                'recent_admins' => $recentAdmins,
                'recent_beta_invitations' => $recentBetaInvitations,
                'recent_issues' => $recentIssues,
                'recent_feedback' => $recentFeedback,

                // FastAPI Health Status
                'fastapi_health' => $fastApiHealth,
            ];

            return Inertia::render('dashboard/index', compact('stats'));
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load dashboard statistics. Please try again.');
        }
    }

    /**
     * Get FastAPI service health status.
     *
     * @return array Health status data from FastAPI or error state
     */
    private function getFastApiHealthStatus(): array
    {
        try {
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            
            $response = Http::fastapi()->timeout(5)
                ->get($fastApiBaseUrl . '/v1/health');

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'status' => 'unhealthy',
                'error' => 'FastAPI returned status: ' . $response->status(),
                'timestamp' => now()->toISOString(),
            ];
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'getFastApiHealthStatus']);
            
            return [
                'status' => 'offline',
                'error' => 'Unable to connect to FastAPI service',
                'timestamp' => now()->toISOString(),
            ];
        }
    }
}
