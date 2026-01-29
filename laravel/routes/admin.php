<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Dashboard\AdminController;
use App\Http\Controllers\Dashboard\BetaController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\FeatureController;
use App\Http\Controllers\Dashboard\FeedbackController;
use App\Http\Controllers\Dashboard\IssueController;
use App\Http\Controllers\Dashboard\LaravelLogsController;
use App\Http\Controllers\Dashboard\LogsController;
use App\Http\Controllers\Dashboard\ModuleController;
use App\Http\Controllers\Dashboard\PlanController;
use App\Http\Controllers\Dashboard\ProjectController;
use App\Http\Controllers\Dashboard\SubscriptionController;
use App\Http\Controllers\Dashboard\UsageLogController;
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
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
    Route::post('users/{user}/add-credits', [UserController::class, 'addCredits'])->name('admin.users.add-credits');
    
    // Plans Management
    Route::get('plans', [PlanController::class, 'index'])->name('admin.plans.index');
    Route::post('plans', [PlanController::class, 'store'])->name('admin.plans.store');
    Route::get('plans/{plan}', [PlanController::class, 'show'])->name('admin.plans.show');
    Route::put('plans/{plan}', [PlanController::class, 'update'])->name('admin.plans.update');
    
    // Subscriptions Management
    Route::get('subscriptions', [SubscriptionController::class, 'index'])->name('admin.subscriptions.index');
    Route::get('subscriptions/{subscription}', [SubscriptionController::class, 'show'])->name('admin.subscriptions.show');
    
    // Beta Invitations Management
    Route::get('beta', [BetaController::class, 'index'])->name('admin.beta.index');
    Route::post('beta/store', [BetaController::class, 'store'])->name('admin.beta.store');
    Route::post('beta/{betaInvitation}/approve', [BetaController::class, 'approve'])->name('admin.beta.approve');
    Route::post('beta/{betaInvitation}/deny', [BetaController::class, 'deny'])->name('admin.beta.deny');
    Route::delete('beta/{betaInvitation}', [BetaController::class, 'destroy'])->name('admin.beta.destroy');
    
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
    
    // Module Management
    Route::get('modules', [ModuleController::class, 'index'])->name('admin.modules.index');
    Route::get('modules/{module}', [ModuleController::class, 'show'])->name('admin.modules.show');
    Route::get('modules/{module}/erd', [ModuleController::class, 'erd'])->name('admin.modules.erd');
    
    // Feedback Management
    Route::get('feedback', [FeedbackController::class, 'index'])->name('admin.feedback.index');
    Route::get('feedback/{feedback}', [FeedbackController::class, 'show'])->name('admin.feedback.show');
    Route::put('feedback/{feedback}', [FeedbackController::class, 'update'])->name('admin.feedback.update');
    Route::delete('feedback/{feedback}', [FeedbackController::class, 'destroy'])->name('admin.feedback.destroy');

    // Issue Management
    Route::get('issues', [IssueController::class, 'index'])->name('admin.issues.index');
    Route::get('issues/{issue}', [IssueController::class, 'show'])->name('admin.issues.show');
    Route::put('issues/{issue}', [IssueController::class, 'update'])->name('admin.issues.update');
    Route::delete('issues/{issue}', [IssueController::class, 'destroy'])->name('admin.issues.destroy');
    Route::post('issues/{issue}/comments', [IssueController::class, 'addComment'])->name('admin.issues.comments.store');
    
    // Usage Logs Management
    Route::get('usage-logs', [UsageLogController::class, 'index'])->name('admin.usage-logs.index');
    Route::get('usage-logs/{usageLog}', [UsageLogController::class, 'show'])->name('admin.usage-logs.show');
    
    // FastAPI Logs Management
    Route::prefix('logs/fastapi')->name('admin.logs.fastapi.')->group(function () {
        Route::get('/', [LogsController::class, 'index'])->name('index');
        Route::delete('/clear', [LogsController::class, 'clearLogs'])->name('clear');
        Route::get('/download/{logType}', [LogsController::class, 'downloadLog'])->name('download');
    });
    
    // Laravel Logs Management
    Route::prefix('logs/laravel')->name('admin.logs.laravel.')->group(function () {
        Route::get('/', [LaravelLogsController::class, 'index'])->name('index');
        Route::delete('/clear', [LaravelLogsController::class, 'clearLogs'])->name('clear');
        Route::get('/download/{logFile}', [LaravelLogsController::class, 'downloadLog'])->name('download');
    });
    
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
