<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Trip;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        $query = Reservation::where('tenant_id', $tenantId)
            ->with(['trip', 'user'])
            ->orderBy('created_at', 'desc');

        // Filter by booking type if provided
        if ($request->has('booking_type')) {
            $query->where('booking_type', $request->booking_type);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $reservations = $query->paginate(15);

        return response()->json($reservations);
    }

    public function store(Request $request)
    {
        $request->validate([
            'booking_type' => 'required|in:trip,ticket,hotel',
            'trip_id' => 'nullable|exists:trips,id',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:255',
            'customer_email' => 'nullable|email',
            'booking_data' => 'nullable|array',
            'total_amount' => 'nullable|numeric|min:0',
        ]);

        // Get trip to determine tenant_id
        $trip = null;
        if ($request->trip_id) {
            $trip = Trip::findOrFail($request->trip_id);
        }

        $reservation = Reservation::create([
            'tenant_id' => $trip ? $trip->tenant_id : ($request->user() ? $request->user()->tenant_id : null),
            'user_id' => $request->user() ? $request->user()->id : null,
            'booking_type' => $request->booking_type,
            'trip_id' => $request->trip_id,
            'status' => 'pending',
            'customer_name' => $request->customer_name,
            'customer_phone' => $request->customer_phone,
            'customer_email' => $request->customer_email,
            'booking_data' => $request->booking_data,
            'total_amount' => $request->total_amount ?? 0,
        ]);

        return response()->json($reservation, 201);
    }

    public function show(Request $request, $id)
    {
        $reservation = Reservation::with(['trip', 'user'])->findOrFail($id);
        
        // Check if user can view this reservation
        if ($request->user() && $reservation->tenant_id !== $request->user()->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($reservation);
    }

    public function update(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);

        // Check if user owns this reservation
        if ($reservation->tenant_id !== $request->user()->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'sometimes|required|in:pending,processing,confirmed,cancelled',
            'booking_data' => 'nullable|array',
            'total_amount' => 'nullable|numeric|min:0',
        ]);

        $reservation->update($request->only(['status', 'booking_data', 'total_amount']));

        return response()->json($reservation);
    }

    public function destroy(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);

        // Check if user owns this reservation
        if ($reservation->tenant_id !== $request->user()->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $reservation->delete();

        return response()->json(['message' => 'Reservation deleted successfully']);
    }

    // Get statistics for dashboard
    public function stats(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $totalReservations = Reservation::where('tenant_id', $tenantId)->count();
        $pendingReservations = Reservation::where('tenant_id', $tenantId)->where('status', 'pending')->count();
        $confirmedReservations = Reservation::where('tenant_id', $tenantId)->where('status', 'confirmed')->count();
        $totalRevenue = Reservation::where('tenant_id', $tenantId)->sum('total_amount');

        return response()->json([
            'total_reservations' => $totalReservations,
            'pending_reservations' => $pendingReservations,
            'confirmed_reservations' => $confirmedReservations,
            'total_revenue' => $totalRevenue,
        ]);
    }
}
