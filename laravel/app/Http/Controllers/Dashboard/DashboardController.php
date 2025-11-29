<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Project;
use App\Models\User;
use App\Traits\StructuredLogger;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class DashboardController extends Controller
{
    use StructuredLogger;

    /**
     * Display the admin dashboard with key statistics.
     *
     * Shows:
     * - Total counts for users, projects, and admins
     * - 5 most recent users with basic info
     * - 5 most recent projects with user relationship
     *
     * @return Response Inertia response rendering the dashboard index page
     */
    public function index(): Response
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'total_projects' => Project::count(),
                'total_admins' => Admin::count(),
                'recent_users' => User::latest()->take(5)->get(['id', 'name', 'email', 'created_at']),
                'recent_projects' => Project::with('user:id,name')->latest()->take(5)->get(['id', 'name', 'user_id', 'status', 'created_at']),
            ];

            return Inertia::render('dashboard/index', compact('stats'));
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load dashboard statistics. Please try again.');
        }
    }
}
