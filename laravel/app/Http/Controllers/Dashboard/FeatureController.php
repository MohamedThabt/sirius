<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use App\Services\Feature\FeatureSpecService;
use App\Traits\StructuredLogger;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class FeatureController extends Controller
{
    use StructuredLogger;

    public function __construct(
        private readonly FeatureSpecService $featureSpecService
    ) {}

    /**
     * Display detailed information about a specific feature.
     *
     * Loads the feature with its project, sibling features, and statistics.
     *
     * @param Feature $feature The feature to display
     * @return Response Inertia response rendering the feature show page
     */
    public function show(Feature $feature)
    {
        try {
            $feature->load([
                'module:id,name,project_id,status,order_of_implementation',
                'module.project:id,name',
                'module.project.user:id,name,email,avatar'
            ]);

            // Get sibling features from the same module for context
            $siblingFeatures = Feature::where('module_id', $feature->module_id)
                ->orderBy('order_of_implementation')
                ->get(['id', 'name', 'status', 'priority', 'order_of_implementation']);

            // Feature statistics
            $featureStats = [
                'has_datamodel' => !empty($feature->datamodel),
                'has_sequence_diagram' => !empty($feature->sequence_diagram),
                'has_wireframe' => !empty($feature->wireframe),
                'has_user_flows' => !empty($feature->user_flows),
                'has_metrics' => !empty($feature->metrics),
                'has_acceptance_criteria' => !empty($feature->acceptance_criteria),
                'has_description' => !empty($feature->description),
                'has_summary' => !empty($feature->summary),
                'position_in_module' => $feature->order_of_implementation,
                'total_features_in_module' => $siblingFeatures->count(),
                'completion_score' => $this->calculateCompletionScore($feature),
            ];

            return Inertia::render('dashboard/features/show', [
                'feature' => $feature,
                'module' => $feature->module,
                'project' => $feature->module->project,
                'siblingFeatures' => $siblingFeatures,
                'featureStats' => $featureStats,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'feature_id' => $feature->id]);
            return back()->with('error', 'Failed to load feature details. Please try again.');
        }
    }

    /**
     * Display the Specifications page for a feature.
     *
     * @param Feature $feature The feature to display specs for
     * @return Response Inertia response rendering the specs page
     */
    public function specs(Feature $feature)
    {
        try {
            $feature->load('project:id,name');

            // Generate markdown content using the service
            $specsMarkdown = $this->featureSpecService->generateSpecsMarkdown($feature);

            return Inertia::render('dashboard/features/specs', [
                'project' => $feature->project,
                'feature' => $feature->only([
                    'id', 
                    'name', 
                    'project_id', 
                    'summary',
                    'description',
                    'acceptance_criteria',
                    'user_flows',
                    'metrics',
                    'priority',
                    'order_of_implementation',
                ]),
                'specsMarkdown' => $specsMarkdown,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'specs', 'feature_id' => $feature->id]);
            return back()->with('error', 'Failed to load specifications. Please try again.');
        }
    }

    /**
     * Display the data model (ERD) for a feature.
     *
     * @param Feature $feature The feature to display data model for
     * @return Response Inertia response rendering the database designer page
     */
    public function erd(Feature $feature)
    {
        try {
            $feature->load('module.project:id,name');

            return Inertia::render('dashboard/features/database-designer', [
                'project' => $feature->module->project,
                'feature' => array_merge($feature->only(['id', 'name', 'module_id', 'datamodel']), [
                    'project_id' => $feature->module->project_id,
                ]),
                'initialContent' => $feature->datamodel ?? '',
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'erd', 'feature_id' => $feature->id]);
            return back()->with('error', 'Failed to load database schema. Please try again.');
        }
    }

    /**
     * Display the Sequence Diagram for a feature.
     *
     * @param Feature $feature The feature to display sequence diagram for
     * @return Response Inertia response rendering the sequence diagram page
     */
    public function sequenceDiagram(Feature $feature)
    {
        try {
            $feature->load('module.project:id,name');

            return Inertia::render('dashboard/features/sequence-diagram', [
                'project' => $feature->module->project,
                'feature' => array_merge($feature->only(['id', 'name', 'module_id', 'sequence_diagram']), [
                    'project_id' => $feature->module->project_id,
                ]),
                'initialContent' => $feature->sequence_diagram ?? '',
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'sequence_diagram', 'feature_id' => $feature->id]);
            return back()->with('error', 'Failed to load sequence diagram. Please try again.');
        }
    }

    /**
     * Display the Wireframe for a feature.
     *
     * @param Feature $feature The feature to display wireframe for
     * @return Response Inertia response rendering the wireframe page
     */
    public function wireframe(Feature $feature)
    {
        try {
            $feature->load('project:id,name');

            return Inertia::render('dashboard/features/wireframe', [
                'project' => $feature->project,
                'feature' => $feature->only(['id', 'name', 'project_id', 'wireframe']),
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'wireframe', 'feature_id' => $feature->id]);
            return back()->with('error', 'Failed to load wireframe. Please try again.');
        }
    }

    /**
     * Display the User Journey for a feature.
     *
     * @param Feature $feature The feature to display user journey for
     * @return Response Inertia response rendering the user journey page
     */
    public function userJourney(Feature $feature)
    {
        try {
            $feature->load('project:id,name');

            return Inertia::render('dashboard/features/user-journey', [
                'project' => $feature->project,
                'feature' => $feature->only(['id', 'name', 'project_id', 'user_flows']),
                'initialContent' => $feature->user_flows ?? '',
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'user_journey', 'feature_id' => $feature->id]);
            return back()->with('error', 'Failed to load user journey. Please try again.');
        }
    }

    /**
     * Calculate the completion score for a feature.
     *
     * @param Feature $feature
     * @return int Completion percentage (0-100)
     */
    private function calculateCompletionScore(Feature $feature): int
    {
        $fields = [
            'summary',
            'description',
            'acceptance_criteria',
            'user_flows',
            'metrics',
            'datamodel',
            'sequence_diagram',
            'wireframe',
        ];

        $completed = 0;
        foreach ($fields as $field) {
            if (!empty($feature->$field)) {
                $completed++;
            }
        }

        return (int) round(($completed / count($fields)) * 100);
    }
}
