# Freight Pricing System

An export-only freight pricing & activity system for Sri Lanka forwarders built with Next.js 14, NestJS, PostgreSQL, and Redis.

## 🚀 Features

### Core Modules
- **Pre-defined Rates**: Region-based trade lanes with validity windows and visual highlights
- **Rate Requests**: FCL/LCL requests with comprehensive fields and multi-line responses
- **Procurement Workflow**: Complete booking process from rate selection to job completion
- **Itineraries & Sales Activity**: Weekly planning and activity tracking
- **Reports & Dashboards**: KPI tracking and role-based analytics
- **Admin & Security**: User management, customer approvals, and system configuration

### User Roles
- **Admin**: Full system access and configuration
- **Sales Person (SP)**: Rate requests, bookings, itineraries, activities
- **Customer Service Executive (CSE)**: RO handling, job management
- **Pricing Team Member**: Rate management and request processing
- **Sales Business Unit Head (SBU Head)**: Team management and approvals
- **Top Management**: Read-only dashboards and reports

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, TanStack Query
- **Backend**: NestJS with TypeScript, Prisma ORM
- **Database**: PostgreSQL with Redis for caching and queues
- **Authentication**: JWT with role-based access control
- **Notifications**: Email and SMS providers (pluggable)
- **Infrastructure**: Docker Compose with Nginx reverse proxy

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose
- Git

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd freight_pricing_system_v03
pnpm install
```

### 2. Environment Configuration

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/freight_pricing?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@freightpricing.com"

# SMS Configuration
SMS_PROVIDER="dummy"
SMS_API_KEY="your-sms-api-key"
SMS_API_SECRET="your-sms-api-secret"
SMS_FROM_NUMBER="+1234567890"
```

### 3. Start with Docker Compose

```bash
docker compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis on port 6379
- API server on port 3001
- Web frontend on port 3000
- Nginx reverse proxy on port 80

### 4. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed initial data
pnpm db:seed
```

### 5. Access the Application

- **Web Application**: http://localhost:3000
- **API Documentation**: http://localhost:3001/api/docs
- **Database Admin**: Use your preferred PostgreSQL client

## 🔑 Default Login Credentials

After seeding, you can login with:

- **Admin**: admin@freightpricing.com / admin123
- **Sales**: mike.wilson@freightpricing.com / password123
- **Pricing**: emma.davis@freightpricing.com / password123
- **SBU Head**: john.smith@freightpricing.com / password123
- **CSE**: david.lee@freightpricing.com / password123
- **Management**: robert.taylor@freightpricing.com / password123

## 🛠️ Development

### Local Development

```bash
# Start database and Redis
docker compose up -d db redis

# Start API in development mode
cd apps/api
pnpm dev

# Start web in development mode (new terminal)
cd apps/web
pnpm dev
```

### Available Scripts

```bash
# Root level
pnpm dev          # Start all services in development
pnpm build        # Build all applications
pnpm test         # Run all tests
pnpm lint         # Lint all code
pnpm type-check   # Type check all TypeScript

# Database operations
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed database with sample data

# Docker operations
pnpm docker:up    # Start all services
pnpm docker:down  # Stop all services
pnpm docker:logs  # View logs
```

## 📁 Project Structure

```
freight_pricing_system_v03/
├── apps/
│   ├── api/                 # NestJS API server
│   │   ├── src/
│   │   │   ├── auth/        # Authentication module
│   │   │   ├── common/      # Shared utilities
│   │   │   ├── database/    # Prisma service
│   │   │   ├── modules/     # Business modules
│   │   │   ├── notifications/ # Email/SMS providers
│   │   │   └── worker/      # Background job processor
│   │   └── prisma/          # Database schema and migrations
│   └── web/                 # Next.js frontend
│       └── src/
│           ├── app/         # App router pages
│           ├── components/  # React components
│           ├── hooks/       # Custom React hooks
│           └── lib/         # Utilities and API client
├── packages/                # Shared packages (future)
├── docker-compose.yml       # Docker services configuration
├── nginx.conf              # Nginx reverse proxy config
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/reset/request-otp` - Request password reset
- `POST /auth/reset/confirm` - Confirm password reset

### Masters
- `GET /ports` - Get all ports
- `GET /trade-lanes` - Get all trade lanes
- `GET /equipment-types` - Get all equipment types
- `GET /shipping-lines` - Get all shipping lines

### Rates
- `GET /rates/predefined` - Get predefined rates
- `POST /rates/requests` - Create rate request
- `GET /rates/requests` - Get rate requests
- `POST /rates/requests/:id/respond` - Respond to rate request

### Booking
- `POST /booking-requests` - Create booking request
- `GET /booking-requests` - Get booking requests
- `POST /booking-requests/:id/confirm` - Confirm booking

### Reports
- `GET /reports/response-time` - Average response time
- `GET /reports/top-sps` - Top salespersons
- `GET /reports/status-cards` - Status statistics

## 🧪 Testing

### E2E Tests
1. Sea export POL defaults to Colombo
2. Vessel fields required when vessel_required=true
3. Only one selected line_quote per request
4. Booking cancellation requires reason

### Unit Tests
- Helper functions
- Date validity checks
- Processed percentage logic

## 🚀 Deployment

### Production Environment

1. Update environment variables for production
2. Set up SSL certificates for HTTPS
3. Configure proper SMTP and SMS providers
4. Set up monitoring and logging
5. Configure backup strategies

### Environment Variables

Ensure all required environment variables are set:
- Database connection string
- Redis connection string
- JWT secrets
- Email/SMS provider credentials
- File upload settings

## 📝 Key Features Implementation

### Rate Request Flow
1. Sales creates rate request (POL defaults to Colombo for sea export)
2. Pricing team receives notification
3. Pricing responds with multiple lines and vessel details if required
4. Sales can create booking from approved rates
5. CSE handles RO documents and job completion

### Notification System
- System notifications for all users
- Email notifications for external communication
- SMS notifications for urgent updates
- Queue-based processing with Redis/BullMQ

### Security Features
- JWT-based authentication with refresh tokens
- Role-based access control
- Password reset with OTP
- Input validation and sanitization
- Audit logging for all actions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is proprietary software for freight pricing operations.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.
