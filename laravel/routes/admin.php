<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Dashboard\AdminController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\ProjectController;
use App\Http\Controllers\Dashboard\UserController;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Admin Authentication Routes
Route::middleware('guest:admin')->group(function () {
    Route::get('login', [AdminAuthController::class, 'showLogin'])->name('admin.login');
    Route::post('login', [AdminAuthController::class, 'login']);
});

// Admin Dashboard Routes
Route::middleware('auth:admin')->group(function () {
    Route::post('logout', [AdminAuthController::class, 'logout'])->name('admin.logout');
    
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    
    // Admin Management (Super Admin Only)
    Route::resource('admins', AdminController::class)->names([
        'index' => 'admin.admins.index',
        'create' => 'admin.admins.create',
        'store' => 'admin.admins.store',
        'edit' => 'admin.admins.edit',
        'update' => 'admin.admins.update',
        'destroy' => 'admin.admins.destroy',
    ])->except(['show']);
    
    // User Management
    Route::get('users', [UserController::class, 'index'])->name('admin.users.index');
    Route::get('users/{user}', [UserController::class, 'show'])->name('admin.users.show');
    
    // Project Management
    Route::get('projects', [ProjectController::class, 'index'])->name('admin.projects.index');
    Route::get('projects/{project}', [ProjectController::class, 'show'])->name('admin.projects.show');
    
    // Admin Profile (Password Change Only)
    Route::get('profile', function () {
        return Inertia::render('admin/profile', [
            'admin' => auth('admin')->user(),
        ]);
    })->name('admin.profile');
    
    Route::put('profile/password', function (Illuminate\Http\Request $request) {
        $request->validate([
            'current_password' => 'required|current_password:admin',
            'password' => 'required|string|min:6|confirmed',
        ]);

        auth('admin')->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password updated successfully.');
    })->name('admin.profile.password');
});
