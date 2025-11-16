<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Trip;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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
        // Convert empty strings to null for nullable fields
        $data = $request->all();
        if (isset($data['trip_id']) && $data['trip_id'] === '') {
            $data['trip_id'] = null;
        }
        if (isset($data['customer_email']) && $data['customer_email'] === '') {
            $data['customer_email'] = null;
        }
        if (isset($data['total_amount']) && $data['total_amount'] === '') {
            $data['total_amount'] = null;
        }
        $request->merge($data);

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
            'admin_note' => 'nullable|string',
        ]);

        $updateData = $request->only(['booking_data', 'total_amount', 'admin_note']);
        
        // Handle status change with history tracking
        if ($request->has('status') && $request->status !== $reservation->status) {
            $updateData['status'] = $request->status;
            
            // Add to status history
            $history = $reservation->status_history ?? [];
            $history[] = [
                'from' => $reservation->status,
                'to' => $request->status,
                'changed_by' => $request->user()->name ?? 'System',
                'changed_at' => now()->toISOString(),
            ];
            $updateData['status_history'] = $history;
        }

        $reservation->update($updateData);

        return response()->json($reservation->fresh(['trip', 'user']));
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

    // Get unique clients from reservations
    public function clients(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        // Sync clients from reservations to clients table
        $this->syncClientsFromReservations($tenantId);

        // Get clients with their stats
        $clients = Client::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($client) {
                $reservations = Reservation::where('tenant_id', $client->tenant_id)
                    ->where(function ($query) use ($client) {
                        if ($client->customer_email) {
                            $query->where('customer_email', $client->customer_email);
                        }
                        $query->orWhere('customer_phone', $client->customer_phone);
                    })
                    ->get();

                return [
                    'id' => $client->id,
                    'customer_name' => $client->customer_name,
                    'customer_email' => $client->customer_email,
                    'customer_phone' => $client->customer_phone,
                    'total_reservations' => $reservations->count(),
                    'total_spent' => $reservations->sum('total_amount'),
                    'last_booking_date' => $reservations->max('created_at'),
                ];
            });

        return response()->json(['data' => $clients]);
    }

    // Sync clients from reservations to clients table
    private function syncClientsFromReservations($tenantId)
    {
        $uniqueClients = Reservation::where('tenant_id', $tenantId)
            ->select('customer_name', 'customer_email', 'customer_phone')
            ->groupBy('customer_name', 'customer_email', 'customer_phone')
            ->get();

        foreach ($uniqueClients as $reservationClient) {
            Client::firstOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'customer_email' => $reservationClient->customer_email,
                    'customer_phone' => $reservationClient->customer_phone,
                ],
                [
                    'customer_name' => $reservationClient->customer_name,
                ]
            );
        }
    }

    // Get single client with bookings
    public function showClient(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        
        $client = Client::where('tenant_id', $tenantId)->findOrFail($id);
        
        // Get client's bookings
        $bookings = Reservation::where('tenant_id', $tenantId)
            ->where(function ($query) use ($client) {
                if ($client->customer_email) {
                    $query->where('customer_email', $client->customer_email);
                }
                $query->orWhere('customer_phone', $client->customer_phone);
            })
            ->with('trip')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_type' => $booking->booking_type,
                    'trip_title' => $booking->trip ? $booking->trip->title : null,
                    'date' => $booking->created_at->format('Y-m-d'),
                    'total_amount' => $booking->total_amount,
                ];
            });

        // Get first booking date for "Client since"
        $firstBooking = Reservation::where('tenant_id', $tenantId)
            ->where(function ($query) use ($client) {
                if ($client->customer_email) {
                    $query->where('customer_email', $client->customer_email);
                }
                $query->orWhere('customer_phone', $client->customer_phone);
            })
            ->orderBy('created_at', 'asc')
            ->first();

        return response()->json([
            'client' => $client,
            'bookings' => $bookings,
            'client_since' => $firstBooking ? $firstBooking->created_at->format('Y-m-d') : null,
        ]);
    }

    // Update client information
    public function updateClient(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        
        $client = Client::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'customer_phone' => 'nullable|string|max:255',
            'secondary_phone' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email',
            'gender' => 'nullable|in:men,women',
            'nationality' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'profile_image' => 'nullable|image|max:2048',
        ]);

        $data = $request->only([
            'customer_phone',
            'secondary_phone',
            'emergency_phone',
            'customer_email',
            'gender',
            'nationality',
            'address',
        ]);
        
        if ($request->has('date_of_birth')) {
            $data['date_of_birth'] = $request->date_of_birth;
        }

        // Handle profile image upload
        if ($request->hasFile('profile_image')) {
            // Delete old image if exists
            if ($client->profile_image) {
                Storage::disk('public')->delete($client->profile_image);
            }
            
            $path = $request->file('profile_image')->store('clients', 'public');
            $data['profile_image'] = $path;
        }

        $client->update($data);

        return response()->json($client);
    }
}
