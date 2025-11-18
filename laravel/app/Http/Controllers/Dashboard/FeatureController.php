<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use App\Models\Project;
use Inertia\Inertia;
use Inertia\Response;

class FeatureController extends Controller
{
    public function show(Feature $feature): Response
    {
        $feature->load('project.user');
        
        return Inertia::render('dashboard/features/show', [
            'feature' => $feature,
            'project' => $feature->project,
        ]);
    }
}
