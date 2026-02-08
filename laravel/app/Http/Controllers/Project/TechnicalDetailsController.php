<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\AiUsageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Support\AppLogger;
use App\Traits\StructuredLogger;

class TechnicalDetailsController extends Controller
{
    use StructuredLogger;

    /**
     * Store or update technical details from form submission.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request, Project $project)
    {
        try {
            // Ensure user owns the project or is a team member
            if ($project->user_id !== auth()->id() && !$project->hasMember(auth()->id())) {
                return back()->with('error', 'You do not have permission to update this project.');
            }

            $validated = $request->validate([
                'platform_targets' => 'nullable|string|max:2000',
                'frontend_tech' => 'nullable|string|max:2000',
                'backend_tech' => 'nullable|string|max:2000',
                'database_tech' => 'nullable|string|max:2000',
                'ai_usage' => 'nullable|string|max:2000',
                'external_services' => 'nullable|string|max:2000',
            ]);

            // Create or update technical intake
            $project->technicalIntake()->updateOrCreate(
                ['project_id' => $project->id],
                [
                    'platform_targets' => $validated['platform_targets'] ?? null,
                    'frontend_tech' => $validated['frontend_tech'] ?? null,
                    'backend_tech' => $validated['backend_tech'] ?? null,
                    'database_tech' => $validated['database_tech'] ?? null,
                    'ai_usage' => $validated['ai_usage'] ?? null,
                    'external_services' => $validated['external_services'] ?? null,
                ],
            );

            // Also update the project's technical_details field for progress calculation
            $project->update([
                'technical_details' => json_encode($validated),
            ]);

            AppLogger::business('technical_details.updated.manual', [
                'project_id' => $project->id,
                'user_id' => auth()->id(),
            ]);

            return redirect()->route('projects.technology', $project)
                ->with('success', 'Technical details saved successfully.');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'store', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to save technical details.');
        }
    }

    /**
     * Generate technical details from project brief using AI.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function generate(Request $request, Project $project)
    {
        try {
            // Ensure user owns the project or is a team member
            if ($project->user_id !== auth()->id() && !$project->hasMember(auth()->id())) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            // Ensure project has a brief
            if (empty($project->brief)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Project brief is required before generating technical details.',
                ], 400);
            }

            // Check if technical intake already exists
            $existingIntake = $project->technicalIntake;
            if ($existingIntake) {
                return response()->json([
                    'success' => false,
                    'message' => 'Technical details already exist. Navigate to the Technology page to view or edit.',
                ], 400);
            }

            // Increase execution time for FastAPI calls
            set_time_limit(180);

            // Call FastAPI endpoint to generate technical details
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::fastapi()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/TechnicalDetails/generate', [
                    'project_brief' => $project->brief,
                    'project_name' => $project->name,
                ]);

            if ($response->successful()) {
                $data = $response->json();

                // Validate and record usage if present
                if (isset($data['usage'])) {
                    app(AiUsageService::class)->handle(
                        auth()->user(),
                        'technical_details_generation',
                        $data['usage'],
                        $data['model'] ?? null
                    );
                }

                // Extract technical details from response
                $technicalDetails = $data['technical_details'] ?? $data;

                // Create or update technical intake
                $project->technicalIntake()->updateOrCreate(
                    ['project_id' => $project->id],
                    [
                        'platform_targets' => $technicalDetails['platform_targets'] ?? null,
                        'frontend_tech' => $technicalDetails['frontend_tech'] ?? null,
                        'backend_tech' => $technicalDetails['backend_tech'] ?? null,
                        'database_tech' => $technicalDetails['database_tech'] ?? null,
                        'ai_usage' => $technicalDetails['ai_usage'] ?? null,
                        'external_services' => $technicalDetails['external_services'] ?? null,
                    ],
                );

                // Also update the project's technical_details field for progress calculation
                $project->update([
                    'technical_details' => json_encode($technicalDetails),
                ]);

                AppLogger::business('technical_details.generated', [
                    'project_id' => $project->id,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Technical details generated successfully.',
                    'redirect' => route('projects.technology', $project),
                ]);
            } else {
                throw new \Exception('FastAPI technical details generation failed: ' . $response->body());
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'generate', 'project_id' => $project->id]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate technical details. Please try again.',
            ], 500);
        }
    }
}
