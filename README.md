# MyFly - Multi-tenant Travel Booking & Management SaaS

A modern, multi-tenant travel booking and management system built with Laravel and Next.js.

## Features

- 🏢 **Multi-tenancy**: Single database with tenant isolation via `tenant_id`
- 🌐 **Subdomain-based routing**: Each agency gets its own subdomain
- ✈️ **Trip Management**: WordPress-like post management for travel packages
- 📅 **Reservations System**: Manage bookings with multiple statuses
- 🎨 **Modern UI**: Built with Next.js, Tailwind CSS, and shadcn/ui
- 🔒 **Authentication**: Secure API authentication with Laravel Sanctum
- 📱 **Responsive Design**: Works seamlessly on all devices

## Tech Stack

### Backend
- Laravel 12
- Laravel Sanctum (API authentication)
- SQLite (development) / MySQL (production)
- PHP 8.2+

### Frontend
- Next.js 16 (App Router)
- React 18+
- Tailwind CSS v4
- TypeScript
- Axios
- Zustand (state management)
- Phosphor Icons (filled)
- Onest font from Google Fonts

## Project Structure

```
MyFly/
├── backend/          # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── TripController.php
│   │   │   │   └── ReservationController.php
│   │   │   └── Middleware/
│   │   │       └── TenantMiddleware.php
│   │   └── Models/
│   │       ├── Tenant.php
│   │       ├── User.php
│   │       ├── Trip.php
│   │       └── Reservation.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │       └── DemoDataSeeder.php
│   └── routes/
│       └── api.php
│
└── frontend/         # Next.js Application
    ├── app/
    │   ├── (auth)/
    │   │   └── login/
    │   └── (dashboard)/
    │       ├── layout.tsx
    │       ├── accueil/
    │       ├── reservations/
    │       └── voyages/
    ├── components/
    │   ├── dashboard/
    │   │   ├── Sidebar.tsx
    │   │   └── Header.tsx
    │   └── ui/
    └── lib/
        ├── api.ts
        ├── store.ts
        └── utils.ts
```

## Installation

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- SQLite (for development) or MySQL

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
composer install
```

3. **Configure environment**
```bash
# Copy .env.example to .env
cp .env.example .env

# Generate application key
php artisan key:generate
```

4. **Configure database** (`.env` file)
```env
DB_CONNECTION=sqlite
# For SQLite, create the database file:
# touch database/database.sqlite

# Or use MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=myfly
# DB_USERNAME=root
# DB_PASSWORD=
```

5. **Configure CORS** (`.env` file)
```env
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost
```

6. **Run migrations**
```bash
php artisan migrate
```

7. **Seed demo data** (optional)
```bash
php artisan db:seed --class=DemoDataSeeder
```

This creates:
- Tenant: `demo` (slug)
- Admin: `admin@demo.com` / `password`
- Customer: `customer@demo.com` / `password`
- 3 sample trips
- 3 sample reservations

8. **Create storage link**
```bash
php artisan storage:link
```

9. **Start the server**
```bash
php artisan serve
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
# Create .env.local file with:
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage
```

4. **Start development server**
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Configuration

### Subdomain Setup (Local Development)

To test multi-tenancy with subdomains locally:

1. **Edit your hosts file**:
   - Windows: `C:\Windows\System32\drivers\etc\hosts`
   - Mac/Linux: `/etc/hosts`

2. **Add entries**:
```
127.0.0.1 demo.localhost
127.0.0.1 agency1.localhost
127.0.0.1 agency2.localhost
```

3. **Access via subdomain**:
   - Demo tenant: `http://demo.localhost:3000`
   - Backend API: `http://localhost:8000/api`

### Theme Configuration

The theme color `#8A77ED` (purple) is configured in `frontend/app/globals.css`. You can customize colors, fonts, and other theme settings there.

## Usage

### Dashboard Access

1. Visit `http://localhost:3000` (redirects to login)
2. Login with demo credentials:
   - Email: `admin@demo.com`
   - Password: `password`

### Menu Items (MVP)

