<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = [
        'tenant_id',
        'customer_name',
        'customer_phone',
        'secondary_phone',
        'emergency_phone',
        'customer_email',
        'gender',
        'nationality',
        'date_of_birth',
        'address',
        'profile_image',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // Note: Reservations relationship is handled via queries in controller
    // since we match by email OR phone
}

