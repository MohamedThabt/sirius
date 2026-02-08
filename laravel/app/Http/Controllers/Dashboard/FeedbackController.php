<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Support\AppLogger;
use App\Traits\StructuredLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class FeedbackController extends Controller
{
    use StructuredLogger;

    /**
     * List all feedbacks with filters.
     *
     * Supports filtering by search (message/user), type, and status.
     *
     */
    public function index(Request $request)
    {
        try {
            $query = Feedback::with('user:id,name,email');

            // Search filter
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('message', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($uq) use ($search) {
                          $uq->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            // Type filter
            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            // Status filter
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $feedbacks = $query->latest()->paginate(15)->withQueryString();

            // Summary stats
            $summary = [
                'total' => Feedback::count(),
                'new' => Feedback::where('status', Feedback::STATUS_NEW)->count(),
                'reviewed' => Feedback::where('status', Feedback::STATUS_REVIEWED)->count(),
                'planned' => Feedback::where('status', Feedback::STATUS_PLANNED)->count(),
                'done' => Feedback::where('status', Feedback::STATUS_DONE)->count(),
            ];

            return Inertia::render('dashboard/feedback/index', [
                'feedbacks' => $feedbacks,
                'filters' => $request->only(['search', 'type', 'status']),
                'types' => [
                    ['value' => Feedback::TYPE_SUGGESTION, 'label' => 'Suggestion'],
                    ['value' => Feedback::TYPE_UX, 'label' => 'UX Issue'],
                    ['value' => Feedback::TYPE_CONFUSION, 'label' => 'Confusion'],
                ],
                'statuses' => [
                    ['value' => Feedback::STATUS_NEW, 'label' => 'New'],
                    ['value' => Feedback::STATUS_REVIEWED, 'label' => 'Reviewed'],
                    ['value' => Feedback::STATUS_PLANNED, 'label' => 'Planned'],
                    ['value' => Feedback::STATUS_DONE, 'label' => 'Done'],
                ],
                'summary' => $summary,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load feedbacks. Please try again.');
        }
    }

    /**
     * View full feedback with internal notes.
     *
     */
    public function show(Feedback $feedback)
    {
        try {
            $feedback->load('user:id,name,email');

            return Inertia::render('dashboard/feedback/show', [
                'feedback' => $feedback,
                'types' => [
                    ['value' => Feedback::TYPE_SUGGESTION, 'label' => 'Suggestion'],
                    ['value' => Feedback::TYPE_UX, 'label' => 'UX Issue'],
                    ['value' => Feedback::TYPE_CONFUSION, 'label' => 'Confusion'],
                ],
                'statuses' => [
                    ['value' => Feedback::STATUS_NEW, 'label' => 'New'],
                    ['value' => Feedback::STATUS_REVIEWED, 'label' => 'Reviewed'],
                    ['value' => Feedback::STATUS_PLANNED, 'label' => 'Planned'],
                    ['value' => Feedback::STATUS_DONE, 'label' => 'Done'],
                ],
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'feedback_id' => $feedback->id]);
            return back()->with('error', 'Failed to load feedback. Please try again.');
        }
    }

    /**
     * Update feedback status or internal notes.
     *
     * Expects request data: { status?: string, internal_notes?: string }
     *
     */
    public function update(Request $request, Feedback $feedback)
    {
        $validated = $request->validate([
                'status' => ['sometimes', 'required', Rule::in([
                    Feedback::STATUS_NEW,
                    Feedback::STATUS_REVIEWED,
                    Feedback::STATUS_PLANNED,
                    Feedback::STATUS_DONE,
                ])],
                'internal_notes' => ['sometimes', 'nullable', 'string', 'max:5000'],
            ]);
        try {

            $data = [];

            if (isset($validated['status'])) {
                $data['status'] = $validated['status'];
            }

            if (array_key_exists('internal_notes', $validated)) {
                $data['internal_notes'] = $validated['internal_notes'];
            }

            if (!empty($data)) {
                $feedback->update($data);

                AppLogger::business('admin.feedback.updated', [
                    'feedback_id' => $feedback->id,
                    'user_id' => $feedback->user_id,
                    'status' => $feedback->status,
                    'admin_id' => auth('admin')->id(),
                ]);
            }

            return back()->with('success', 'Feedback updated successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'update', 'feedback_id' => $feedback->id]);
            return back()->with('error', 'Failed to update feedback. Please try again.');
        }
    }

    /**
     * Delete spam feedback.
     *
     */
    public function destroy(Feedback $feedback)
    {
        try {
            $feedback->delete();

            AppLogger::business('admin.feedback.deleted', [
                'feedback_id' => $feedback->id,
                'user_id' => $feedback->user_id,
                'admin_id' => auth('admin')->id(),
            ]);

            return back()->with('success', 'Feedback deleted successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'destroy', 'feedback_id' => $feedback->id]);
            return back()->with('error', 'Failed to delete feedback. Please try again.');
        }
    }
}
