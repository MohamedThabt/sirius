<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Traits\StructuredLogger;

class BrainstormingController extends Controller
{
    use StructuredLogger;

    /**
     * Display the brainstorming session for a project.
     *
     * @param Project $project
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function show(Project $project)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to view this project.');
            }

            return Inertia::render('Projects/Brainstorming', [
                'project' => $project,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'show', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load brainstorming session.');
        }
    }

    public function save(Request $request, Project $project)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to update this project.');
            }

            // Handle sendBeacon requests (raw JSON in request body)
            if ($request->isJson() && empty($request->all())) {
                $data = json_decode($request->getContent(), true);
                if (!isset($data['scene']) || !is_array($data['scene'])) {
                    return response()->json(['error' => 'Invalid data format'], 400);
                }
            } else {
                // Regular form request
                $data = $request->validate([
                    'scene' => ['required', 'array'],
                ]);
            }

            $project->brainstorming_scene = $data['scene'];
            $project->save();

            return back()->with('success', 'Brainstorming saved successfully!');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'save', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to save brainstorming data.');
        }
    }
}
