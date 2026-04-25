<?php

// use App\Http\Controllers\Beta\BetaSignupController;
use App\Http\Controllers\Project\BrainstormingController;
use App\Http\Controllers\Project\PRDController;
use App\Http\Controllers\Feature\FeaturesController;
use App\Http\Controllers\Feature\ERDController;
use App\Http\Controllers\Feature\SequenceDiagramController;
use App\Http\Controllers\Feature\WireframeController;
use App\Http\Controllers\Module\ModuleController;
use App\Http\Controllers\Module\ModuleERDController;
use App\Http\Controllers\Project\GithubController;
use App\Http\Controllers\Project\InvitationController;
use App\Http\Controllers\Project\ProjectController;
use App\Http\Controllers\Project\ProjectERDController;
use App\Http\Controllers\Project\ProjectTeamController;
use App\Http\Controllers\Project\SystemOverviewController;
use App\Http\Controllers\Project\ArchitectureController;
use App\Models\Project;
use App\Models\ProjectInvitation;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
    |
*/

// Route Model Binding
Route::bind('invitation', function ($value) {
    return ProjectInvitation::findOrFail($value);
});

// Constrain {project} to numeric IDs only (prevents SQL errors on invalid input like '#noise')
Route::pattern('project', '[0-9]+');

Route::get('/', function () {
    return Inertia::render('landing', [
        'canLogin' => Route::has('login'),
        // CLOSED BETA: Registration disabled
        // 'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('landing');

// Public Beta Signup Routes
// Route::get('/beta', [BetaSignupController::class, 'index'])->name('beta.page');
// Route::post('/beta/signup', [BetaSignupController::class, 'store'])
//     ->middleware('throttle:5,1')
//     ->name('beta.store');

// Team Page
Route::get('/team', function () {
    return Inertia::render('team');
})->name('team');

// Pricing Page
Route::get('/pricing', function () {
    return Inertia::render('pricing');
})->name('pricing');


// Project routes
// TODO: Add middleware 'verified'
Route::middleware(['auth', 'share.project'])->group(function () {
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/invitations', [ProjectController::class, 'invitations'])->name('projects.invitations');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');
    Route::get('/projects/{project}/prepare', [ProjectController::class, 'prepare'])->name('projects.prepare');
    Route::get('/projects/{project}/technology', [ProjectController::class, 'showTechnology'])->name('projects.technology');
    Route::post('/projects/{project}/technology/generate', [\App\Http\Controllers\Project\TechnicalDetailsController::class, 'generate'])->name('projects.technology.generate')->middleware('check.credits');
    Route::post('/projects/{project}/technology', [\App\Http\Controllers\Project\TechnicalDetailsController::class, 'store'])->name('projects.technology.store');
    Route::get('/projects/{project}/erd', [ProjectERDController::class, 'show'])->name('projects.erd.get');
    Route::post('/projects/{project}/erd/merge', [ProjectERDController::class, 'merge'])->name('projects.erd.merge');

    // Invitations
    Route::post('/projects/{project}/invitations', [InvitationController::class, 'store'])->name('invitations.store');
    Route::post('/invitations/{invitation}/accept', [InvitationController::class, 'accept'])->name('invitations.accept');
    Route::post('/invitations/{invitation}/decline', [InvitationController::class, 'decline'])->name('invitations.decline');
    Route::delete('/projects/{project}/invitations/{invitation}', [InvitationController::class, 'destroy'])->name('invitations.destroy');

    // C4 Diagram routes
    Route::get('/projects/{project}/c4', [ArchitectureController::class, 'getC4'])->name('projects.c4');
    Route::post('/projects/{project}/c4/generate', [ArchitectureController::class, 'generateC4'])->name('projects.c4.generate')->middleware('check.credits');
    Route::post('/projects/{project}/c4/generate-async', [ArchitectureController::class, 'generateC4Async'])->name('projects.c4.generate-async')->middleware('check.credits');
    Route::post('/projects/{project}/c4/ai-edit', [ArchitectureController::class, 'aiEditC4'])->name('projects.c4.ai-edit')->middleware('check.credits');
    Route::post('/projects/{project}/c4/save', [ArchitectureController::class, 'saveC4'])->name('projects.c4.save');
    Route::post('/projects/{project}/c4/edit', [ArchitectureController::class, 'editC4'])->name('projects.c4.edit');

    // Brainstorming routes
    Route::get('/projects/{project}/brainstorming', [BrainstormingController::class, 'show'])->name('projects.brainstorming');
    Route::get('/projects/{project}/brainstorming/scene', [BrainstormingController::class, 'show'])->name('projects.brainstorming.scene.show');
    Route::post('/projects/{project}/brainstorming/scene', [BrainstormingController::class, 'save'])->name('projects.brainstorming.scene.save');


    // System Overview Controller routes
    Route::post('/projects/{project}/system-overview/create', [SystemOverviewController::class, 'create'])->name('system-overview.create')->middleware('check.credits');
    Route::post('/projects/{project}/system-overview/generate-async', [SystemOverviewController::class, 'generateAsync'])->name('system-overview.generate-async')->middleware('check.credits');
    Route::post('/projects/{project}/system-overview/regenerate', [SystemOverviewController::class, 'regenerate'])->name('system-overview.regenerate')->middleware('check.credits');
    Route::get('/projects/{project}/system-overview', [SystemOverviewController::class, 'show'])->name('projects.system-overview');
    Route::post('/projects/{project}/system-overview/update-with-ai', [SystemOverviewController::class, 'updateWithAi'])->name('system-overview.update-with-ai')->middleware('check.credits');
    Route::post('/projects/{project}/system-overview/{overviewVersion}/user-update', [SystemOverviewController::class, 'userUpdate'])->name('system-overview.user-update');
    Route::post('/projects/{project}/system-overview/{overviewVersion}/mark-as-base', [SystemOverviewController::class, 'markAsBase'])->name('system-overview.mark-as-base');
    Route::post('/projects/{project}/system-overview/preview-mermaid', [SystemOverviewController::class, 'previewMermaid'])->name('system-overview.preview-mermaid');
    Route::post('/projects/{project}/system-overview/preview', [SystemOverviewController::class, 'previewOverview'])->name('system-overview.preview');

    // PRD routes
    Route::post('/projects/{project}/prd/generate', [PRDController::class, 'generate'])->name('prd.generate')->middleware('check.credits');
    Route::post('/projects/{project}/prd/generate-async', [PRDController::class, 'generateAsync'])->name('prd.generate-async')->middleware('check.credits');
    Route::get('/projects/{project}/prd', [PRDController::class, 'show'])->name('projects.prd');
    Route::post('/projects/{project}/prd/edit', [PRDController::class, 'edit'])->name('prd.edit');
    Route::post('/projects/{project}/prd/ai-edit', [PRDController::class, 'aiEdit'])->name('prd.ai-edit')->middleware('check.credits');
    Route::post('/projects/{project}/prd/sync', [PRDController::class, 'sync'])->name('prd.sync');
    Route::post('/projects/{project}/prd/preview-mermaid', [PRDController::class, 'previewMermaid'])->name('prd.preview-mermaid');
    Route::post('/projects/{project}/prd/preview', [PRDController::class, 'previewPrd'])->name('prd.preview');

    // Features routes (module-based)
    Route::get('/projects/{project}/features', [FeaturesController::class, 'index'])->name('features.index');
    
    // Feature generation routes (module-based) - MUST come before show route to avoid conflicts
    Route::get('/projects/{project}/modules/{module}/features/create', [FeaturesController::class, 'generateSuggestionFeatures'])->name('features.module.create')->middleware('check.credits');
    Route::post('/projects/{project}/modules/{module}/features/regenerate', [FeaturesController::class, 'regenerateSuggestionFeatures'])->name('features.module.regenerate')->middleware('check.credits');
    Route::post('/projects/{project}/modules/{module}/features/create', [FeaturesController::class, 'createSystemFeatures'])->name('features.module.store')->middleware('check.credits');
    Route::post('/projects/{project}/modules/{module}/features/single', [FeaturesController::class, 'createSingleFeature'])->name('features.module.single.store')->middleware('check.credits');
    
    // Feature detail routes (must come after specific routes like 'create')
    Route::get('/projects/{project}/modules/{module}/features/{feature}', [FeaturesController::class, 'show'])->name('features.show');
    Route::get('/projects/{project}/modules/{module}/features/{feature}/specs', [FeaturesController::class, 'specs'])->name('features.specs.show');
    Route::put('/projects/{project}/modules/{module}/features/{feature}/update', [FeaturesController::class, 'update'])->name('features.update');
    Route::delete('/projects/{project}/modules/{module}/features/{feature}', [FeaturesController::class, 'destroy'])->name('features.destroy');
    
    // Modules Controller routes
    Route::get('/projects/{project}/modules', [ModuleController::class, 'index'])->name('modules.index');
    Route::get('/modules/create/{project}', [ModuleController::class, 'generateSuggestionModules'])->name('modules.create')->middleware('check.credits');
    Route::post('/modules/create/{project}', [ModuleController::class, 'createSystemModules'])->name('modules.store')->middleware('check.credits');
    Route::post('/modules/single/{project}', [ModuleController::class, 'createSingleModule'])->name('modules.single.store')->middleware('check.credits');
    Route::post('/modules/regenerate/{project}', [ModuleController::class, 'regenerateSuggestionModules'])->name('modules.regenerate')->middleware('check.credits');
    Route::get('/projects/{project}/modules/{module}', [ModuleController::class, 'show'])->name('modules.show');
    Route::put('/projects/{project}/modules/{module}/update', [ModuleController::class, 'update'])->name('modules.update');
    Route::delete('/projects/{project}/modules/{module}', [ModuleController::class, 'destroy'])->name('modules.destroy');

    // Module ERD routes
    Route::get('/projects/{project}/modules/{module}/erd', [ModuleERDController::class, 'show'])->name('modules.erd.show');
    Route::post('/projects/{project}/modules/{module}/erd/generate', [ModuleERDController::class, 'generate'])->name('modules.erd.generate')->middleware('check.credits');
    Route::post('/projects/{project}/modules/{module}/erd/generate-async', [ModuleERDController::class, 'generateAsync'])->name('modules.erd.generate-async')->middleware('check.credits');
    Route::post('/projects/{project}/modules/{module}/erd/ai-edit', [ModuleERDController::class, 'aiEdit'])->name('modules.erd.ai-edit')->middleware('check.credits');
    Route::post('/projects/{project}/modules/{module}/erd/edit', [ModuleERDController::class, 'edit'])->name('modules.erd.edit');
    Route::post('/projects/{project}/modules/{module}/erd/sync', [ModuleERDController::class, 'syncFromFeatures'])->name('modules.erd.sync');

    // Feature datamodel routes (ERD extracted from module during feature creation)
    Route::get('/features/{feature}/datamodel', [ERDController::class, 'show'])->name('features.datamodel.show');
    Route::post('/features/{feature}/datamodel/ai-edit', [ERDController::class, 'aiEdit'])->name('features.datamodel.ai-edit')->middleware('check.credits');
    Route::post('/features/{feature}/datamodel/edit', [ERDController::class, 'edit'])->name('features.datamodel.edit');

    // Sequence Diagram by feature id
    Route::get('/features/{feature}/sequence-diagram', [SequenceDiagramController::class, 'show'])->name('features.sequence.show');
    Route::post('/features/{feature}/sequence-diagram/generate', [SequenceDiagramController::class, 'generate'])->name('features.sequence.generate')->middleware('check.credits');
    Route::post('/features/{feature}/sequence-diagram/generate-async', [SequenceDiagramController::class, 'generateAsync'])->name('features.sequence.generate-async')->middleware('check.credits');
    Route::post('/features/{feature}/sequence-diagram/ai-edit', [SequenceDiagramController::class, 'aiEdit'])->name('features.sequence.ai-edit')->middleware('check.credits');
    Route::post('/features/{feature}/sequence-diagram/edit', [SequenceDiagramController::class, 'edit'])->name('features.sequence.edit');

    // Wireframe by feature id
    Route::get('/features/{feature}/wireframe', [WireframeController::class, 'show'])->name('features.wireframe.show');
    Route::post('/features/{feature}/wireframe/generate', [WireframeController::class, 'generate'])->name('features.wireframe.generate')->middleware('check.credits');
    Route::post('/features/{feature}/wireframe/generate-async', [WireframeController::class, 'generateAsync'])->name('features.wireframe.generate-async')->middleware('check.credits');
    Route::post('/features/{feature}/wireframe/ai-edit', [WireframeController::class, 'aiEdit'])->name('features.wireframe.ai-edit')->middleware('check.credits');

    // GitHub Integration routes
    Route::get('/projects/{project}/github/connect', [GithubController::class, 'ensureAuth'])->name('projects.github.connect');
    Route::get('/integrations/github/redirect', [GithubController::class, 'redirect'])->name('github.redirect');
    Route::get('/integrations/github/callback', [GithubController::class, 'callback'])->name('github.callback');
    Route::get('/projects/{project}/github/repos', [GithubController::class, 'listRepos'])->name('projects.github.repos');
    Route::post('/projects/{project}/github/repos', [GithubController::class, 'createRepo'])->name('projects.github.repos.create');
    Route::post('/projects/{project}/github/link', [GithubController::class, 'linkExistingRepo'])->name('projects.github.link');
    Route::post('/projects/{project}/github/push-initial', [GithubController::class, 'pushInitial'])->name('projects.github.push-initial');
    Route::delete('/projects/{project}/github/repos', [GithubController::class, 'deleteRepo'])->name('projects.github.repos.delete');
    Route::post('/projects/{project}/github/repos/sync', [GithubController::class, 'syncRepo'])->name('projects.github.repos.sync');

    // Team Collaboration Routes
    Route::get('/projects/{project}/team', [ProjectTeamController::class, 'index'])->name('projects.team.index');
    Route::get('/team/my-invitations', [ProjectTeamController::class, 'myInvitations'])->name('team.myInvitations');
    Route::patch('/projects/{project}/team/role', [ProjectTeamController::class, 'updateRole'])->name('projects.team.updateRole');
    Route::delete('/projects/{project}/team/member/{user}', [ProjectTeamController::class, 'removeMember'])->name('projects.team.removeMember');
    Route::post('/projects/{project}/team/leave', [ProjectTeamController::class, 'leave'])->name('projects.team.leave');
});

// Beta Feedback Widget Routes (authenticated users)
Route::middleware(['auth'])->prefix('beta')->name('beta.')->group(function () {
    // Feedback (Suggestions, UX issues)
    Route::get('/feedback', [\App\Http\Controllers\Beta\FeedbackController::class, 'index'])->name('feedback.index');
    Route::post('/feedback', [\App\Http\Controllers\Beta\FeedbackController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('feedback.store');
    Route::get('/feedback/{feedback}', [\App\Http\Controllers\Beta\FeedbackController::class, 'show'])->name('feedback.show');

    // Issue Reports (Bugs)
    Route::get('/issues', [\App\Http\Controllers\Beta\IssueController::class, 'index'])->name('issues.index');
    Route::post('/issues', [\App\Http\Controllers\Beta\IssueController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('issues.store');
    Route::get('/issues/{issue}', [\App\Http\Controllers\Beta\IssueController::class, 'show'])->name('issues.show');
});

// Pro Upgrade Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/upgrade/pro', [\App\Http\Controllers\Billing\PaymentController::class, 'upgradePro'])->name('upgrade.pro');
    Route::post('/upgrade/pro', [\App\Http\Controllers\Billing\PaymentController::class, 'acceptProPayment'])->name('upgrade.pro.submit');
});

// User Questionnaire
Route::middleware(['auth'])->group(function () {
    Route::post('/user/questionnaire', [\App\Http\Controllers\User\UserQuestionController::class, 'store'])->name('user.questionnaire.store');
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';

// Admin Routes
Route::prefix('admin')->group(function () {
    require __DIR__.'/admin.php';
});

