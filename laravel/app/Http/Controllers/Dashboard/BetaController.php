<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Mail\BetaInvitationMail;
use App\Models\BetaInvitation;
use App\Models\User;
use App\Services\Notification\TelegramNotificationService;
use App\Traits\StructuredLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class BetaController extends Controller
{
    use StructuredLogger;

    /**
     * Display a paginated list of beta invitations with optional filtering.
     *
     * Supports filtering by:
     * - search: Filter by name or email (optional)
     * - status: Filter by invitation status (pending/approved/denied) (optional)
     *
     * @param Request $request The incoming HTTP request
     * @return Response Inertia response rendering the beta invitations index page
     */
    public function index(Request $request): Response
    {
        try {
            $query = BetaInvitation::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $invitations = $query->with('invitedBy:id,name')
                ->latest()
                ->paginate(15)
                ->withQueryString();

            // Summary stats
            $summary = [
                'total' => BetaInvitation::count(),
                'pending' => BetaInvitation::where('status', BetaInvitation::STATUS_PENDING)->count(),
                'approved' => BetaInvitation::where('status', BetaInvitation::STATUS_APPROVED)->count(),
                'denied' => BetaInvitation::where('status', BetaInvitation::STATUS_DENIED)->count(),
                'this_week' => BetaInvitation::where('created_at', '>=', now()->startOfWeek())->count(),
                'this_month' => BetaInvitation::where('created_at', '>=', now()->startOfMonth())->count(),
            ];

            return Inertia::render('dashboard/beta/index', [
                'invitations' => $invitations,
                'filters' => $request->only(['search', 'status']),
                'statuses' => [
                    ['value' => 'pending', 'label' => 'Pending'],
                    ['value' => 'approved', 'label' => 'Approved'],
                    ['value' => 'denied', 'label' => 'Denied'],
                ],
                'summary' => $summary,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load beta invitations. Please try again.');
        }
    }




    /**
     * Create a new beta invitation manually by an administrator.
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
                'email' => 'required|string|email|max:255|unique:beta_invitations',
            ], [
                'email.unique' => 'You have already joined the waitlist!',
            ]);
        try {
            BetaInvitation::create([
                'name' => $request->name,
                'email' => $request->email,
                'status' => BetaInvitation::STATUS_PENDING,
                'invited_by' => auth('admin')->id(),
            ]);

            return back()->with('success', 'Beta invitation created successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'store']);
            return back()->with('error', 'Failed to create beta invitation. Please try again.');
        }
    }

    /**
     * Approve a beta invitation and create a user account.
     *
     * Creates a new user account with a randomly generated password,
     * updates the invitation status to approved, and sends a welcome
     * email with login credentials.
     *
     * @param Request $request The incoming HTTP request
     * @param BetaInvitation $betaInvitation The beta invitation to approve
     * @return RedirectResponse Redirect back with success or error message
     */
    public function approve(Request $request, BetaInvitation $betaInvitation): RedirectResponse
    {
        try {
            // Check if already approved
            if ($betaInvitation->isApproved()) {
                return back()->with('error', 'This invitation has already been approved.');
            }

            // Check if user already exists
            if (User::where('email', $betaInvitation->email)->exists()) {
                return back()->with('error', 'A user with this email already exists.');
            }

            // Generate random password
            $password = Str::random(12);

            // Start database transaction
            DB::transaction(function () use ($betaInvitation, $password) {
                // Create user account
                $user = User::create([
                    'name' => $betaInvitation->name,
                    'email' => $betaInvitation->email,
                    'password' => Hash::make($password),
                    'email_verified_at' => now(),
                ]);

                // Update invitation status
                $betaInvitation->update([
                    'status' => BetaInvitation::STATUS_APPROVED,
                    'invited_by' => auth('admin')->id(),
                    'approved_at' => now(),
                ]);
            });

            // Send welcome email with password (outside transaction for proper queue handling)
            // #region agent log
            $logFile = base_path('.cursor/debug.log');
            $logData = json_encode([
                'sessionId' => 'debug-session',
                'runId' => 'run1',
                'hypothesisId' => 'A',
                'location' => 'BetaController.php:193',
                'message' => 'Before Mail::send - checking config',
                'data' => [
                    'queue_connection' => config('queue.default'),
                    'mail_mailer' => config('mail.default'),
                    'mail_host' => config('mail.mailers.smtp.host'),
                    'mail_port' => config('mail.mailers.smtp.port'),
                    'has_mail_username' => !empty(config('mail.mailers.smtp.username')),
                    'invitation_id' => $betaInvitation->id,
                    'email' => $betaInvitation->email,
                ],
                'timestamp' => (int) (microtime(true) * 1000),
            ]) . "\n";
            file_put_contents($logFile, $logData, FILE_APPEND);
            // #endregion
            Mail::send(new BetaInvitationMail($betaInvitation, $password));
            // #region agent log
            $logData2 = json_encode([
                'sessionId' => 'debug-session',
                'runId' => 'run1',
                'hypothesisId' => 'A',
                'location' => 'BetaController.php:194',
                'message' => 'After Mail::send - mail dispatched',
                'data' => [
                    'invitation_id' => $betaInvitation->id,
                    'email' => $betaInvitation->email,
                ],
                'timestamp' => (int) (microtime(true) * 1000),
            ]) . "\n";
            file_put_contents($logFile, $logData2, FILE_APPEND);
            // #endregion

            return back()->with('success', 'User account created and welcome email sent successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'approve', 'invitation_id' => $betaInvitation->id]);
            return back()->with('error', 'Failed to approve invitation and create user account. Please try again.');
        }
    }

    /**
     * Deny a beta invitation with an optional note.
     *
     * Expected request data:
     * - note: string (optional, max:500) - Reason for denial
     *
     * @param Request $request The incoming HTTP request
     * @param BetaInvitation $betaInvitation The beta invitation to deny
     * @return RedirectResponse Redirect back with success or error message
     */
    public function deny(Request $request, BetaInvitation $betaInvitation): RedirectResponse
    {
        try {
            $request->validate([
                'note' => 'nullable|string|max:500',
            ]);

            // Check if already processed
            if (!$betaInvitation->isPending()) {
                return back()->with('error', 'This invitation has already been processed.');
            }

            $betaInvitation->update([
                'status' => BetaInvitation::STATUS_DENIED,
                'invited_by' => auth('admin')->id(),
                'note' => $request->note,
            ]);

            return back()->with('success', 'Invitation denied successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'deny', 'invitation_id' => $betaInvitation->id]);
            return back()->with('error', 'Failed to deny invitation. Please try again.');
        }
    }
}
