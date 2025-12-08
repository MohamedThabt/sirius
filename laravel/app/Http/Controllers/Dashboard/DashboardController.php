<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\BetaInvitation;
use App\Models\Feature;
use App\Models\GithubToken;
use App\Models\Module;
use App\Models\Project;
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

            // GitHub integration stats
            $usersWithGithub = GithubToken::count();
            $projectsWithRepo = Project::has('repository')->count();

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

                // GitHub integration
                'users_with_github' => $usersWithGithub,
                'projects_with_repo' => $projectsWithRepo,

                // Recent activity
                'recent_users' => $recentUsers,
                'recent_projects' => $recentProjects,
                'recent_admins' => $recentAdmins,
                'recent_beta_invitations' => $recentBetaInvitations,

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
            
            $response = Http::timeout(5)
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
