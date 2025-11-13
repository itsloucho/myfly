<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    protected $fillable = [
        'tenant_id',
        'user_id',
        'booking_type',
        'trip_id',
        'status',
        'customer_name',
        'customer_phone',
        'customer_email',
        'booking_data',
        'total_amount',
    ];

    protected $casts = [
        'booking_data' => 'array',
        'total_amount' => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }
}
