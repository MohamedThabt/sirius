<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Project;
use App\Traits\StructuredLogger;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ModuleController extends Controller
{
    use StructuredLogger;

    /**
     * Display a listing of all modules across all projects.
     *
     * @return Response Inertia response rendering the modules index page
     */
    public function index(): Response
    {
        try {
            $modules = Module::with([
                'project:id,name,status',
                'project.user:id,name,email,avatar',
            ])
                ->withCount('features')
                ->latest()
                ->paginate(15);

            // Module statistics
            $stats = [
                'total_modules' => Module::count(),
                'modules_by_status' => Module::selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
                'modules_with_erd' => Module::whereNotNull('erd')
                    ->where('erd', '!=', '')
                    ->count(),
                'modules_with_synced_erd' => Module::where('erd_is_synced', true)->count(),
                'total_features' => \App\Models\Feature::count(),
            ];

            return Inertia::render('dashboard/modules/index', [
                'modules' => $modules,
                'stats' => $stats,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load modules. Please try again.');
        }
    }

    /**
     * Display detailed information about a specific module.
     *
     * @param Module $module The module to display
     * @return Response Inertia response rendering the module show page
     */
    public function show(Module $module): Response
    {
        try {
            $module->load([
                'project:id,name,status',
                'project.user:id,name,email,avatar',
                'features' => function ($query) {
                    $query->orderBy('order_of_implementation');
                },
            ]);

            // Get sibling modules for context
            $siblingModules = Module::where('project_id', $module->project_id)
                ->orderBy('order_of_implementation')
                ->get(['id', 'name', 'status', 'order_of_implementation']);

            // Module statistics
            $moduleStats = [
                'has_erd' => !empty($module->erd),
                'erd_is_synced' => $module->erd_is_synced ?? false,
                'has_description' => !empty($module->description),
                'has_metrics' => !empty($module->metrics),
                'total_features' => $module->features->count(),
                'features_by_status' => $module->features->groupBy('status')
                    ->map(fn($group) => $group->count())
                    ->toArray(),
                'features_by_priority' => $module->features->groupBy('priority')
                    ->map(fn($group) => $group->count())
                    ->toArray(),
                'position_in_project' => $module->order_of_implementation,
                'total_modules_in_project' => $siblingModules->count(),
                'completion_score' => $this->calculateModuleCompletionScore($module),
            ];

            return Inertia::render('dashboard/modules/show', [
                'module' => $module,
                'project' => $module->project,
                'features' => $module->features,
                'siblingModules' => $siblingModules,
                'moduleStats' => $moduleStats,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'module_id' => $module->id]);
            return back()->with('error', 'Failed to load module details. Please try again.');
        }
    }

    /**
     * Display the ERD for a module.
     *
     * @param Module $module The module to display ERD for
     * @return Response Inertia response rendering the database designer page
     */
    public function erd(Module $module): Response
    {
        try {
            $module->load('project:id,name');

            return Inertia::render('dashboard/modules/erd', [
                'project' => $module->project,
                'module' => $module->only(['id', 'name', 'project_id', 'erd', 'erd_is_synced']),
                'initialContent' => $module->erd ?? '',
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'erd', 'module_id' => $module->id]);
            return back()->with('error', 'Failed to load module ERD. Please try again.');
        }
    }

    /**
     * Calculate completion score for a module based on available data.
     *
     * @param Module $module
     * @return int Percentage of completion (0-100)
     */
    private function calculateModuleCompletionScore(Module $module): int
    {
        $checks = [
            !empty($module->name),
            !empty($module->description),
            !empty($module->metrics),
            !empty($module->erd),
            $module->erd_is_synced ?? false,
            $module->features->count() > 0,
        ];

        $completed = count(array_filter($checks));
        return (int) round(($completed / count($checks)) * 100);
    }
}
