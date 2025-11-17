<?php

namespace App\Http\Controllers\Documentation;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrainstormingController extends Controller
{
    public function show(Project $project): Response
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Projects/Brainstorming', [
            'project' => $project,
        ]);
    }

    public function save(Request $request, Project $project)
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $data = $request->validate([
            'scene' => ['required', 'array'],
        ]);

        $project->brainstorming_scene = $data['scene'];
        $project->save();

        return redirect()->route('projects.brainstorming', $project)->with('success', 'Brainstorming saved');
    }
}


