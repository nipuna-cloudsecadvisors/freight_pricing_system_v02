# Freight Pricing System

An export-only freight pricing & activity system for Sri Lanka forwarder built with Next.js 14, NestJS, PostgreSQL, and Redis.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### 1. Clone and Setup

```bash
git clone <repository-url>
cd freight-pricing-system
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file with your settings:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/freight_pricing?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secrets (generate strong secrets for production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Freight Pricing System <noreply@yourcompany.com>"

# SMS Configuration (Twilio)
SMS_PROVIDER="twilio"
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed initial data
pnpm db:seed
```

### 5. Start Development

```bash
# Start all services
pnpm dev

# Or start individual services
pnpm --filter @freight/api dev
pnpm --filter @freight/web dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 🐳 Docker Deployment

### Quick Docker Setup

```bash
# Start all services with Docker Compose
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Production Deployment

1. **Update environment variables** in `.env` for production
2. **Build and start services**:

```bash
docker compose -f docker-compose.yml up -d --build
```

3. **Initialize database** (first time only):

```bash
# Run migrations
docker compose exec api pnpm prisma migrate deploy

# Seed data
docker compose exec api pnpm prisma db seed
```

## 📋 Default Users

After seeding, you can login with these accounts:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@freight.com | admin123 | System administrator |
| SBU Head | sbu@freight.com | sbu123 | Sales business unit head |
| Sales | sales@freight.com | sales123 | Sales person |
| CSE | cse@freight.com | cse123 | Customer service executive |
| Pricing | pricing@freight.com | pricing123 | Pricing team member |
| Management | mgmt@freight.com | mgmt123 | Top management (read-only) |

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, TanStack Query
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis with BullMQ
- **Authentication**: JWT with refresh tokens
- **Notifications**: SMTP email + SMS (Twilio)
- **Deployment**: Docker Compose

### Project Structure

```
freight-pricing-system/
├── apps/
│   ├── api/                 # NestJS API server
│   │   ├── src/
│   │   │   ├── auth/        # Authentication module
│   │   │   ├── users/       # User management
│   │   │   ├── customers/   # Customer management
│   │   │   ├── masters/     # Reference data
│   │   │   ├── rates/       # Rate requests & predefined rates
│   │   │   ├── booking/     # Booking management
│   │   │   ├── itinerary/   # Itinerary management
│   │   │   ├── activities/  # Sales activities
│   │   │   ├── notifications/ # Notification system
│   │   │   ├── reports/     # Reports & dashboards
│   │   │   └── audit/       # Audit logging
│   │   └── prisma/          # Database schema & migrations
│   └── web/                 # Next.js frontend
│       └── src/
│           ├── app/         # App router pages
│           ├── components/  # React components
│           └── lib/         # Utilities & API client
├── docker-compose.yml       # Docker services
├── nginx.conf              # Reverse proxy config
└── package.json            # Workspace configuration
```

## 🔧 Key Features

### Export-Only Scope
- **Sea Export** and **Air Export** modes only
- No import workflows (future-ready architecture)

### Pre-defined Rates Management
- Region → Trade Lane organization
- Visual validity indicators (expired=red, expiring=yellow)
- Sales can request updates on expired rates
- Automatic notifications to pricing team

### Rate Request System
- Comprehensive request fields (POL, POD, equipment, etc.)
- **Sea Export default POL = Colombo**
- Vessel details required when requested
- Multiple response lines support
- Processed percentage calculation
- Reference number generation

### Role-Based Access Control
- **ADMIN**: Full system access, user management
- **SBU_HEAD**: Sales management, itinerary approval
- **SALES**: Rate requests, customer management, itineraries
- **CSE**: Customer service, job completion
- **PRICING**: Rate management, request responses
- **MGMT**: Read-only dashboards and reports

### Booking & Procurement Workflow
1. Sales picks predefined rate or submits request
2. Pricing gets quotes from shipping lines
3. Pricing responds with multiple options
4. Sales confirms or cancels (with reason)
5. Lines place booking → RO received
6. CS sends RO to CSE → ERP Job Open
7. CSE enters completed job details

### Notifications & Reporting
- Unified notification inbox
- Email + SMS notifications
- KPI dashboards (response time, top SPs, status cards)
- Dashboard export to JPEG
- Audit trail for all actions

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev                    # Start all services
pnpm build                  # Build all packages
pnpm test                   # Run all tests
pnpm lint                   # Lint all packages
pnpm format                 # Format code with Prettier

# Database
pnpm db:generate           # Generate Prisma client
pnpm db:migrate            # Run database migrations
pnpm db:seed               # Seed initial data
pnpm db:reset              # Reset database (WARNING: deletes all data)

# Docker
pnpm docker:up             # Start Docker services
pnpm docker:down           # Stop Docker services
pnpm docker:logs           # View Docker logs
```

### API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/reset/request-otp` - Request password reset
- `POST /auth/reset/confirm` - Confirm password reset

#### Rate Management
- `GET /rates/predefined` - Get predefined rates
- `POST /rates/predefined` - Create predefined rate (PRICING)
- `POST /rates/requests` - Create rate request (SALES)
- `POST /rates/requests/:id/respond` - Respond to request (PRICING)

#### Booking Management
- `POST /booking-requests` - Create booking request (SALES)
- `POST /booking-requests/:id/confirm` - Confirm booking (SALES)
- `POST /booking-requests/:id/cancel` - Cancel booking (SALES)

#### Reports
- `GET /reports/response-time` - Average response time
- `GET /reports/top-sps` - Top 10 salespersons
- `GET /reports/status-cards` - Status distribution
- `GET /reports/dashboard/export-jpeg` - Export dashboard

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password reset via OTP (email/SMS)
- Input validation with class-validator
- SQL injection protection via Prisma ORM
- CORS configuration
- Rate limiting with Throttler

## 📊 Database Schema

### Key Models
- **Users**: Authentication and role management
- **Customers**: Customer data with approval workflow
- **RateRequests**: FCL/LCL rate requests
- **PredefinedRates**: Pre-configured rates by trade lane
- **BookingRequests**: Booking workflow management
- **Itineraries**: Sales and CSE weekly planning
- **Notifications**: Unified notification system
- **AuditEvents**: Complete audit trail

## 🚨 Important Notes

### Business Rules Enforced
1. **Sea Export default POL = Colombo** if not specified
2. **Flat Rack/Open Top equipment** requires pallet dimensions
3. **Vessel details required** when vessel_required=true
4. **Only one selected line quote** per rate request
5. **Booking cancellation** requires reason
6. **Customer approval** required before use
7. **Password reset** cannot use current password

### Production Considerations
1. **Change default JWT secrets** in production
2. **Configure proper SMTP/SMS providers**
3. **Set up SSL certificates** for HTTPS
4. **Configure database backups**
5. **Set up monitoring and logging**
6. **Use environment-specific configurations**

## 🆘 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Run `pnpm db:migrate`

2. **Redis connection failed**
   - Check Redis is running
   - Verify REDIS_URL in .env

3. **Authentication errors**
   - Check JWT secrets are set
   - Verify user exists in database
   - Run `pnpm db:seed` to create default users

4. **Docker issues**
   - Check Docker is running
   - Run `docker compose down && docker compose up -d`
   - Check logs with `docker compose logs`

### Getting Help

1. Check the logs: `pnpm docker:logs`
2. Verify environment variables
3. Ensure all services are running
4. Check database migrations: `pnpm db:migrate`

## 📝 License

This project is proprietary software for internal use only.

---

**Built with ❤️ for efficient freight pricing management**