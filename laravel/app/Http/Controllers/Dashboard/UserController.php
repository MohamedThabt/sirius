<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request){
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
    }

    public function show(User $user){
        $user->load(['projects' => function ($query) {
            $query->latest()->take(10);
        }]);

        return Inertia::render('dashboard/users/show', compact('user'));
    }
}
