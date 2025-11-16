<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AgencySettingsController extends Controller
{
    public function show(Request $request)
    {
        $tenant = $request->user()->tenant;
        $settings = $tenant->settings ?? [];
        $agency = $settings['agency'] ?? [];
        return response()->json($agency);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole('agency_admin', 'admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact_phone1' => ['nullable', 'string', 'max:50'],
            'contact_phone2' => ['nullable', 'string', 'max:50'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'public_language' => ['nullable', Rule::in(['fr','ar','en'])],
            'timezone' => ['nullable', 'string', 'max:100'],
            'currency' => ['nullable', 'string', 'max:10'],
            'maps_url' => ['nullable', 'url'],
            'whatsapp' => ['nullable', 'string', 'max:50'],
            'brand_primary' => ['nullable', 'string', 'max:20'],
            'social' => ['nullable', 'array'],
            'social.facebook' => ['nullable', 'url'],
            'social.instagram' => ['nullable', 'url'],
            'social.linkedin' => ['nullable', 'url'],
            'social.x' => ['nullable', 'url'],
        ]);

        $tenant = $user->tenant;
        $settings = $tenant->settings ?? [];
        $agency = $settings['agency'] ?? [];

        $agency = array_merge($agency, [
            'name' => $validated['name'],
            'contact' => [
                'phone1' => $validated['contact_phone1'] ?? ($agency['contact']['phone1'] ?? null),
                'phone2' => $validated['contact_phone2'] ?? ($agency['contact']['phone2'] ?? null),
                'email' => $validated['contact_email'] ?? ($agency['contact']['email'] ?? null),
                'address' => $validated['address'] ?? ($agency['contact']['address'] ?? null),
                'maps_url' => $validated['maps_url'] ?? ($agency['contact']['maps_url'] ?? null),
                'whatsapp' => $validated['whatsapp'] ?? ($agency['contact']['whatsapp'] ?? null),
                'social' => [
                    'facebook' => $validated['social']['facebook'] ?? ($agency['contact']['social']['facebook'] ?? null),
                    'instagram' => $validated['social']['instagram'] ?? ($agency['contact']['social']['instagram'] ?? null),
                    'linkedin' => $validated['social']['linkedin'] ?? ($agency['contact']['social']['linkedin'] ?? null),
                    'x' => $validated['social']['x'] ?? ($agency['contact']['social']['x'] ?? null),
                ],
            ],
            'public_language' => $validated['public_language'] ?? ($agency['public_language'] ?? null),
            'timezone' => $validated['timezone'] ?? ($agency['timezone'] ?? null),
            'currency' => $validated['currency'] ?? ($agency['currency'] ?? null),
            'brand_primary' => $validated['brand_primary'] ?? ($agency['brand_primary'] ?? null),
        ]);

        $settings['agency'] = $agency;
        $tenant->settings = $settings;
        $tenant->save();

        return response()->json($agency);
    }

    public function uploadLogo(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole('agency_admin', 'admin')) {
            abort(403);
        }

        $request->validate([
            'variant' => ['required', Rule::in(['light','dark'])],
            'file' => ['required', 'image', 'max:4096'],
        ]);

        $tenant = $user->tenant;
        $path = $request->file('file')->store("public/tenants/{$tenant->id}");
        $url = Storage::url($path);

        $settings = $tenant->settings ?? [];
        $agency = $settings['agency'] ?? [];
        if ($request->input('variant') === 'light') {
            $agency['logo_light_url'] = $url;
        } else {
            $agency['logo_dark_url'] = $url;
        }
        $settings['agency'] = $agency;
        $tenant->settings = $settings;
        $tenant->save();

        return response()->json(['url' => $url]);
    }
}


