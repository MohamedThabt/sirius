<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Mail\BetaInvitationMail;
use App\Models\BetaInvitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BetaController extends Controller
{
    /**
     * Show all beta invitations (admin only).
     */
    public function index(Request $request): Response
    {
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

        return Inertia::render('dashboard/beta/index', [
            'invitations' => $invitations,
            'filters' => $request->only(['search', 'status']),
            'statuses' => [
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'approved', 'label' => 'Approved'],
                ['value' => 'denied', 'label' => 'Denied'],
            ],
        ]);
    }

    /**
     * Store a new beta invitation (public endpoint).
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:beta_invitations',
        ]);

        BetaInvitation::create([
            'name' => $request->name,
            'email' => $request->email,
            'status' => BetaInvitation::STATUS_PENDING,
        ]);

        return back()->with('success', 'Thank you! Your beta invitation request has been received. We\'ll be in touch soon.');
    }

    /**
     * Create a new beta invitation manually (admin only).
     */
    public function create(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:beta_invitations',
        ]);

        BetaInvitation::create([
            'name' => $request->name,
            'email' => $request->email,
            'status' => BetaInvitation::STATUS_PENDING,
            'invited_by' => auth('admin')->id(),
        ]);

        return back()->with('success', 'Beta invitation created successfully.');
    }

    /**
     * Approve a beta invitation and create user account.
     */
    public function approve(Request $request, BetaInvitation $betaInvitation): RedirectResponse
    {
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

        try {
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

                // Send welcome email with password
                Mail::send(new BetaInvitationMail($betaInvitation, $password));
            });

            return back()->with('success', 'User account created and welcome email sent successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'An error occurred while creating the account: ' . $e->getMessage());
        }
    }

    /**
     * Deny a beta invitation.
     */
    public function deny(Request $request, BetaInvitation $betaInvitation): RedirectResponse
    {
        $request->validate([
            'note' => 'nullable|string|max:500',
        ]);

        // Check if already processed
        if (!$betaInvitation->isPending()) {
            return back()->with('error', 'This invitation has already been processed.');
        }

        try {
            $betaInvitation->update([
                'status' => BetaInvitation::STATUS_DENIED,
                'invited_by' => auth('admin')->id(),
                'note' => $request->note,
            ]);

            return back()->with('success', 'Invitation denied successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'An error occurred: ' . $e->getMessage());
        }
    }
}
