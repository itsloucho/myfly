<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->decimal('price', 12, 2)->nullable()->after('description');
            $table->decimal('min_price', 12, 2)->nullable()->after('price');
            $table->date('start_date')->nullable()->after('min_price');
            $table->date('end_date')->nullable()->after('start_date');
            $table->unsignedSmallInteger('duration_days')->nullable()->after('end_date');
            $table->unsignedSmallInteger('duration_nights')->nullable()->after('duration_days');
            $table->string('destination')->nullable()->after('duration_nights');
            $table->boolean('hotel_enabled')->default(false)->after('destination');
            $table->unsignedTinyInteger('hotel_stars')->nullable()->after('hotel_enabled');
            $table->string('hotel_name')->nullable()->after('hotel_stars');
            $table->string('airlines')->nullable()->after('hotel_name');
            $table->unsignedSmallInteger('bagages_kg')->nullable()->after('airlines');
            $table->enum('lunch_meal', ['included', 'not_included'])->default('included')->after('bagages_kg');
            $table->string('transport')->nullable()->after('lunch_meal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn([
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
            ]);
        });
    }
};

