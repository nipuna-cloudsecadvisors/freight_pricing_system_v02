# 🚀 Deployment Guide

This guide covers step-by-step deployment of the Freight Pricing System in various environments.

## 📋 Prerequisites

### System Requirements
- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recommended for production)
- **Storage**: 20GB+ free space
- **OS**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows with WSL2

### Required Software
- Docker 20.10+
- Docker Compose 2.0+
- Git
- pnpm 8+ (for development)

## 🏗️ Development Deployment

### 1. Clone Repository
```bash
git clone <repository-url>
cd freight-pricing-system
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Install Dependencies
```bash
# Install pnpm globally
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 4. Database Setup
```bash
# Generate Prisma client
pnpm db:generate

# Run database migrations
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

### 6. Verify Installation
- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Production Docker Deployment

#### 1. Environment Configuration
```bash
# Create production environment file
cp .env.example .env.production

# Update with production values
nano .env.production
```

**Required Production Settings:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@db-host:5432/freight_pricing
REDIS_URL=redis://redis-host:6379
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

#### 2. Build and Deploy
```bash
# Build and start production services
docker compose -f docker-compose.yml up -d --build

# Initialize database (first time only)
docker compose exec api pnpm prisma migrate deploy
docker compose exec api pnpm prisma db seed
```

#### 3. SSL Configuration (Optional)
```bash
# Create SSL directory
mkdir ssl

# Add your SSL certificates
# ssl/cert.pem - SSL certificate
# ssl/key.pem - Private key

# Update nginx.conf for HTTPS
```

## ☁️ Cloud Deployment

### AWS Deployment

#### 1. EC2 Instance Setup
```bash
# Launch Ubuntu 20.04 LTS instance
# Minimum: t3.medium (2 vCPU, 4GB RAM)

# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. RDS Database Setup
```bash
# Create RDS PostgreSQL instance
# Engine: PostgreSQL 15
# Instance class: db.t3.micro (for testing)
# Storage: 20GB
# Security group: Allow port 5432 from EC2

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/freight_pricing
```

#### 3. ElastiCache Redis Setup
```bash
# Create ElastiCache Redis cluster
# Engine: Redis 7
# Node type: cache.t3.micro
# Security group: Allow port 6379 from EC2

# Update REDIS_URL in .env
REDIS_URL=redis://your-redis-endpoint:6379
```

#### 4. Deploy Application
```bash
# Clone repository
git clone <repository-url>
cd freight-pricing-system

# Configure environment
cp .env.example .env
nano .env

# Deploy with Docker Compose
docker compose up -d --build
```

### DigitalOcean Deployment

#### 1. Droplet Setup
```bash
# Create Ubuntu 20.04 droplet
# Minimum: 2GB RAM, 1 vCPU

# Connect to droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### 2. Managed Database
```bash
# Create managed PostgreSQL database
# Plan: Basic (1GB RAM, 1 vCPU)
# Update DATABASE_URL in .env

# Create managed Redis database
# Plan: Basic (1GB RAM)
# Update REDIS_URL in .env
```

#### 3. Deploy Application
```bash
# Same as AWS deployment steps
git clone <repository-url>
cd freight-pricing-system
cp .env.example .env
# Configure .env with managed database URLs
docker compose up -d --build
```

## 🔧 Production Configuration

### Security Hardening

#### 1. Environment Variables
```bash
# Generate strong JWT secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET

# Use strong database passwords
# Enable SSL for database connections
# Use environment-specific SMTP/SMS credentials
```

#### 2. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

#### 3. SSL/TLS Setup
```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Database Backup

#### 1. Automated Backups
```bash
# Create backup script
cat > /opt/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
DB_NAME="freight_pricing"

mkdir -p $BACKUP_DIR

# Create backup
docker compose exec -T postgres pg_dump -U postgres $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x /opt/backup-db.sh

# Schedule daily backups
echo "0 2 * * * /opt/backup-db.sh" | sudo crontab -
```

#### 2. Restore from Backup
```bash
# Restore database
docker compose exec -T postgres psql -U postgres freight_pricing < backup_20240101_020000.sql
```

### Monitoring and Logging

#### 1. Application Logs
```bash
# View application logs
docker compose logs -f api
docker compose logs -f web
docker compose logs -f worker

# Log rotation
sudo nano /etc/logrotate.d/docker-compose
```

#### 2. Health Checks
```bash
# API health check
curl http://localhost:3001/health

# Database health check
docker compose exec postgres pg_isready -U postgres

# Redis health check
docker compose exec redis redis-cli ping
```

#### 3. Resource Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop

# Monitor resources
htop
docker stats
```

## 🔄 Updates and Maintenance

### Application Updates

#### 1. Code Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker compose down
docker compose up -d --build

# Run database migrations
docker compose exec api pnpm prisma migrate deploy
```

#### 2. Database Migrations
```bash
# Check migration status
docker compose exec api pnpm prisma migrate status

# Apply pending migrations
docker compose exec api pnpm prisma migrate deploy

# Rollback migration (if needed)
docker compose exec api pnpm prisma migrate resolve --rolled-back <migration-name>
```

### Maintenance Tasks

#### 1. Regular Maintenance
```bash
# Clean up Docker resources
docker system prune -f

# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart services
docker compose restart
```

#### 2. Database Maintenance
```bash
# Analyze database performance
docker compose exec postgres psql -U postgres freight_pricing -c "ANALYZE;"

# Vacuum database
docker compose exec postgres psql -U postgres freight_pricing -c "VACUUM;"
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Services Won't Start
```bash
# Check logs
docker compose logs

# Check disk space
df -h

# Check memory usage
free -h

# Restart Docker
sudo systemctl restart docker
```

#### 2. Database Connection Issues
```bash
# Check database status
docker compose exec postgres pg_isready -U postgres

# Check connection string
echo $DATABASE_URL

# Test connection
docker compose exec api pnpm prisma db pull
```

#### 3. Redis Connection Issues
```bash
# Check Redis status
docker compose exec redis redis-cli ping

# Check Redis logs
docker compose logs redis
```

#### 4. Application Errors
```bash
# Check application logs
docker compose logs api
docker compose logs web

# Check environment variables
docker compose exec api env | grep -E "(DATABASE|REDIS|JWT)"

# Restart specific service
docker compose restart api
```

### Performance Issues

#### 1. Slow Database Queries
```bash
# Enable query logging
# Add to postgresql.conf: log_statement = 'all'
# Restart PostgreSQL

# Analyze slow queries
docker compose exec postgres psql -U postgres freight_pricing -c "
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;"
```

#### 2. High Memory Usage
```bash
# Check memory usage
docker stats

# Increase memory limits in docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 1G
```

## 📞 Support

### Getting Help

1. **Check logs first**: `docker compose logs -f`
2. **Verify environment**: Check all environment variables
3. **Test connectivity**: Ensure database and Redis are accessible
4. **Check resources**: Monitor CPU, memory, and disk usage

### Emergency Procedures

#### 1. Service Recovery
```bash
# Restart all services
docker compose down
docker compose up -d

# Restart specific service
docker compose restart <service-name>
```

#### 2. Database Recovery
```bash
# Restore from backup
docker compose exec -T postgres psql -U postgres freight_pricing < backup.sql

# Reset database (WARNING: data loss)
docker compose exec api pnpm prisma migrate reset --force
```

#### 3. Complete System Reset
```bash
# Stop all services
docker compose down

# Remove all containers and volumes
docker compose down -v
docker system prune -a

# Rebuild from scratch
docker compose up -d --build
```

---

**Remember**: Always test updates in a staging environment before applying to production!