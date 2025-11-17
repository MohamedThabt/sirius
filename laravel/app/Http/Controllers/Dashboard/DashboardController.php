<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Project;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'total_users' => User::count(),
            'total_projects' => Project::count(),
            'total_admins' => Admin::count(),
            'recent_users' => User::latest()->take(5)->get(['id', 'name', 'email', 'created_at']),
            'recent_projects' => Project::with('user:id,name')->latest()->take(5)->get(['id', 'name', 'user_id', 'status', 'created_at']),
        ];

        return Inertia::render('dashboard/index', compact('stats'));
    }
}
