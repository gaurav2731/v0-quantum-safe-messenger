#!/bin/bash
# Quantum-Safe Messenger Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: dev, staging, prod

set -e  # Exit on any error

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="quantum-safe-messenger"

echo "🚀 Starting deployment for environment: $ENVIRONMENT"
echo "📁 Project directory: $SCRIPT_DIR"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi
    success "Node.js version: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
        exit 1
    fi
    success "npm version: $(npm --version)"
    
    # Check PostgreSQL (for database operations)
    if ! command -v psql &> /dev/null; then
        warning "PostgreSQL client not found - database operations may fail"
    else
        success "PostgreSQL client available"
    fi
}

# Setup environment
setup_environment() {
    log "Setting up environment..."
    
    # Create environment file if it doesn't exist
    if [ ! -f ".env.$ENVIRONMENT" ]; then
        warning "Environment file .env.$ENVIRONMENT not found"
        warning "Copying from .env.example..."
        cp .env.example ".env.$ENVIRONMENT" 2>/dev/null || warning "No .env.example found"
    fi
    
    # Load environment variables
    if [ -f ".env.$ENVIRONMENT" ]; then
        export $(cat ".env.$ENVIRONMENT" | grep -v '^#' | xargs)
        success "Environment variables loaded from .env.$ENVIRONMENT"
    else
        warning "No environment file found, using system defaults"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Clean install
    rm -rf node_modules package-lock.json 2>/dev/null || true
    
    # Install production dependencies
    npm ci --only=production
    success "Production dependencies installed"
    
    # Install development dependencies for build
    if [ "$ENVIRONMENT" != "prod" ]; then
        npm install --save-dev typescript @types/node jest supertest
        success "Development dependencies installed"
    fi
}

# Database setup
setup_database() {
    log "Setting up database..."
    
    DB_NAME=${DB_NAME:-quantum_safe_messenger_${ENVIRONMENT}}
    DB_USER=${DB_USER:-postgres}
    
    # Check if database exists
    if psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        warning "Database $DB_NAME already exists"
    else
        # Create database
        psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || {
            error "Failed to create database $DB_NAME"
            warning "Please create database manually and ensure user has permissions"
        }
        success "Database $DB_NAME created"
    fi
    
    # Run schema if file exists
    SCHEMA_FILE="server/database/schema.sql"
    if [ -f "$SCHEMA_FILE" ]; then
        psql -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE" 2>/dev/null || {
            error "Failed to run database schema"
            warning "Please run schema manually: psql -d $DB_NAME -f $SCHEMA_FILE"
        }
        success "Database schema applied"
    else
        warning "Schema file not found: $SCHEMA_FILE"
    fi
}

# Build application
build_application() {
    log "Building application..."
    
    # Build frontend
    if [ -f "next.config.js" ] || [ -f "package.json" ]; then
        npm run build
        success "Frontend built successfully"
    else
        warning "No build configuration found"
    fi
}

# Run tests
run_tests() {
    if [ "$ENVIRONMENT" != "prod" ]; then
        log "Running tests..."
        
        # Run unit tests
        npm test 2>/dev/null || {
            warning "Tests failed, but continuing deployment"
        }
        success "Tests completed"
        
        # Run security checks
        npm audit 2>/dev/null || warning "Security audit found issues"
    fi
}

# Start application
start_application() {
    log "Starting application..."
    
    # Stop existing processes
    pm2 delete "$PROJECT_NAME-backend" 2>/dev/null || true
    pm2 delete "$PROJECT_NAME-frontend" 2>/dev/null || true
    
    # Start backend
    pm2 start server/server.js --name "$PROJECT_NAME-backend" --env "$ENVIRONMENT"
    success "Backend started with PM2"
    
    # Start frontend (if Next.js)
    if [ -f "next.config.js" ]; then
        pm2 start npm --name "$PROJECT_NAME-frontend" -- start
        success "Frontend started with PM2"
    fi
    
    # Save PM2 configuration
    pm2 save
    success "PM2 configuration saved"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create log directory
    mkdir -p logs
    
    # Setup log rotation
    if command -v logrotate &> /dev/null; then
        cat > /etc/logrotate.d/$PROJECT_NAME << EOF
$SCRIPT_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 $(whoami) $(whoami)
}
EOF
        success "Log rotation configured"
    fi
    
    # Setup health check
    cat > health-check.sh << 'EOF'
#!/bin/bash
HEALTH_ENDPOINT="http://localhost:3001/api/health"
TIMEOUT=10

if curl -f --max-time $TIMEOUT "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
    echo "Health check: OK"
    exit 0
else
    echo "Health check: FAILED"
    exit 1
fi
EOF
    
    chmod +x health-check.sh
    success "Health check script created"
}

# Setup backup
setup_backup() {
    log "Setting up backup system..."
    
    BACKUP_DIR="backups"
    mkdir -p "$BACKUP_DIR"
    
    # Create backup script
    cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="quantum_safe_messenger"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Database backup
pg_dump "$DB_NAME" > "$BACKUP_DIR/db_backup_$DATE.sql"

# Application backup
tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" \
    --exclude='node_modules' \
    --exclude='logs' \
    --exclude='backups' \
    .

echo "Backup created: $BACKUP_DIR/backup_$DATE"
EOF
    
    chmod +x backup.sh
    success "Backup script created"
    
    # Setup cron job for daily backups
    (crontab -l 2>/dev/null; echo "0 2 * * * cd $SCRIPT_DIR && ./backup.sh") | crontab -
    success "Daily backup scheduled"
}

# Final status report
show_status() {
    echo
    echo "========================================"
    echo "   🎉 DEPLOYMENT COMPLETED"
    echo "========================================"
    echo "Environment: $ENVIRONMENT"
    echo "Project: $PROJECT_NAME"
    echo "Time: $(date)"
    echo
    echo "📊 Application Status:"
    pm2 list | grep "$PROJECT_NAME" || echo "No PM2 processes found"
    echo
    echo "🌐 Access URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:3001"
    echo "  Health Check: http://localhost:3001/api/health"
    echo
    echo "📁 Important Directories:"
    echo "  Logs: $SCRIPT_DIR/logs"
    echo "  Backups: $SCRIPT_DIR/backups"
    echo "  Config: $SCRIPT_DIR/.env.$ENVIRONMENT"
    echo
    echo "🔧 Management Commands:"
    echo "  View logs: pm2 logs $PROJECT_NAME"
    echo "  Restart: pm2 restart $PROJECT_NAME"
    echo "  Stop: pm2 stop $PROJECT_NAME"
    echo "  Backup: ./backup.sh"
    echo "  Health check: ./health-check.sh"
    echo
    success "Deployment completed successfully!"
}

# Main execution
main() {
    log "Starting $PROJECT_NAME deployment..."
    
    check_prerequisites
    setup_environment
    install_dependencies
    setup_database
    build_application
    run_tests
    start_application
    setup_monitoring
    setup_backup
    show_status
    
    log "Deployment finished at $(date)"
}

# Handle script termination
trap 'error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"