**Active Features:**
- ✅ Accueil (Dashboard) - View statistics
- ✅ Réservations - Manage all reservations
- ✅ Voyages - Create and manage trips

**Coming Soon:**
- 🔜 Clients
- 🔜 Billets (Tickets)
- 🔜 Hôtels
- 🔜 Finances
- 🔜 Documents
- 🔜 Notes
- 🔜 Analytics
- 🔜 Témoignages (Testimonials)
- 🔜 Settings

### Creating a New Trip

1. Navigate to **Voyages** from the sidebar
2. Click **Add New Trip**
3. Fill in:
   - Title (required)
   - Description
   - Featured Image
   - Gallery Images (multiple)
   - Status (Draft/Published)
4. Click **Create Trip**

### Managing Reservations

1. Navigate to **Réservations** from the sidebar
2. View all bookings with filters:
   - Booking Type (Trip/Ticket/Hotel)
   - Status (Pending/Processing/Confirmed/Cancelled)
3. Actions:
   - View details
   - Edit status
   - Delete reservation

## API Endpoints

### Authentication
```
POST   /api/register          - Register new user
POST   /api/login             - Login user
POST   /api/logout            - Logout user (auth)
GET    /api/me                - Get current user (auth)
```

### Trips
```
GET    /api/trips             - List all trips (auth)
POST   /api/trips             - Create trip (auth)
GET    /api/trips/{id}        - Get trip details (auth)
PUT    /api/trips/{id}        - Update trip (auth)
DELETE /api/trips/{id}        - Delete trip (auth)

# Public endpoints
GET    /api/public/{tenant}/trips           - List published trips
GET    /api/public/{tenant}/trips/{slug}    - Get trip details
```

### Reservations
```
GET    /api/reservations             - List reservations (auth)
POST   /api/reservations             - Create reservation
GET    /api/reservations/{id}        - Get reservation details (auth)
PUT    /api/reservations/{id}        - Update reservation (auth)
DELETE /api/reservations/{id}        - Delete reservation (auth)
GET    /api/reservations/stats       - Get statistics (auth)
```

## Database Schema

### Tables

**tenants**
- id, name, slug, settings, timestamps

**users**
- id, tenant_id, name, email, phone, password, role, timestamps

**trips**
- id, tenant_id, title, slug, description, featured_image, gallery, status, timestamps

**reservations**
- id, tenant_id, user_id, booking_type, trip_id, status, customer_name, customer_phone, customer_email, booking_data, total_amount, timestamps

## Development

### Running Tests
```bash
# Backend
cd backend
php artisan test

# Frontend
cd frontend
npm run test
```

### Building for Production

**Backend:**
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Frontend:**
```bash
npm run build
npm start
```

## Deployment

### Backend (Render.com)

1. Create a new Web Service
2. Connect your repository
3. Configure:
   - Build Command: `composer install`
   - Start Command: `php artisan serve --host=0.0.0.0 --port=$PORT`
4. Add environment variables from `.env`
5. Set up MySQL database (or use Render's PostgreSQL)
6. Configure custom domains for subdomains

### Frontend (Vercel)

1. Import your repository
2. Framework: Next.js
3. Root Directory: `frontend`
4. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.render.com/api
   NEXT_PUBLIC_STORAGE_URL=https://your-api.render.com/storage
   ```

### File Storage (R2)

For production, configure Cloudflare R2 or S3:

1. Install Laravel Filesystem driver for S3
2. Configure in `.env`:
```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_DEFAULT_REGION=auto
AWS_BUCKET=your-bucket
AWS_ENDPOINT=your-r2-endpoint
```

## Troubleshooting

### CORS Issues
Ensure `SANCTUM_STATEFUL_DOMAINS` in backend `.env` includes your frontend domain.

### Subdomain Not Working
Check your hosts file configuration and ensure subdomain middleware is registered.

### Image Upload Fails
Run `php artisan storage:link` and check file permissions on `storage/` directory.

## Contributing

This is a custom project. If you'd like to contribute, please fork and submit a pull request.

## License

Proprietary - All rights reserved

## Support

For support, email support@myfly.com or create an issue in the repository.

---

Built with ❤️ by MyFly Team

