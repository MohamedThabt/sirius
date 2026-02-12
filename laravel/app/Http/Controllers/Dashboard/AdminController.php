<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Traits\StructuredLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AdminController extends Controller
{
    use StructuredLogger;

    /**
     * Display a paginated list of all administrators.
     *
     * Only accessible by super administrators.
     * Supports filtering by search (name/email) and role.
     *
     * @param Request $request The incoming HTTP request
     * @return Response Inertia response rendering the admins index page
     */
    public function index(Request $request): Response
    {
        try {
            // Only super admins can manage admins
            if (!auth('admin')->user()->isSuperAdmin()) {
                abort(403, 'Only super admins can manage admins.');
            }

            $query = Admin::with('creator:id,name');

            // Search filter
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Role filter
            if ($request->filled('role')) {
                $query->where('role', $request->role);
            }

            $perPage = in_array((int) $request->input('per_page'), [10, 25, 50, 100]) ? (int) $request->input('per_page') : 10;

            $admins = $query->latest()->paginate($perPage)->withQueryString();

            // Summary stats
            $summary = [
                'total' => Admin::count(),
                'super_admins' => Admin::where('role', Admin::ROLE_SUPER_ADMIN)->count(),
                'admins' => Admin::where('role', Admin::ROLE_ADMIN)->count(),
            ];

            return Inertia::render('dashboard/admins/index', [
                'admins' => $admins,
                'filters' => $request->only(['search', 'role', 'per_page']),
                'roles' => [
                    ['value' => Admin::ROLE_ADMIN, 'label' => 'Admin'],
                    ['value' => Admin::ROLE_SUPER_ADMIN, 'label' => 'Super Admin'],
                ],
                'summary' => $summary,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load administrators. Please try again later.');
        }
    }

    /**
     * Show the form for creating a new administrator.
     *
     * Only accessible by super administrators.
     *
     * @return Response Inertia response rendering the admin creation form
     */
    public function create(): Response
    {
        try {
            // Only super admins can create admins
            if (!auth('admin')->user()->isSuperAdmin()) {
                abort(403, 'Only super admins can create admins.');
            }
            
            return Inertia::render('dashboard/admins/create');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'create']);
            return back()->with('error', 'Failed to load admin creation form. Please try again.');
        }
    }

    /**
     * Store a newly created administrator in the database.
     *
     * Expected request data:
     * - name: string (required, max:255)
     * - email: string (required, email, unique in admins table)
     * - password: string (required, min:6)
     * - role: string (required, must be 'admin' or 'super_admin')
     *
     * @param Request $request The incoming HTTP request
     * @return RedirectResponse Redirect back with success or error message
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            // Only super admins can create admins
            if (!auth('admin')->user()->isSuperAdmin()) {
                abort(403, 'Only super admins can create admins.');
            }

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:admins',
                'password' => 'required|string|min:6',
                'role' => ['required', Rule::in([Admin::ROLE_ADMIN, Admin::ROLE_SUPER_ADMIN])],
            ]);

            Admin::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'created_by' => auth('admin')->id(),
            ]);

            return back()->with('success', 'Admin created successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'store']);
            return back()->with('error', 'Failed to create admin. Please try again.');
        }
    }

    /**
     * Show the form for editing an existing administrator.
     *
     * Only accessible by super administrators.
     *
     * @param Admin $admin The admin model instance to edit
     * @return Response Inertia response rendering the admin edit form
     */
    public function edit(Admin $admin): Response
    {
        try {
            // Only super admins can edit admins
            if (!auth('admin')->user()->isSuperAdmin()) {
                abort(403, 'Only super admins can edit admins.');
            }
            
            return Inertia::render('dashboard/admins/edit', compact('admin'));
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'edit', 'admin_id' => $admin->id]);
            return back()->with('error', 'Failed to load admin edit form. Please try again.');
        }
    }

    /**
     * Update an existing administrator in the database.
     *
     * Expected request data:
     * - name: string (required, max:255)
     * - email: string (required, email, unique except current admin)
     * - role: string (required, must be 'admin' or 'super_admin')
     * - password: string (optional, min:6) - only updated if provided
     *
     * @param Request $request The incoming HTTP request
     * @param Admin $admin The admin model instance to update
     * @return RedirectResponse Redirect back with success or error message
     */
    public function update(Request $request, Admin $admin): RedirectResponse
    {
        try {
            // Only super admins can update admins
            if (!auth('admin')->user()->isSuperAdmin()) {
                abort(403, 'Only super admins can update admins.');
            }

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('admins')->ignore($admin->id)],
                'role' => ['required', Rule::in([Admin::ROLE_ADMIN, Admin::ROLE_SUPER_ADMIN])],
                'password' => 'nullable|string|min:6',
            ]);

            // Prevent self-demotion: super admins cannot change their own role
            if ($admin->id === auth('admin')->id() && $request->role !== $admin->role) {
                return back()->with('error', 'You cannot change your own role. Another super admin must change your role.');
            }

            // Prevent demoting the last super admin to avoid system lockout
            if ($admin->isLastSuperAdmin() && $request->role === Admin::ROLE_ADMIN) {
                return back()->with('error', 'Cannot demote the last super administrator. Promote another admin first.');
            }

            $data = [
                'name' => $request->name,
                'email' => $request->email,
                'role' => $request->role,
            ];

            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $admin->update($data);

            return back()->with('success', 'Admin updated successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'update', 'admin_id' => $admin->id]);
            return back()->with('error', 'Failed to update admin. Please try again.');
        }
    }

    /**
     * Delete an administrator from the database.
     *
     * Prevents administrators from deleting themselves.
     * Only accessible by super administrators.
     *
     * @param Admin $admin The admin model instance to delete
     * @return RedirectResponse Redirect back with success or error message
     */
    public function destroy(Admin $admin): RedirectResponse
    {
        try {
            // Only super admins can delete admins
            if (!auth('admin')->user()->isSuperAdmin()) {
                abort(403, 'Only super admins can delete admins.');
            }

            if ($admin->id === auth('admin')->id()) {
                return back()->with('error', 'You cannot delete yourself.');
            }

            // Prevent deleting the last super admin to avoid system lockout
            if ($admin->isLastSuperAdmin()) {
                return back()->with('error', 'Cannot delete the last super administrator. Promote another admin first.');
            }

            $admin->delete();

            return back()->with('success', 'Admin deleted successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'destroy', 'admin_id' => $admin->id]);
            return back()->with('error', 'Failed to delete admin. Please try again.');
        }
    }
}
