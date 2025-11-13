<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Trip;
use App\Models\Reservation;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a demo tenant
        $tenant = Tenant::create([
            'name' => 'Demo Travel Agency',
            'slug' => 'demo',
            'settings' => [
                'currency' => 'DA',
                'language' => 'fr',
            ],
        ]);

        // Create agency admin user
        $admin = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Admin User',
            'email' => 'admin@demo.com',
            'phone' => '+213555123456',
            'password' => Hash::make('password'),
            'role' => 'agency_admin',
        ]);

        // Note: End customers don't need authentication - they book directly on public trip pages

        // Create sample trips
        $trip1 = Trip::create([
            'tenant_id' => $tenant->id,
            'title' => 'Voyage à Paris - 7 Jours',
            'slug' => 'voyage-a-paris-7-jours',
            'description' => 'Découvrez la ville lumière avec notre package tout compris. Visitez la Tour Eiffel, le Louvre, et bien plus encore!',
            'status' => 'published',
        ]);

        $trip2 = Trip::create([
            'tenant_id' => $tenant->id,
            'title' => 'Omra 2025 - Package Premium',
            'slug' => 'omra-2025-package-premium',
            'description' => 'Package Omra tout compris avec hébergement 5 étoiles à proximité du Haram.',
            'status' => 'published',
        ]);

        $trip3 = Trip::create([
            'tenant_id' => $tenant->id,
            'title' => 'Istanbul - Weekend Découverte',
            'slug' => 'istanbul-weekend-decouverte',
            'description' => 'Un weekend magique à Istanbul. Découvrez la richesse culturelle et historique de cette ville unique.',
            'status' => 'published',
        ]);

        // Create sample reservations (end customers book without authentication, so user_id is null)
        Reservation::create([
            'tenant_id' => $tenant->id,
            'user_id' => null, // End customers don't have accounts
            'booking_type' => 'trip',
            'trip_id' => $trip1->id,
            'status' => 'confirmed',
            'customer_name' => 'Mohamed Abdelwahab',
            'customer_phone' => '+213555111222',
            'customer_email' => 'mohamed@example.com',
            'booking_data' => [
                'adults' => 2,
                'children' => 1,
                'start_date' => '2025-06-16',
                'end_date' => '2025-06-23',
            ],
            'total_amount' => 25000.00,
        ]);

        Reservation::create([
            'tenant_id' => $tenant->id,
            'user_id' => null, // End customers don't have accounts
            'booking_type' => 'trip',
            'trip_id' => $trip2->id,
            'status' => 'processing',
            'customer_name' => 'Fatima Zohra',
            'customer_phone' => '+213555333444',
            'customer_email' => 'fatima@example.com',
            'booking_data' => [
                'adults' => 2,
                'start_date' => '2025-04-10',
                'end_date' => '2025-04-20',
            ],
            'total_amount' => 35000.00,
        ]);

        Reservation::create([
            'tenant_id' => $tenant->id,
            'user_id' => null,
            'booking_type' => 'trip',
            'trip_id' => $trip3->id,
            'status' => 'pending',
            'customer_name' => 'Ahmed Benali',
            'customer_phone' => '+213555555666',
            'customer_email' => 'ahmed@example.com',
            'booking_data' => [
                'adults' => 1,
                'start_date' => '2025-03-15',
                'end_date' => '2025-03-17',
            ],
            'total_amount' => 12000.00,
        ]);

        $this->command->info('Demo data seeded successfully!');
        $this->command->info('Tenant: ' . $tenant->slug . ' (ID: ' . $tenant->id . ')');
        $this->command->info('Admin: admin@demo.com / password');
        $this->command->info('Note: End customers book directly without authentication');
    }
}

