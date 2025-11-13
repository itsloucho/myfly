# Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=DemoDataSeeder
php artisan storage:link
php artisan serve
```

Keep this terminal open. Backend runs on `http://localhost:8000`

### Step 2: Frontend Setup
Open a NEW terminal:
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage
```

Then run:
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

### Step 3: Login
Visit `http://localhost:3000`
- Email: `admin@demo.com`
- Password: `password`

## 📝 Test Credentials

**Admin User:**
- Email: admin@demo.com
- Password: password
- Role: agency_admin

**Customer User:**
- Email: customer@demo.com
- Password: password
- Role: end_user

## 🌐 Subdomain Testing (Optional)

### Windows
1. Open Notepad as Administrator
2. Open `C:\Windows\System32\drivers\etc\hosts`
3. Add:
```
127.0.0.1 demo.localhost
127.0.0.1 agency1.localhost
```
4. Save and close

### Mac/Linux
```bash
sudo nano /etc/hosts
```
Add:
```
127.0.0.1 demo.localhost
127.0.0.1 agency1.localhost
```
Save (Ctrl+X, Y, Enter)

### Test
Visit `http://demo.localhost:3000`

## 🎯 What's Working (MVP)

✅ Authentication (Login/Register)
✅ Dashboard with Statistics
✅ Voyages (Trips) CRUD
✅ Reservations Management
✅ Multi-tenant Architecture
✅ File Upload (Images)
✅ API with CORS configured

## 🔜 Coming Soon

- Clients Management
- Billets (Tickets)
- Hôtels
- Finances
- Documents
- Notes
- Analytics Dashboard
- Testimonials
- Settings
- Super Admin Dashboard

## 🐛 Common Issues

### Issue: "composer not found"
Install Composer from https://getcomposer.org/

### Issue: "npm not found"
Install Node.js from https://nodejs.org/

### Issue: CORS errors
Check `backend/.env`:
```env
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost
```

### Issue: Images not uploading
Run:
```bash
cd backend
php artisan storage:link
```

### Issue: Database errors
Make sure you ran migrations:
```bash
cd backend
php artisan migrate:fresh --seed
```

## 🎨 Customization

### Change Theme Color
Edit `frontend/app/globals.css` - look for `--primary: #8A77ED`

### Change Font
Edit `frontend/app/globals.css` - look for `@import url('https://fonts.googleapis.com/css2?family=Onest`

## 📚 Next Steps

1. Create your own tenant in the database
2. Register a new agency admin user
3. Start creating trips and managing reservations
4. Customize the theme to match your brand
5. Deploy to production (see README.md)

## 💡 Tips

- The demo seeder creates sample data to help you test
- All API endpoints are protected except public trip viewing and booking
- File uploads are stored in `backend/storage/app/public`
- Frontend uses Zustand for state management
- Backend uses Laravel Sanctum for API authentication

## 🆘 Need Help?

Check the main [README.md](README.md) for detailed documentation.

