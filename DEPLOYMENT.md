# 🚀 Deployment Guide

This guide provides step-by-step instructions for deploying the Freight Pricing System in production.

## 📋 Prerequisites

- Ubuntu 20.04+ server with sudo access
- Domain name pointed to your server
- At least 4GB RAM and 2 CPU cores
- 20GB+ available disk space

## 🔧 Server Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3. Install Node.js & pnpm (for local development)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm
```

## 📦 Application Deployment

### 1. Clone Repository
```bash
cd /opt
sudo git clone <your-repository-url> freight-pricing
sudo chown -R $USER:$USER freight-pricing
cd freight-pricing
```

### 2. Configure Environment
```bash
cp .env.example .env
nano .env
```

**Production Environment Configuration:**
```env
# Database
DATABASE_URL="postgresql://postgres:your-secure-password@db:5432/freight_pricing"

# Redis
REDIS_URL="redis://redis:6379"

# JWT Secrets - CHANGE THESE!
JWT_SECRET="your-super-secure-jwt-secret-min-32-chars"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourcompany.com"

# SMS Configuration (Twilio example)
SMS_PROVIDER="twilio"
SMS_API_KEY="your-twilio-account-sid"
SMS_API_SECRET="your-twilio-auth-token"
SMS_FROM="+1234567890"

# Application
API_PORT=3001
WEB_PORT=3000
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://your-domain.com"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10mb"

# Notification Settings
EMAIL_ENABLED=true
SMS_ENABLED=true

# Admin Settings
ADMIN_EMAIL="admin@yourcompany.com"
ADMIN_PHONE="+94771234567"
```

### 3. SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot

# Generate SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Update nginx.conf for SSL
nano nginx.conf
```

**SSL-enabled nginx.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3001;
    }

    upstream web {
        server web:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # API routes
        location /api/ {
            proxy_pass http://api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Web app
        location / {
            proxy_pass http://web/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 4. Update Docker Compose for Production
```bash
nano docker-compose.yml
```

Add SSL volume mounts:
```yaml
  nginx:
    image: nginx:alpine
    container_name: freight-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - web
      - api
```

### 5. Deploy Application
```bash
# Build and start services
docker-compose build
docker-compose up -d

# Check service status
docker-compose ps

# Initialize database
docker-compose exec api pnpm db:migrate
docker-compose exec api pnpm db:seed

# View logs
docker-compose logs -f
```

## 🔒 Security Hardening

### 1. Firewall Configuration
```bash
# Install UFW
sudo apt install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 2. Fail2Ban Setup
```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure Fail2Ban
sudo nano /etc/fail2ban/jail.local
```

**Fail2Ban configuration:**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
```

### 3. Database Security
```bash
# Connect to database
docker-compose exec db psql -U postgres

-- Create application user with limited privileges
CREATE USER freight_app WITH PASSWORD 'secure-app-password';
GRANT CONNECT ON DATABASE freight_pricing TO freight_app;
GRANT USAGE ON SCHEMA public TO freight_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO freight_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO freight_app;

-- Update connection string in .env
-- DATABASE_URL="postgresql://freight_app:secure-app-password@db:5432/freight_pricing"
```

## 📊 Monitoring Setup

### 1. Log Management
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/docker-containers
```

```
/var/lib/docker/containers/*/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    copytruncate
}
```

### 2. Health Monitoring Script
```bash
nano /opt/freight-pricing/health-check.sh
chmod +x /opt/freight-pricing/health-check.sh
```

```bash
#!/bin/bash
# Health check script

API_URL="https://your-domain.com/api/health"
SLACK_WEBHOOK="your-slack-webhook-url"

response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response != "200" ]; then
    echo "API health check failed with status: $response"
    # Send alert to Slack
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 Freight Pricing API is down! Status: '$response'"}' \
        $SLACK_WEBHOOK
fi
```

### 3. Cron Jobs
```bash
crontab -e
```

```cron
# Health check every 5 minutes
*/5 * * * * /opt/freight-pricing/health-check.sh

# Database backup daily at 2 AM
0 2 * * * /opt/freight-pricing/backup.sh

# SSL certificate renewal
0 3 * * 1 certbot renew --quiet && docker-compose restart nginx
```

## 💾 Backup Strategy

### 1. Database Backup Script
```bash
nano /opt/freight-pricing/backup.sh
chmod +x /opt/freight-pricing/backup.sh
```

```bash
#!/bin/bash
# Database backup script

BACKUP_DIR="/opt/backups/freight-pricing"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="freight_pricing_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
docker-compose exec -T db pg_dump -U postgres freight_pricing > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### 2. File Backup
```bash
# Backup uploads and configuration
tar -czf /opt/backups/freight-pricing/uploads_$(date +%Y%m%d).tar.gz uploads/
tar -czf /opt/backups/freight-pricing/config_$(date +%Y%m%d).tar.gz .env nginx.conf docker-compose.yml
```

## 🔄 Update Process

### 1. Application Updates
```bash
cd /opt/freight-pricing

# Backup current version
tar -czf ../freight-pricing-backup-$(date +%Y%m%d).tar.gz .

# Pull latest changes
git pull origin main

# Update services
docker-compose build
docker-compose up -d

# Run migrations if needed
docker-compose exec api pnpm db:migrate

# Verify deployment
curl -f https://your-domain.com/api/health
```

### 2. Rollback Process
```bash
# Stop services
docker-compose down

# Restore from backup
cd /opt
tar -xzf freight-pricing-backup-YYYYMMDD.tar.gz

# Start services
cd freight-pricing
docker-compose up -d
```

## 📈 Performance Optimization

### 1. Database Optimization
```sql
-- Connect to database
docker-compose exec db psql -U postgres freight_pricing

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rate_requests_salesperson ON rate_requests(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_rate_requests_status ON rate_requests(status);
CREATE INDEX IF NOT EXISTS idx_rate_requests_created ON rate_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_predefined_rates_validity ON predefined_rates(valid_to);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at);

-- Analyze tables
ANALYZE;
```

### 2. Docker Resource Limits
```yaml
# Add to docker-compose.yml
services:
  api:
    # ... existing config
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
  
  web:
    # ... existing config
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.25'
```

## 🚨 Troubleshooting

### Common Issues

#### 1. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --force-renewal

# Restart nginx
docker-compose restart nginx
```

#### 2. Database Connection Issues
```bash
# Check database logs
docker-compose logs db

# Test database connection
docker-compose exec db psql -U postgres -c "SELECT version();"

# Reset database password
docker-compose exec db psql -U postgres -c "ALTER USER postgres PASSWORD 'new-password';"
```

#### 3. High Memory Usage
```bash
# Check container resource usage
docker stats

# Restart services to free memory
docker-compose restart

# Clean up unused Docker resources
docker system prune -a
```

#### 4. Email/SMS Not Working
```bash
# Check worker logs
docker-compose logs worker

# Test SMTP connection
docker-compose exec api node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'your-email', pass: 'your-password' }
});
transporter.verify().then(console.log).catch(console.error);
"
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly:**
   - Check application logs
   - Verify backup integrity
   - Monitor disk space usage

2. **Monthly:**
   - Update system packages
   - Review security logs
   - Optimize database performance

3. **Quarterly:**
   - Update Docker images
   - Review and rotate secrets
   - Performance testing

### Emergency Contacts
- System Administrator: admin@yourcompany.com
- Database Administrator: dba@yourcompany.com
- Security Team: security@yourcompany.com

---

**🎉 Your Freight Pricing System is now deployed and secured for production use!**