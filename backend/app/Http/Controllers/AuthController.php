<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string',
            'agency_name' => 'required|string|max:255', // Required - will be used as subdomain
        ]);

        // Generate tenant slug from agency name (for subdomain)
        $agencyName = $request->agency_name;
        $baseSlug = Str::slug($agencyName);
        $slug = $baseSlug;
        $counter = 1;
        
        // Ensure slug is unique
        while (Tenant::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        // Create tenant automatically (like Shopify/Ayor)
        $tenant = Tenant::create([
            'name' => $agencyName,
            'slug' => $slug,
            'settings' => [
                'currency' => 'DA',
                'language' => 'fr',
            ],
        ]);

        // Derive user name from email (extract part before @) or use agency name
        $userName = explode('@', $request->email)[0];
        $userName = ucfirst($userName); // Capitalize first letter

        // Create user as agency admin for the new tenant
        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => $userName,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'agency_admin',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('tenant'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('tenant'));
    }
}
