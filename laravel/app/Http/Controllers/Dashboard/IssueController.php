<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\IssueComment;
use App\Models\IssueReport;
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
     * List all issues with filters.
     *
     * Supports filtering by search (title/description/user), severity, and status.
     *
     */
    public function index(Request $request)
    {
        try {
            $query = IssueReport::with('user:id,name,email');

            // Search filter
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($uq) use ($search) {
                          $uq->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            // Severity filter
            if ($request->filled('severity')) {
                $query->where('severity', $request->severity);
            }

            // Status filter
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $issues = $query->latest()->paginate(15)->withQueryString();

            // Summary stats
            $summary = [
                'total' => IssueReport::count(),
                'open' => IssueReport::where('status', IssueReport::STATUS_OPEN)->count(),
                'investigating' => IssueReport::where('status', IssueReport::STATUS_INVESTIGATING)->count(),
                'fixed' => IssueReport::where('status', IssueReport::STATUS_FIXED)->count(),
                'blockers' => IssueReport::where('severity', IssueReport::SEVERITY_BLOCKER)
                    ->whereIn('status', [IssueReport::STATUS_OPEN, IssueReport::STATUS_INVESTIGATING])
                    ->count(),
            ];

            return Inertia::render('dashboard/issues/index', [
                'issues' => $issues,
                'filters' => $request->only(['search', 'severity', 'status']),
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
                'summary' => $summary,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load issues. Please try again.');
        }
    }

    /**
     * Show issue details with all comments (including internal).
     *
     */
    public function show(IssueReport $issue)
    {
        try {
            $issue->load([
                'user:id,name,email',
                'comments.admin:id,name',
            ]);

            // Add screenshot URL if exists
            $issue->screenshot_url = $issue->screenshot_path 
                ? Storage::disk('public')->url($issue->screenshot_path) 
                : null;

            return Inertia::render('dashboard/issues/show', [
                'issue' => $issue,
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
            $this->logException($e, ['action' => 'show', 'issue_id' => $issue->id]);
            return back()->with('error', 'Failed to load issue. Please try again.');
        }
    }

    /**
     * Update issue status or severity.
     *
     * Expects request data: { status?: string, severity?: string }
     *
     */
    public function update(Request $request, IssueReport $issue)
    {
        try {
            // Note: Laravel will handle validation exceptions automatically
            $validated = $request->validate([
                'status' => ['sometimes', 'required', Rule::in([
                    IssueReport::STATUS_OPEN,
                    IssueReport::STATUS_INVESTIGATING,
                    IssueReport::STATUS_FIXED,
                    IssueReport::STATUS_WONT_FIX,
                ])],
                'severity' => ['sometimes', 'required', Rule::in([
                    IssueReport::SEVERITY_LOW,
                    IssueReport::SEVERITY_MEDIUM,
                    IssueReport::SEVERITY_HIGH,
                    IssueReport::SEVERITY_BLOCKER,
                ])],
            ]);

            $data = [];

            if (isset($validated['status'])) {
                $data['status'] = $validated['status'];
            }

            if (isset($validated['severity'])) {
                $data['severity'] = $validated['severity'];
            }

            if (!empty($data)) {
                $issue->update($data);
            }

            return back()->with('success', 'Issue updated successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'update', 'issue_id' => $issue->id]);
            return back()->with('error', 'Failed to update issue. Please try again.');
        }
    }

    /**
     * Delete an invalid issue.
     *
     * Also deletes associated screenshot if exists.
     *
     */
    public function destroy(IssueReport $issue)
    {
        try {
            // Delete screenshot if exists
            if ($issue->screenshot_path) {
                Storage::disk('public')->delete($issue->screenshot_path);
            }

            $issue->delete();

            return back()->with('success', 'Issue deleted successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'destroy', 'issue_id' => $issue->id]);
            return back()->with('error', 'Failed to delete issue. Please try again.');
        }
    }

    /**
     * Add an admin comment to an issue.
     *
     * Expects request data: { comment: string }
     *
     * @param Request $request The incoming HTTP request
     * @param IssueReport $issue The issue report model instance
     * @return RedirectResponse Redirect with success or error message
     */
    public function addComment(Request $request, IssueReport $issue): RedirectResponse
    {
        try {
            // Note: Laravel will handle validation exceptions automatically
            $validated = $request->validate([
                'comment' => ['required', 'string', 'min:5', 'max:5000'],
            ]);

            IssueComment::create([
                'issue_report_id' => $issue->id,
                'admin_id' => auth('admin')->id(),
                'comment' => trim($validated['comment']),
                'created_at' => now(),
            ]);

            return back()->with('success', 'Comment added successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'addComment', 'issue_id' => $issue->id]);
            return back()->with('error', 'Failed to add comment. Please try again.');
        }
    }
}
