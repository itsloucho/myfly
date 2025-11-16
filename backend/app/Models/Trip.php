<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trip extends Model
{
    protected $fillable = [
        'tenant_id',
        'title',
        'slug',
        'type',
        'description',
        'price',
        'min_price',
        'start_date',
        'end_date',
        'duration_days',
        'duration_nights',
        'destination',
        'hotel_enabled',
        'hotel_stars',
        'hotel_name',
        'airlines',
        'bagages_kg',
        'lunch_meal',
        'transport',
        'featured_image',
        'gallery',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'min_price' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'duration_days' => 'integer',
        'duration_nights' => 'integer',
        'hotel_enabled' => 'boolean',
        'hotel_stars' => 'integer',
        'bagages_kg' => 'integer',
        'gallery' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }
}
