<?php

namespace App\Http\Middleware;

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
     */
    public function handle(Request $request, Closure $next): Response
    {
        $project = $request->route('project');

        if ($project) {
            // Ensure repository is loaded
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
