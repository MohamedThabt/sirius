<?php

namespace App\Http\Middleware;

use App\Models\Feature;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ShareProjectData
{
    /**
     * Handle an incoming request.
     *
     * Shares project and repository data via Inertia for all project-scoped routes.
     * 
     * This middleware handles two types of routes:
     * 1. Project routes: /projects/{project}/... - directly uses the {project} parameter
     * 2. Feature routes: /features/{feature}/... - traverses feature → module → project
     * 
     * This enables GitHub connection display on feature diagram pages (ERD, Sequence, Wireframe)
     * which use the {feature} parameter instead of {project}.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $project = $request->route('project');

        // If no {project} route parameter, try to resolve project from {feature} parameter.
        // Feature diagram routes use /features/{feature}/... pattern, so we need to
        // traverse the relationship chain: feature → module → project
        if (!$project) {
            $feature = $request->route('feature');
            
            if ($feature instanceof Feature) {
                // Load the module.project relationship to access the parent project
                $feature->loadMissing('module.project');
                $project = $feature->module?->project;
            }
        }

        if ($project) {
            // Ensure repository is loaded for GitHub connection display in sidebar
            $project->loadMissing('repository');

            Inertia::share([
                'currentProject' => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'status' => $project->status,
                ],
                'repository' => $project->repository,
            ]);
        }

        return $next($request);
    }
}
