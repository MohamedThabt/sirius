<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(): Response
    {
        // Only super admins can manage admins
        if (!auth('admin')->user()->isSuperAdmin()) {
            abort(403, 'Only super admins can manage admins.');
        }
        
        $admins = Admin::with('creator:id,name')
            ->latest()
            ->paginate(10);

        return Inertia::render('dashboard/admins/index', compact('admins'));
    }

    public function create(): Response
    {
        // Only super admins can create admins
        if (!auth('admin')->user()->isSuperAdmin()) {
            abort(403, 'Only super admins can create admins.');
        }
        
        return Inertia::render('dashboard/admins/create');
    }

    public function store(Request $request): RedirectResponse
    {
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

        return redirect()->route('admin.admins.index')
            ->with('success', 'Admin created successfully.');
    }

    public function edit(Admin $admin): Response
    {
        // Only super admins can edit admins
        if (!auth('admin')->user()->isSuperAdmin()) {
            abort(403, 'Only super admins can edit admins.');
        }
        
        return Inertia::render('dashboard/admins/edit', compact('admin'));
    }

    public function update(Request $request, Admin $admin): RedirectResponse
    {
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

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $admin->update($data);

        return redirect()->route('admin.admins.index')
            ->with('success', 'Admin updated successfully.');
    }

    public function destroy(Admin $admin): RedirectResponse
    {
        // Only super admins can delete admins
        if (!auth('admin')->user()->isSuperAdmin()) {
            abort(403, 'Only super admins can delete admins.');
        }

        if ($admin->id === auth('admin')->id()) {
            return back()->with('error', 'You cannot delete yourself.');
        }

        $admin->delete();

        return redirect()->route('admin.admins.index')
            ->with('success', 'Admin deleted successfully.');
    }
}
