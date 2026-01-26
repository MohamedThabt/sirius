<?php

namespace App\Http\Controllers\Beta;

use App\Http\Controllers\Controller;
use App\Models\BetaInvitation;
use App\Services\Notification\TelegramNotificationService;
use App\Traits\StructuredLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class BetaSignupController extends Controller
{
    use StructuredLogger;

    /**
     * Display the public beta signup page.
     *
     * @return Response
     */
    public function index(): Response
    {
        return Inertia::render('beta-signup', [
            'message' => session('success'),
        ]);
    }

    /**
     * Store a new beta invitation request from the public.
     *
     * Expected request data:
     * - name: string (required, max:255)
     * - email: string (required, email, unique in beta_invitations table)
     *
     * @param Request $request The incoming HTTP request
     * @return RedirectResponse Redirect back with success or error message
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email:rfc,dns', 'max:255', 'unique:beta_invitations'],
        ], [
            'email.unique' => 'You have already joined the waitlist!',
        ]);

        try {
            $betaInvitation = BetaInvitation::create([
                'name' => $request->name,
                'email' => $request->email,
                'status' => BetaInvitation::STATUS_PENDING,
            ]);

            // Send Telegram notification
            app(TelegramNotificationService::class)->notifyNewBetaRequest($betaInvitation);

            return back()->with('success', 'Thank you! Your beta invitation request has been received. We\'ll be in touch soon.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'store']);
            return back()->with('error', 'Failed to submit your beta invitation request. Please try again.');
        }
    }
}
