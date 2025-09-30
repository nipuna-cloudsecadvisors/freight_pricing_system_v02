# Freight Pricing System

An **EXPORT-ONLY** freight pricing & activity system built for Sri Lanka forwarders. This comprehensive system handles sea and air export operations with role-based access control, rate management, booking workflows, and activity tracking.

## 🚀 Features

### Core Modules
- **Pre-defined Rates**: Region-based trade lanes with validity tracking and visual highlights
- **Rate Requests**: FCL/LCL requests with automated POL defaulting to Colombo for sea exports
- **Procurement Workflow**: Complete booking lifecycle from rate selection to job completion
- **Itineraries & Activities**: Weekly planning and sales activity tracking
- **Reports & Dashboards**: KPI monitoring with JPEG export capability
- **Admin Panel**: User management, master data, and system configuration

### Key Features
- ✅ **Export-Only Focus**: Sea & Air export workflows (no import functionality)
- ✅ **Role-Based Access**: ADMIN, SBU_HEAD, SALES, CSE, PRICING, MGMT
- ✅ **Smart Defaults**: POL auto-defaults to Colombo for sea exports
- ✅ **Validation Rules**: Equipment-specific requirements (pallet dims for Flat Rack/Open Top)
- ✅ **Notification System**: Email/SMS alerts with pluggable providers
- ✅ **Audit Trail**: Complete activity logging
- ✅ **Customer Approval**: Admin approval required for new customers

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + TanStack Query
- **Backend**: NestJS + TypeScript + Prisma ORM
- **Database**: PostgreSQL
- **Cache/Queue**: Redis + BullMQ
- **Infrastructure**: Docker Compose + Nginx

### Project Structure
```
freight-pricing-system/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── docker-compose.yml
├── nginx.conf
└── README.md
```

## 📋 Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- **Docker** and **Docker Compose**
- **PostgreSQL** 15+ (if running locally)
- **Redis** 7+ (if running locally)

## 🚀 Quick Start (Docker - Recommended)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd freight-pricing-system

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Configure Environment
Update `.env` with your settings:
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/freight_pricing"

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourcompany.com"

# SMS Configuration
SMS_PROVIDER="dummy"  # or "twilio"
SMS_API_KEY="your-sms-api-key"
SMS_FROM="YourCompany"

# Enable/Disable Notifications
EMAIL_ENABLED=true
SMS_ENABLED=true
```

### 3. Start Services
```bash
# Start all services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f
```

### 4. Initialize Database
```bash
# Run database migrations and seed data
docker compose exec api pnpm db:migrate
docker compose exec api pnpm db:seed
```

### 5. Access the Application
- **Web Application**: http://localhost:3000
- **API Documentation**: http://localhost:3001/api/docs
- **API Health Check**: http://localhost:3001/api/health

## 👤 Demo Accounts

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@freightco.lk | password123 | System administrator |
| SBU Head | rajesh@freightco.lk | password123 | Sales business unit head |
| Sales Person | priya@freightco.lk | password123 | Sales representative |
| Sales Person | kamal@freightco.lk | password123 | Sales representative |
| CSE | nimal@freightco.lk | password123 | Customer service executive |
| Pricing | saman@freightco.lk | password123 | Pricing team member |
| Pricing | dilani@freightco.lk | password123 | Pricing team member |
| Management | chaminda@freightco.lk | password123 | Top management (read-only) |

## 🛠️ Development Setup

### 1. Local Development
```bash
# Install dependencies
pnpm install

# Start PostgreSQL and Redis (using Docker)
docker compose up -d db redis

# Generate Prisma client
cd apps/api
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Start API in development mode
pnpm dev

