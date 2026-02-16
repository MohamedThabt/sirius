<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Mail\AdminUserEmail;
use App\Models\User;
use App\Support\AppLogger;
use App\Traits\StructuredLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class EmailController extends Controller
{
    use StructuredLogger;

    /**
     * Display the email compose page with paginated list of users.
     * 
     * Supports filtering by:
     * - search: Filter by user name or email (optional)
     * 
     * @param Request $request The incoming HTTP request
     * @return Response Inertia response rendering the email compose page
     */
    public function index(Request $request): Response
    {
        try {
            $perPage = $request->input('per_page', 15);
            $search = $request->input('search');

            $query = User::select('id', 'name', 'email')
                ->orderBy('name');

            // Apply search filter if provided
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $users = $query->paginate($perPage)->withQueryString();

            return Inertia::render('dashboard/email/index', [
                'users' => $users,
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                ],
            ]);
        } catch (Throwable $e) {
            AppLogger::error('Failed to load email compose page', $e, [
                'admin_id' => auth('admin')->id(),
            ]);

            return Inertia::render('dashboard/email/index', [
                'users' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $perPage ?? 15,
                    'total' => 0,
                    'from' => 0,
                    'to' => 0,
                ],
                'filters' => [
                    'search' => $search ?? '',
                    'per_page' => $perPage ?? 15,
                ],
            ])->with('error', 'Failed to load users. Please try again.');
        }
    }

    /**
     * Send emails to selected users.
     * 
     * Expected request data:
     * - user_ids: array (required, at least one user ID)
     * - subject: string (required, max:255)
     * - message: string (required, max:10000)
     * 
     * @param Request $request The incoming HTTP request
     * @return \Illuminate\Http\RedirectResponse Redirect back with success or error message
     */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'required|integer|exists:users,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:10000',
        ]);
        
        try {

            $users = User::whereIn('id', $validated['user_ids'])->get();

            if ($users->isEmpty()) {
                return back()->with('error', 'No valid users selected.');
            }

            $sentCount = 0;
            foreach ($users as $user) {
                try {
                    Mail::to($user->email)->queue(
                        new AdminUserEmail(
                            $user,
                            $validated['subject'],
                            $validated['message']
                        )
                    );
                    $sentCount++;
                } catch (Throwable $e) {
                    AppLogger::error('Failed to queue email for user', $e, [
                        'admin_id' => auth('admin')->id(),
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                        'subject' => $validated['subject'],
                    ]);
                }
            }

            if ($sentCount === 0) {
                return back()->with('error', 'Failed to send emails. Please check logs.');
            }

            $recipientText = $sentCount === 1 ? '1 recipient' : "$sentCount recipients";
            
            AppLogger::info('Admin sent emails to users', [
                'admin_id' => auth('admin')->id(),
                'admin_email' => auth('admin')->user()->email,
                'recipient_count' => $sentCount,
                'subject' => $validated['subject'],
                'user_ids' => $validated['user_ids'],
            ]);

            return back()->with('success', "Emails queued successfully for {$recipientText}.");
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput()
                ->with('error', 'Please correct the errors and try again.');
        } catch (Throwable $e) {
            AppLogger::error('Failed to send emails', $e, [
                'admin_id' => auth('admin')->id(),
                'request_data' => $request->all(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'An unexpected error occurred. Please try again.');
        }
    }
}
