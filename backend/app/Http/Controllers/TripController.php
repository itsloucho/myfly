<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        $trips = Trip::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($trips);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'featured_image' => 'nullable|image|max:2048',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|max:2048',
            'status' => 'nullable|in:draft,published',
        ]);

        $data = [
            'tenant_id' => $request->user()->tenant_id,
            'title' => $request->title,
            'slug' => Str::slug($request->title) . '-' . Str::random(6),
            'description' => $request->description,
            'status' => $request->status ?? 'draft',
        ];

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('trips/featured', 'public');
            $data['featured_image'] = $path;
        }

        // Handle gallery images upload
        if ($request->hasFile('gallery')) {
            $galleryPaths = [];
            foreach ($request->file('gallery') as $image) {
                $path = $image->store('trips/gallery', 'public');
                $galleryPaths[] = $path;
            }
            $data['gallery'] = $galleryPaths;
        }

        $trip = Trip::create($data);

        return response()->json($trip, 201);
    }

    public function show($id)
    {
        $trip = Trip::with('reservations')->findOrFail($id);
        
        return response()->json($trip);
    }

    public function update(Request $request, $id)
    {
        $trip = Trip::findOrFail($id);

        // Check if user owns this trip
        if ($trip->tenant_id !== $request->user()->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'featured_image' => 'nullable|image|max:2048',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|max:2048',
            'status' => 'nullable|in:draft,published',
        ]);

        $data = $request->only(['title', 'description', 'status']);

        // Update slug if title changed
        if ($request->has('title') && $request->title !== $trip->title) {
            $data['slug'] = Str::slug($request->title) . '-' . Str::random(6);
        }

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            // Delete old image if exists
            if ($trip->featured_image) {
                Storage::disk('public')->delete($trip->featured_image);
            }
            $path = $request->file('featured_image')->store('trips/featured', 'public');
            $data['featured_image'] = $path;
        }

        // Handle gallery images upload
        if ($request->hasFile('gallery')) {
            $galleryPaths = $trip->gallery ?? [];
            foreach ($request->file('gallery') as $image) {
                $path = $image->store('trips/gallery', 'public');
                $galleryPaths[] = $path;
            }
            $data['gallery'] = $galleryPaths;
        }

        $trip->update($data);

        return response()->json($trip);
    }

    public function destroy(Request $request, $id)
    {
        $trip = Trip::findOrFail($id);

        // Check if user owns this trip
        if ($trip->tenant_id !== $request->user()->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete associated images
        if ($trip->featured_image) {
            Storage::disk('public')->delete($trip->featured_image);
        }
        
        if ($trip->gallery) {
            foreach ($trip->gallery as $imagePath) {
                Storage::disk('public')->delete($imagePath);
            }
        }

        $trip->delete();

        return response()->json(['message' => 'Trip deleted successfully']);
    }

    // Public method to get published trips for a tenant
    public function publicIndex(Request $request, $tenantSlug)
    {
        $tenant = \App\Models\Tenant::where('slug', $tenantSlug)->firstOrFail();
        
        $trips = Trip::where('tenant_id', $tenant->id)
            ->where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json($trips);
    }

    // Public method to get a single published trip
    public function publicShow($tenantSlug, $tripSlug)
    {
        $tenant = \App\Models\Tenant::where('slug', $tenantSlug)->firstOrFail();
        
        $trip = Trip::where('tenant_id', $tenant->id)
            ->where('slug', $tripSlug)
            ->where('status', 'published')
            ->firstOrFail();

        return response()->json($trip);
    }
}
