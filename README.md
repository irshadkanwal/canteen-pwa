# Canteen PWA - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [What the Project Does](#what-the-project-does)
3. [How It Works](#how-it-works)
4. [Technology Stack](#technology-stack)
5. [Prerequisites](#prerequisites)
6. [Installation](#installation)
7. [Configuration](#configuration)
8. [Database Setup](#database-setup)
9. [Running the Project](#running-the-project)
10. [Building the Project](#building-the-project)
11. [Deployment with Nginx](#deployment-with-nginx)
12. [Project Structure](#project-structure)
13. [Key Features](#key-features)

---

## Project Overview

**Canteen PWA** is a Progressive Web Application (PWA) designed for managing employee and contractor check-ins at a canteen facility. It provides QR code-based check-in system, offline support, meal deduction tracking, and a comprehensive admin dashboard.

## What the Project Does

The application serves the following purposes:

1. **Check-In Management**

   - QR code scanning for employees and contractors
   - Manual search and check-in functionality
   - Guest tracking for employees
   - Real-time check-in validation and restrictions

2. **Admin Dashboard**

   - Employee and contractor management
   - Bulk data upload (Excel/CSV files)
   - Meal deductions tracking
   - Reports and analytics
   - Visit log management
   - QR code generation

3. **Offline Functionality**

   - Queue check-ins when offline
   - Automatic sync when connection is restored
   - Local caching of employee data

4. **Meal Deductions**
   - Automatic meal deduction calculations
   - Meal deduction records management
   - Daily/weekly/monthly reporting

## How It Works

### Architecture

The application follows this architecture:

- **Frontend**: Next.js with React (client-side rendering)
- **Backend**: Next.js API routes (server-side)
- **Database**: PostgreSQL with Sequelize ORM
- **PWA**: Service Worker for offline support

### Check-In Flow

1. User scans QR code or searches manually
2. System validates employee/contractor status
3. Checks if already checked in (prevents duplicates)
4. If offline: queues check-in for later sync
5. If online: processes immediately
6. Records visit log and meal deduction (if applicable)

### Offline Queue System

- Check-ins are stored in localStorage when offline
- When connection is restored, queued items sync automatically
- Failed syncs are retried on next connection
- Queue status is visible in the UI

## Technology Stack

- **Framework**: Next.js 15.3.2
- **Runtime**: Node.js
- **Database**: PostgreSQL
- **ORM**: Sequelize 6.37.7
- **Authentication**: JWT (jsonwebtoken)
- **QR Code**: html5-qrcode, qrcode
- **PWA**: next-pwa
- **UI**: React 19.1.0, CSS Modules
- **Charts**: Chart.js, react-chartjs-2
- **File Processing**: ExcelJS, xlsx, csv-parse

## Prerequisites

Before starting, ensure you have installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Nginx** (for production deployment)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd canteen-pwa
```

2. Install dependencies:

```bash
npm install
```

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=canteen_db

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# JWT Secret (generate a random string)
JWT_SECRET=your-secret-key-here

# Email Configuration (optional, for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@canteen.com

# SSH Configuration (optional, for network file service)
SSH_HOST=your-ssh-host
SSH_USERNAME=your-username
SSH_PASSWORD=your-password
```

### Database Configuration

Database settings can be configured in:

- `config/database.js` (uses environment variables)
- `config/config.json` (Sequelize CLI configuration)

For production, use environment variables instead of hardcoded values.

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE canteen_db;

# Exit psql
\q
```

### 2. Run Migrations

```bash
# Run all pending migrations
npm run db:migrate

# To undo the last migration
npm run db:migrate:undo

# To undo all migrations
npm run db:migrate:undo:all
```

### 3. Seed Database (Optional)

```bash
# Seed the database with sample data
npm run db:seed

# To undo seeders
npm run db:seed:undo
```

### 4. Create Admin User

```bash
# Use the script to create an admin user
node scripts/create-admin.js
```

Or manually create via the admin registration endpoint at `/api/admin/admin-users`.

## Running the Project

### Development Mode

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Mode (after building)

```bash
# First, build the application
npm run build

# Then start the production server
npm start
```

The application will run on port 3000 by default (or the PORT environment variable if set).

### Database Scripts

```bash
# Run migrations
npm run db:migrate

# Run seeders
npm run db:seed

# Reset database (undo all migrations, re-run migrations, and seed)
npm run db:reset
```

## Building the Project

### Build for Production

```bash
# Build the Next.js application
npm run build
```

This will:

- Compile Next.js pages and API routes
- Optimize assets
- Generate static pages where possible
- Create the production build in `.next` directory

### Build Output

After building:

- **`.next/`**: Compiled Next.js application
- **`public/`**: Static assets (already present)
- **`node_modules/`**: Dependencies

### Start Production Build

```bash
# Start the production server
npm start
```

Or set a custom port:

```bash
PORT=8080 npm start
```

## Deployment with Nginx

### 1. Install Nginx

```bash
# On Ubuntu/Debian
sudo apt update
sudo apt install nginx

# On macOS (using Homebrew)
brew install nginx

# On CentOS/RHEL
sudo yum install nginx
```

### 2. Build the Application

```bash
npm run build
```

### 3. Start Next.js Server

```bash
# Start on a specific port (e.g., 3000)
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "canteen-pwa" -- start
pm2 save
pm2 startup
```

### 4. Configure Nginx

Create/edit upstream configuration file:

```bash
sudo nano /etc/nginx/sites-available/canteen-pwa
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    # Increase body size limit for file uploads
    client_max_body_size 10M;

    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static assets caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # Public assets
    location /public {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5. Enable Nginx Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/canteen-pwa /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
```

### 6. Start/Restart Nginx

```bash
# Start Nginx
sudo systemctl start nginx

# Restart Nginx (after configuration changes)
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx

# Check Nginx status
sudo systemctl status nginx
```

### 7. HTTPS Setup (Recommended)

For production, set up SSL using Let's Encrypt:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Certbot will automatically configure Nginx for HTTPS
```

### Nginx Commands Summary

```bash
# Start Nginx
sudo systemctl start nginx

# Stop Nginx
sudo systemctl stop nginx

# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (without dropping connections)
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

## Project Structure

```
canteen-pwa/
├── components/          # React components
│   ├── AdminLayout.js
│   ├── QrScanner.js
│   └── ...
├── config/             # Configuration files
│   ├── database.js
│   └── sequelize.js
├── context/            # React context providers
├── lib/                # Utility libraries
│   ├── offline/       # Offline queue management
│   └── serverOnly/    # Server-side utilities
├── middleware/         # Express/Next.js middleware
├── migrations/         # Database migrations
├── models/            # Sequelize models
├── pages/             # Next.js pages and API routes
│   ├── api/          # API endpoints
│   ├── admin/        # Admin pages
│   └── index.js      # Home page
├── public/            # Static assets
├── scripts/           # Utility scripts
├── seeders/           # Database seeders
├── styles/            # CSS files
└── utils/             # Utility functions
```

## Key Features

### 1. QR Code Check-In

- Real-time QR code scanning
- Support for employees and contractors
- Guest tracking for employees

### 2. Offline Support

- Automatic queue when offline
- Background sync when online
- Visual queue status indicator

### 3. User Experience

- Dark mode support
- Responsive design
- PWA functionality (installable as app)

### 4. Admin Dashboard

- Employee/contractor management
- Bulk upload functionality
- Reports and analytics
- Meal deduction tracking

### 5. Reports

- Daily/weekly/monthly reports
- CSV/Excel export
- Graphs and charts visualization

---

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check connection credentials in `.env.local` and `config/database.js`
- Ensure database exists: `psql -U postgres -l`

### Build Errors

- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Next.js cache: `rm -rf .next`

### Nginx Issues

- Check configuration syntax: `sudo nginx -t`
- View error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify Next.js app is running: `curl http://localhost:3000`

---

## Support

For questions or issues, please contact the project maintainers.

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX
