<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminLoginRequest;
use App\Support\AppLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthController extends Controller
{
    public function showLogin(): Response
    {
        return Inertia::render('admin/login');
    }

    public function login(AdminLoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $admin = Auth::guard('admin')->user();
        AppLogger::security('admin.login.success', [
            'email' => $admin?->email,
            'admin_id' => $admin?->id,
            'role' => $admin?->role,
        ], 'info');

        return redirect()->intended(route('admin.dashboard'));
    }

    public function logout(Request $request): RedirectResponse
    {
        $adminId = Auth::guard('admin')->id();
        Auth::guard('admin')->logout();

        AppLogger::security('admin.logout', ['admin_id' => $adminId], 'info');

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
