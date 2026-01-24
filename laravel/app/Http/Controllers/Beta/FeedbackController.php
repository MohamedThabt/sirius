<?php

namespace App\Http\Controllers\Beta;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Services\Notification\TelegramNotificationService;
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
     * List feedback submitted by the logged-in user.
     *
     * @param Request $request The incoming HTTP request
     * @return Response Inertia response rendering the user's feedback list
     */
    public function index(Request $request): Response
    {
        try {
            $feedbacks = auth()->user()
                ->feedbacks()
                ->select(['id', 'type', 'message', 'status', 'page_url', 'created_at'])
                ->latest()
                ->paginate(10)
                ->withQueryString();

            return Inertia::render('beta/feedback/index', [
                'feedbacks' => $feedbacks,
                'types' => [
                    ['value' => Feedback::TYPE_SUGGESTION, 'label' => 'Suggestion'],
                    ['value' => Feedback::TYPE_UX, 'label' => 'UX Issue'],
                    ['value' => Feedback::TYPE_CONFUSION, 'label' => 'Confusion'],
                ],
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load feedback. Please try again.');
        }
    }

    /**
     * Submit new feedback.
     *
     * Expects request data: { type: string, message: string, page_url?: string }
     *
     * @param Request $request The incoming HTTP request
     * @return RedirectResponse Redirect with success or error message
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
                'type' => ['required', Rule::in([
                    Feedback::TYPE_SUGGESTION,
                    Feedback::TYPE_UX,
                    Feedback::TYPE_CONFUSION,
                ])],
                'message' => ['required', 'string', 'max:5000'],
                'page_url' => ['nullable', 'string', 'max:500'],
            ]);
        try {
            $feedback = auth()->user()->feedbacks()->create([
                'type' => $validated['type'],
                'message' => trim($validated['message']),
                'page_url' => $validated['page_url'] ?? $request->header('referer', '/'),
                'status' => Feedback::STATUS_NEW,
            ]);

            // Send Telegram notification
            try {
                app(TelegramNotificationService::class)->notifyNewFeedback($feedback, auth()->user());
            } catch (Throwable $e) {
                // Log but don't fail the request if notification fails
                $this->logException($e, ['action' => 'telegram_notification', 'feedback_id' => $feedback->id]);
            }

            return back()->with('success', 'Thank you for your feedback!');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'store']);
            return back()->with('error', 'Failed to submit feedback. Please try again.');
        }
    }

    /**
     * View a single feedback item.
     *
     * Users can only view their own feedback.
     *
     * @param Feedback $feedback The feedback model instance
     * @return Response Inertia response rendering the feedback details
     */
    public function show(Feedback $feedback): Response|RedirectResponse
    {
        // Authorization: users can only view their own feedback
        if ($feedback->user_id !== auth()->id()) {
            return back()->with('error', 'You are not authorized to view this feedback.');
        }

        try {
            // Load only user-visible fields (no internal_notes)
            $feedbackData = $feedback->only([
                'id', 'type', 'message', 'status', 'page_url', 'created_at'
            ]);

            return Inertia::render('beta/feedback/show', [
                'feedback' => $feedbackData,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'feedback_id' => $feedback->id]);
            return back()->with('error', 'Failed to load feedback. Please try again.');
        }
    }
}