# In another terminal, start web app
cd apps/web
pnpm dev
```

### 2. Development URLs
- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 📊 Sample Data

The seed script creates:
- **3 Trade Lanes**: Asia-Europe, Asia-North America, Asia-Middle East
- **6 Ports**: Colombo, Singapore, Dubai, Hamburg, Los Angeles, New York
- **4 Shipping Lines**: MSC, Maersk, CMA CGM, Evergreen
- **7 Equipment Types**: 20ft, 40ft, 40HC, Reefers, Flat Rack, Open Top
- **3 Customers**: 2 approved, 1 pending approval
- **3 Predefined Rates**: 1 active, 1 expired, 1 expiring soon
- **2 Sample Leads**: For sales activity tracking

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Required |
| `SMTP_HOST` | Email server host | Optional |
| `SMTP_USER` | Email username | Optional |
| `SMTP_PASS` | Email password | Optional |
| `SMS_PROVIDER` | SMS provider (dummy/twilio) | dummy |
| `EMAIL_ENABLED` | Enable email notifications | true |
| `SMS_ENABLED` | Enable SMS notifications | true |

### Email Setup (Gmail Example)
1. Enable 2-factor authentication on Gmail
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

### SMS Setup (Twilio Example)
1. Create Twilio account
2. Get Account SID and Auth Token
3. Set `SMS_PROVIDER=twilio`
4. Set `SMS_API_KEY` and `SMS_API_SECRET`

## 🧪 Testing

### Run E2E Tests
```bash
cd apps/api
pnpm test:e2e
```

### Critical Test Cases
1. **Sea Export POL Default**: Verify POL defaults to Colombo
2. **Vessel Required Validation**: Ensure vessel details are mandatory when requested
3. **Single Selected Quote**: Only one line quote can be selected per request
4. **Booking Cancel Reason**: Cancellation requires mandatory reason

## 📈 Monitoring & Logs

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f web
docker compose logs -f worker
```

### Health Checks
- **API Health**: GET `/api/health`
- **Database**: Check PostgreSQL connection
- **Redis**: Check Redis connection
- **Worker**: Monitor background job processing

## 🔒 Security

### Production Checklist
- [ ] Change default JWT secrets
- [ ] Use strong database passwords
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Set up backup strategy
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Review user permissions

### SSL Setup
```bash
# Generate SSL certificates (Let's Encrypt example)
certbot certonly --standalone -d your-domain.com

# Update nginx.conf with SSL configuration
# Restart nginx
docker compose restart nginx
```

## 🚀 Production Deployment

### 1. Server Requirements
- **CPU**: 2+ cores
- **RAM**: 4GB+ recommended
- **Storage**: 20GB+ SSD
- **OS**: Ubuntu 20.04+ or similar

### 2. Production Environment
```bash
# Clone repository
git clone <repository-url>
cd freight-pricing-system

# Copy and configure environment
cp .env.example .env
nano .env

# Set production values
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com

# Start services
docker compose -f docker-compose.yml up -d

# Initialize database
docker compose exec api pnpm db:migrate
docker compose exec api pnpm db:seed
```

### 3. Domain Setup
1. Point your domain to server IP
2. Update `NEXT_PUBLIC_API_URL` in `.env`
3. Configure SSL certificates
4. Restart services

### 4. Backup Strategy
```bash
# Database backup
docker compose exec db pg_dump -U postgres freight_pricing > backup.sql

# Restore database
docker compose exec -T db psql -U postgres freight_pricing < backup.sql

# File backup (uploads)
tar -czf uploads-backup.tar.gz uploads/
```

## 🔄 Updates & Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker compose build
docker compose up -d

# Run any new migrations
docker compose exec api pnpm db:migrate
```

### Database Maintenance
```bash
# View database size
docker compose exec db psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('freight_pricing'));"

# Vacuum database
docker compose exec db psql -U postgres -d freight_pricing -c "VACUUM ANALYZE;"
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check database status
docker compose ps db

# View database logs
docker compose logs db

# Restart database
docker compose restart db
```

#### 2. API Not Starting
```bash
# Check API logs
docker compose logs api

# Common issues:
# - Database not ready
# - Missing environment variables
# - Port conflicts
```

#### 3. Frontend Build Errors
```bash
# Check web logs
docker compose logs web

# Rebuild web container
docker compose build web
docker compose up -d web
```

#### 4. Email/SMS Not Working
```bash
# Check worker logs
docker compose logs worker

# Verify environment variables
docker compose exec api env | grep SMTP
docker compose exec api env | grep SMS
```

### Reset Everything
```bash
# Stop all services
docker compose down

# Remove volumes (WARNING: This deletes all data!)
docker compose down -v

# Rebuild and start
docker compose build
docker compose up -d

# Reinitialize
docker compose exec api pnpm db:migrate
docker compose exec api pnpm db:seed
```

## 📞 Support

### Getting Help
1. Check this README for common issues
2. Review application logs
3. Check API documentation at `/api/docs`
4. Verify environment configuration

### System Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB SSD
- **Network**: Stable internet for email/SMS notifications

## 📄 License

This project is proprietary software. All rights reserved.

---

**🎉 Congratulations!** Your Freight Pricing System is now ready for use. The system provides a complete export-only workflow with all the features specified in your requirements.