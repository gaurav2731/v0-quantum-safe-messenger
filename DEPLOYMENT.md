# 🚀 Deployment Guide

## 📋 Prerequisites

Before deploying, ensure you have:

- **Node.js** v16+ installed
- **PostgreSQL** v12+ installed and running
- **Git** for version control
- **PM2** (optional, for production process management)

## 🛠️ Local Development Setup

### 1. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE quantum_safe_messenger;

# Exit PostgreSQL
\q

# Run database schema
psql -U postgres -d quantum_safe_messenger -f server/database/schema.sql
```

### 2. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
```env
# Database
DATABASE_URL=postgresql://localhost:5432/quantum_safe_messenger
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quantum_safe_messenger
DB_USER=postgres
DB_PASSWORD=your_password

# Security
JWT_SECRET=your-32-character-jwt-secret-here
ENCRYPTION_KEY=your-32-character-encryption-key-here
HMAC_SECRET=your-hmac-secret-for-message-auth

# Server
PORT=3001
NODE_ENV=development
```

### 3. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install development dependencies
npm install --save-dev jest supertest nodemon
```

### 4. Start Development Server

```bash
# Start backend server
npm run server:dev

# In another terminal, start frontend (Next.js)
npm run dev
```

## ☁️ Production Deployment

### Option 1: Traditional Server Deployment

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Application Deployment

```bash
# Clone repository
git clone <your-repo-url>
cd v0-quantum-safe-messenger

# Install dependencies
npm install --production

# Build frontend
npm run build

# Setup environment
cp .env.example .env.production
# Edit with production values
```

#### 3. Database Setup

```bash
# Create production database
sudo -u postgres psql -c "CREATE DATABASE quantum_safe_messenger_production;"

# Run schema
sudo -u postgres psql -d quantum_safe_messenger_production -f server/database/schema.sql

# Create database user
sudo -u postgres psql -c "CREATE USER messenger_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE quantum_safe_messenger_production TO messenger_user;"
```

#### 4. Process Management with PM2

```bash
# Start application with PM2
pm2 start server/server.js --name "messenger-backend"
pm2 start npm --name "messenger-frontend" -- start

# Save PM2 configuration
pm2 save
pm2 startup

# Monitor processes
pm2 status
pm2 logs
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "run", "server"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/quantum_safe_messenger
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=quantum_safe_messenger
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./server/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale application
docker-compose up -d --scale app=3
```

### Option 3: Cloud Deployment (Vercel/Render)

#### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

#### Render Deployment

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm run build`
4. Set start command: `npm run server`
5. Add environment variables in Render dashboard

## 🔒 Security Configuration

### SSL/TLS Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Configuration

```bash
# UFW setup
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3001/tcp  # Backend API
```

### Database Security

```bash
# PostgreSQL security
sudo -u postgres psql

# Create dedicated user
CREATE USER messenger_app WITH PASSWORD 'very_secure_password';
GRANT CONNECT ON DATABASE quantum_safe_messenger TO messenger_app;
GRANT USAGE ON SCHEMA public TO messenger_app;

# Revoke public access
REVOKE ALL ON SCHEMA public FROM PUBLIC;
```

## 📊 Monitoring and Maintenance

### Log Management

```bash
# View application logs
pm2 logs

# Log rotation
sudo nano /etc/logrotate.d/messenger
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump quantum_safe_messenger > backup_$DATE.sql
tar -czf backup_$DATE.tar.gz backup_$DATE.sql
rm backup_$DATE.sql
```

### Health Checks

```bash
# Simple health check script
#!/bin/bash
curl -f http://localhost:3001/api/health || exit 1
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Test connection
   psql -U postgres -d quantum_safe_messenger
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3001
   
   # Kill process
   kill -9 <PID>
   ```

3. **Permission Errors**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /path/to/app
   sudo chmod -R 755 /path/to/app
   ```

### Performance Optimization

```bash
# Database optimization
# Add to postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB

# Application optimization
# Use clustering for multiple instances
# Implement caching with Redis
# Use CDN for static assets
```

## 📱 Mobile App Deployment

### Android Deployment

```bash
# Build Android app
npx cap add android
npx cap sync
npx cap open android

# Generate signed APK
# In Android Studio: Build → Generate Signed Bundle / APK
```

### iOS Deployment

```bash
# Build iOS app
npx cap add ios
npx cap sync
npx cap open ios

# Archive and upload to App Store
# In Xcode: Product → Archive
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          ssh user@server 'cd /app && git pull && npm install && pm2 restart messenger-backend'
```

This deployment guide provides comprehensive instructions for deploying your Quantum-Safe Messenger in various environments. Choose the option that best fits your infrastructure and requirements.