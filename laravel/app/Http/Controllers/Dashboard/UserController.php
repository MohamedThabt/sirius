<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
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
    public function index(Request $request): Response
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

            return Inertia::render('dashboard/users/index', [
                'users' => $users,
                'filters' => $request->only(['search']),
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load users. Please try again.');
        }
    }

    /**
     * Display detailed information about a specific user.
     *
     * Loads the user with their 10 most recent projects.
     *
     * @param User $user The user to display
     * @return Response Inertia response rendering the user show page
     */
    public function show(User $user): Response
    {
        try {
            $user->load(['projects' => function ($query) {
                $query->latest()->take(10);
            }]);

            return Inertia::render('dashboard/users/show', compact('user'));
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'user_id' => $user->id]);
            return back()->with('error', 'Failed to load user details. Please try again.');
        }
    }
}
