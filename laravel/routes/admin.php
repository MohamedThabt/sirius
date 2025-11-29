<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Dashboard\AdminController;
use App\Http\Controllers\Dashboard\BetaController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\FeatureController;
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
    
    // Beta Invitations Management
    Route::get('beta', [BetaController::class, 'index'])->name('admin.beta.index');
    Route::post('beta/create', [BetaController::class, 'create'])->name('admin.beta.create');
    Route::post('beta/{betaInvitation}/approve', [BetaController::class, 'approve'])->name('admin.beta.approve');
    Route::post('beta/{betaInvitation}/deny', [BetaController::class, 'deny'])->name('admin.beta.deny');
    
    // Project Management
    Route::get('projects', [ProjectController::class, 'index'])->name('admin.projects.index');
    Route::get('projects/{project}', [ProjectController::class, 'show'])->name('admin.projects.show');
    Route::get('projects/{project}/overview', [ProjectController::class, 'overview'])->name('admin.projects.overview');
    Route::get('projects/{project}/prd', [ProjectController::class, 'prd'])->name('admin.projects.prd');
    Route::post('projects/{project}/prd/preview', [ProjectController::class, 'prdPreview'])->name('admin.projects.prd.preview');
    Route::post('projects/{project}/overview/preview', [ProjectController::class, 'overviewPreview'])->name('admin.projects.overview.preview');
    Route::get('projects/{project}/erd', [ProjectController::class, 'erd'])->name('admin.projects.erd');
    Route::get('projects/{project}/c4', [ProjectController::class, 'c4'])->name('admin.projects.c4');
    Route::get('projects/{project}/technical-details', [ProjectController::class, 'technicalDetails'])->name('admin.projects.technical-details');
    
    // Feature Management
    Route::get('features/{feature}', [FeatureController::class, 'show'])->name('admin.features.show');
    Route::get('features/{feature}/specs', [FeatureController::class, 'specs'])->name('admin.features.specs');
    Route::get('features/{feature}/erd', [FeatureController::class, 'erd'])->name('admin.features.erd');
    Route::get('features/{feature}/sequence-diagram', [FeatureController::class, 'sequenceDiagram'])->name('admin.features.sequence-diagram');
    Route::get('features/{feature}/wireframe', [FeatureController::class, 'wireframe'])->name('admin.features.wireframe');
    Route::get('features/{feature}/user-journey', [FeatureController::class, 'userJourney'])->name('admin.features.user-journey');
    
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
