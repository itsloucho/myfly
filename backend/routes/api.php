<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\ReservationController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public trip routes (for end users browsing)
Route::get('/public/{tenantSlug}/trips', [TripController::class, 'publicIndex']);
Route::get('/public/{tenantSlug}/trips/{tripSlug}', [TripController::class, 'publicShow']);

// Public reservation creation (booking from public trip page)
Route::post('/public/reservations', [ReservationController::class, 'store']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Trip management (for agency admins)
    Route::apiResource('trips', TripController::class);

    // Reservation management (for agency admins)
    Route::get('/reservations/stats', [ReservationController::class, 'stats']);
    Route::apiResource('reservations', ReservationController::class);
});

