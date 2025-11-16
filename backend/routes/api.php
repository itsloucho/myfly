<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\AgencySettingsController;

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
    Route::get('/clients', [ReservationController::class, 'clients']);
    Route::get('/clients/{id}', [ReservationController::class, 'showClient']);
    Route::put('/clients/{id}', [ReservationController::class, 'updateClient']);
    Route::apiResource('reservations', ReservationController::class);

    // Users management (owner/admin)
    Route::middleware('role:agency_admin,admin')->group(function () {
        Route::get('/users', [UsersController::class, 'index']);
        Route::post('/users', [UsersController::class, 'store']);
        Route::patch('/users/{id}', [UsersController::class, 'update']);
        Route::delete('/users/{id}', [UsersController::class, 'destroy']);

        // Agency settings
        Route::get('/agency-settings', [AgencySettingsController::class, 'show']);
        Route::post('/agency-settings', [AgencySettingsController::class, 'update']);
        Route::post('/agency-logo', [AgencySettingsController::class, 'uploadLogo']);
    });
});

