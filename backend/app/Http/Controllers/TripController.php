<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

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
        $this->normalizeOptionalFields($request);

        try {
            $rules = [
                'title' => 'required|string|max:255',
                'type' => 'required|in:voyage,ticket,hotel',
                'description' => 'nullable|string',
                'status' => 'nullable|in:draft,published',
            ];

            if ($request->input('type') === 'voyage') {
                $rules = array_merge($rules, [
                    'price' => 'required|numeric|min:0',
                    'min_price' => 'nullable|numeric|min:0|lte:price',
                    'start_date' => 'required|date',
                    'end_date' => 'required|date|after_or_equal:start_date',
                    'duration_days' => 'required|integer|min:1',
                    'duration_nights' => 'required|integer|min:0',
                    'destination' => 'required|string|max:255',
                    'hotel_enabled' => 'required|boolean',
                    'hotel_stars' => 'nullable|required_if:hotel_enabled,1|integer|min:1|max:5',
                    'hotel_name' => 'nullable|required_if:hotel_enabled,1|string|max:255',
                    'airlines' => 'nullable|string|max:255',
                    'bagages_kg' => 'nullable|integer|min:0',
                    'lunch_meal' => 'required|in:included,not_included',
                    'transport' => 'nullable|string|max:255',
                ]);
            }
            
            // Only validate featured_image if it's actually uploaded
            if ($request->hasFile('featured_image')) {
                $rules['featured_image'] = 'image|max:2048';
            }
            
            // Only validate gallery if files are actually uploaded
            if ($request->hasFile('gallery')) {
                $rules['gallery'] = 'array';
                $rules['gallery.*'] = 'image|max:2048';
            }
            
            $request->validate($rules);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        $hotelEnabled = $request->boolean('hotel_enabled');

        $data = [
            'tenant_id' => $request->user()->tenant_id,
            'title' => $request->title,
            'type' => $request->type,
            'slug' => Str::slug($request->title) . '-' . Str::random(6),
            'description' => $request->description,
            'price' => $request->price,
            'min_price' => $request->min_price,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'duration_days' => $request->duration_days,
            'duration_nights' => $request->duration_nights,
            'destination' => $request->destination,
            'hotel_enabled' => $hotelEnabled,
            'hotel_stars' => $hotelEnabled ? $request->hotel_stars : null,
            'hotel_name' => $hotelEnabled ? $request->hotel_name : null,
            'airlines' => $request->airlines,
            'bagages_kg' => $request->bagages_kg,
            'lunch_meal' => $request->lunch_meal ?? 'included',
            'transport' => $request->transport,
            'status' => $request->status ?? 'draft',
        ];

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('trips/featured', 'public');
            $data['featured_image'] = $path;
        }

        // Handle gallery images upload
        // Laravel handles gallery[] as an array of files
        if ($request->hasFile('gallery')) {
            $galleryPaths = [];
            $galleryFiles = $request->file('gallery');
            // Handle both single file and array of files
            if (is_array($galleryFiles)) {
                foreach ($galleryFiles as $image) {
                    if ($image && $image->isValid()) {
                        $path = $image->store('trips/gallery', 'public');
                        $galleryPaths[] = $path;
                    }
                }
            } elseif ($galleryFiles && $galleryFiles->isValid()) {
                $path = $galleryFiles->store('trips/gallery', 'public');
                $galleryPaths[] = $path;
            }
            if (!empty($galleryPaths)) {
                $data['gallery'] = $galleryPaths;
            }
        }

        try {
            $trip = Trip::create($data);
            return response()->json($trip, 201);
        } catch (\Exception $e) {
            Log::error('Error creating trip: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating trip: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $trip = Trip::with('reservations')->findOrFail($id);
        
        return response()->json($trip);
    }

    public function update(Request $request, $id)
    {
        $trip = Trip::findOrFail($id);

        $this->normalizeOptionalFields($request);

        // Check if user owns this trip
        if ($trip->tenant_id !== $request->user()->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rules = [
            'title' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|in:voyage,ticket,hotel',
            'description' => 'nullable|string',
            'featured_image' => 'nullable|image|max:2048',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|max:2048',
            'status' => 'nullable|in:draft,published',
        ];

        if ($request->input('type', $trip->type) === 'voyage') {
            $rules = array_merge($rules, [
                'price' => 'sometimes|required|numeric|min:0',
                'min_price' => 'nullable|numeric|min:0|lte:price',
                'start_date' => 'sometimes|required|date',
                'end_date' => 'sometimes|required|date|after_or_equal:start_date',
                'duration_days' => 'sometimes|required|integer|min:1',
                'duration_nights' => 'sometimes|required|integer|min:0',
                'destination' => 'sometimes|required|string|max:255',
                'hotel_enabled' => 'nullable|boolean',
                'hotel_stars' => 'nullable|required_if:hotel_enabled,1|integer|min:1|max:5',
                'hotel_name' => 'nullable|required_if:hotel_enabled,1|string|max:255',
                'airlines' => 'nullable|string|max:255',
                'bagages_kg' => 'nullable|integer|min:0',
                'lunch_meal' => 'nullable|in:included,not_included',
                'transport' => 'nullable|string|max:255',
            ]);
        }

        $request->validate($rules);

        $data = $request->only([
            'title',
            'type',
            'description',
            'status',
            'price',
            'min_price',
            'start_date',
            'end_date',
            'duration_days',
            'duration_nights',
            'destination',
            'hotel_stars',
            'hotel_name',
            'airlines',
            'bagages_kg',
            'lunch_meal',
            'transport',
        ]);

        if ($request->has('hotel_enabled')) {
            $data['hotel_enabled'] = $request->boolean('hotel_enabled');
        }

        if (($data['hotel_enabled'] ?? $trip->hotel_enabled) === false) {
            $data['hotel_stars'] = null;
            $data['hotel_name'] = null;
        }

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
        
        $query = Trip::where('tenant_id', $tenant->id)
            ->where('status', 'published');
        
        // Filter by type if provided
        if ($request->has('type') && in_array($request->type, ['voyage', 'ticket', 'hotel'])) {
            $query->where('type', $request->type);
        }
        
        $trips = $query->orderBy('created_at', 'desc')
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

    private function normalizeOptionalFields(Request $request): void
    {
        $numericFields = [
            'price',
            'min_price',
            'duration_days',
            'duration_nights',
            'hotel_stars',
            'bagages_kg',
        ];

        foreach ($numericFields as $field) {
            if ($request->has($field) && $request->input($field) === '') {
                $request->merge([$field => null]);
            }
        }
    }
}
