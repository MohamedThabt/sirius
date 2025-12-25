<?php

namespace App\Http\Controllers\Beta;

use App\Http\Controllers\Controller;
use App\Models\IssueReport;
use App\Services\Notification\TelegramNotificationService;
use App\Traits\StructuredLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class IssueController extends Controller
{
    use StructuredLogger;

    /**
     * List issues submitted by the logged-in user.
     *
     * @param Request $request The incoming HTTP request
     * @return Response Inertia response rendering the user's issues list
     */
    public function index(Request $request): Response
    {
        try {
            $issues = auth()->user()
                ->issueReports()
                ->select(['id', 'title', 'severity', 'status', 'page_url', 'created_at', 'updated_at'])
                ->latest()
                ->paginate(10)
                ->withQueryString();

            return Inertia::render('beta/issues/index', [
                'issues' => $issues,
                'severities' => [
                    ['value' => IssueReport::SEVERITY_LOW, 'label' => 'Low'],
                    ['value' => IssueReport::SEVERITY_MEDIUM, 'label' => 'Medium'],
                    ['value' => IssueReport::SEVERITY_HIGH, 'label' => 'High'],
                    ['value' => IssueReport::SEVERITY_BLOCKER, 'label' => 'Blocker'],
                ],
                'statuses' => [
                    ['value' => IssueReport::STATUS_OPEN, 'label' => 'Open'],
                    ['value' => IssueReport::STATUS_INVESTIGATING, 'label' => 'Investigating'],
                    ['value' => IssueReport::STATUS_FIXED, 'label' => 'Fixed'],
                    ['value' => IssueReport::STATUS_WONT_FIX, 'label' => "Won't Fix"],
                ],
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load issues. Please try again.');
        }
    }

    /**
     * Submit a new issue report.
     *
     * Expects request data: { title, description, steps, expected, actual, severity, page_url?, screenshot? }
     *
     * @param Request $request The incoming HTTP request
     * @return RedirectResponse Redirect with success or error message
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
                'title' => ['required', 'string', 'max:255'],
                'description' => ['required', 'string', 'min:20', 'max:10000'],
                'steps' => ['required', 'string', 'max:5000'],
                'expected' => ['required', 'string', 'max:2000'],
                'actual' => ['required', 'string', 'max:2000'],
                'severity' => ['required', Rule::in([
                    IssueReport::SEVERITY_LOW,
                    IssueReport::SEVERITY_MEDIUM,
                    IssueReport::SEVERITY_HIGH,
                    IssueReport::SEVERITY_BLOCKER,
                ])],
                'page_url' => ['nullable', 'string', 'max:500'],
                'screenshot' => ['nullable', 'image', 'max:5120'], // 5MB max
            ]);

        try {
 
            $data = [
                'title' => trim($validated['title']),
                'description' => trim($validated['description']),
                'steps' => trim($validated['steps']),
                'expected' => trim($validated['expected']),
                'actual' => trim($validated['actual']),
                'severity' => $validated['severity'],
                'page_url' => $validated['page_url'] ?? $request->header('referer', '/'),
                'status' => IssueReport::STATUS_OPEN,
                'meta' => [
                    'user_agent' => $request->userAgent(),
                    'submitted_at' => now()->toISOString(),
                ],
            ];

            // Handle screenshot upload
            if ($request->hasFile('screenshot')) {
                $path = $request->file('screenshot')->store('issue-screenshots', 'public');
                $data['screenshot_path'] = $path;
            }

            $issue = auth()->user()->issueReports()->create($data);

            // Send Telegram notification
            try {
                app(TelegramNotificationService::class)->notifyNewIssue($issue, auth()->user());
            } catch (Throwable $e) {
                // Log but don't fail the request if notification fails
                $this->logException($e, ['action' => 'telegram_notification', 'issue_id' => $issue->id]);
            }

            return back()->with('success', 'Issue reported successfully. We will investigate it shortly.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'store']);
            return back()->with('error', 'Failed to submit issue. Please try again.');
        }
    }

    /**
     * View issue status and details.
     *
     * Users can only view their own issues.
     * Internal comments are hidden from users.
     *
     * @param IssueReport $issue The issue report model instance
     * @return Response|RedirectResponse Inertia response or redirect on error
     */
    public function show(IssueReport $issue): Response|RedirectResponse
    {
        // Authorization: users can only view their own issues
        if ($issue->user_id !== auth()->id()) {
            return back()->with('error', 'You are not authorized to view this issue.');
        }

        try {

            // Load all comments
            $issue->load(['comments.admin:id,name']);

            // Format issue data for display
            $issueData = [
                'id' => $issue->id,
                'title' => $issue->title,
                'description' => $issue->description,
                'steps' => $issue->steps,
                'expected' => $issue->expected,
                'actual' => $issue->actual,
                'severity' => $issue->severity,
                'status' => $issue->status,
                'page_url' => $issue->page_url,
                'screenshot_url' => $issue->screenshot_path 
                    ? Storage::disk('public')->url($issue->screenshot_path) 
                    : null,
                'created_at' => $issue->created_at,
                'updated_at' => $issue->updated_at,
                'comments' => $issue->comments->map(fn($c) => [
                    'id' => $c->id,
                    'comment' => $c->comment,
                    'admin_name' => $c->admin->name ?? 'Team',
                    'created_at' => $c->created_at,
                ]),
            ];

            return Inertia::render('beta/issues/show', [
                'issue' => $issueData,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'issue_id' => $issue->id]);
            return back()->with('error', 'Failed to load issue. Please try again.');
        }
    }
}
