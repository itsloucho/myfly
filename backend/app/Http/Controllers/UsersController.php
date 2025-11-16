<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UsersController extends Controller
{
    /**
     * List users for current tenant.
     */
    public function index(Request $request)
    {
        $this->requireAdmin($request);

        $tenantId = $request->user()->tenant_id;

        $users = User::where('tenant_id', $tenantId)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone', 'role', 'created_at']);

        return response()->json($users);
    }

    /**
     * Create/invite a user in current tenant.
     */
    public function store(Request $request)
    {
        $actor = $this->requireAdmin($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'role' => ['required', Rule::in(User::allowedRoles())],
            'password' => ['nullable', 'string', 'min:8'], // optional if doing email invite later
        ]);

        // Only Owner can create another Owner
        if ($validated['role'] === 'agency_admin' && !$actor->isOwner()) {
            return response()->json(['message' => 'Only owner can create another owner'], 403);
        }

        $password = $validated['password'] ?? Str::random(12);

        $user = User::create([
            'tenant_id' => $actor->tenant_id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'password' => Hash::make($password),
        ]);

        // TODO: send invite/reset link email instead of returning password (security)

        return response()->json($user, 201);
    }

    /**
     * Update a user in current tenant.
     */
    public function update(Request $request, int $id)
    {
        $actor = $this->requireAdmin($request);
        $user = User::where('tenant_id', $actor->tenant_id)->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'role' => ['sometimes', Rule::in(User::allowedRoles())],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
        ]);

        // Prevent non-owner from modifying an owner
        if ($user->isOwner() && !$actor->isOwner()) {
            return response()->json(['message' => 'Only owner can modify owner'], 403);
        }

        // Prevent demoting the last owner
        if (isset($validated['role']) && $user->isOwner() && $validated['role'] !== 'agency_admin') {
            $ownersCount = User::where('tenant_id', $actor->tenant_id)
                ->where('role', 'agency_admin')
                ->where('id', '!=', $user->id)
                ->count();
            if ($ownersCount === 0) {
                return response()->json(['message' => 'Cannot demote the last owner'], 422);
            }
        }

        if (array_key_exists('name', $validated)) $user->name = $validated['name'];
        if (array_key_exists('email', $validated)) $user->email = $validated['email'];
        if (array_key_exists('phone', $validated)) $user->phone = $validated['phone'];
        if (array_key_exists('role', $validated)) $user->role = $validated['role'];
        if (array_key_exists('password', $validated) && $validated['password']) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json($user);
    }

    /**
     * Delete a user in current tenant.
     */
    public function destroy(Request $request, int $id)
    {
        $actor = $this->requireAdmin($request);
        $user = User::where('tenant_id', $actor->tenant_id)->findOrFail($id);

        if ($user->id === $actor->id) {
            return response()->json(['message' => 'You cannot delete your own account'], 422);
        }

        // Non-owner cannot delete owner
        if ($user->isOwner() && !$actor->isOwner()) {
            return response()->json(['message' => 'Only owner can delete owner accounts'], 403);
        }

        // Cannot delete last owner
        if ($user->isOwner()) {
            $ownersCount = User::where('tenant_id', $actor->tenant_id)
                ->where('role', 'agency_admin')
                ->where('id', '!=', $user->id)
                ->count();
            if ($ownersCount === 0) {
                return response()->json(['message' => 'Cannot delete the last owner'], 422);
            }
        }

        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }

    private function requireAdmin(Request $request): User
    {
        $user = $request->user();
        abort_if(!$user, 401);

        if (!$user->hasRole('agency_admin', 'admin')) {
            abort(403);
        }

        return $user;
    }
}


