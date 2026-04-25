#!/bin/bash

###############################################################################
# Sky Icon Travel & Tourism System - Automated Deployment Script
# النشر التلقائي لنظام سكاي آيكون
# Domain: skyicon.matrxe.com
# Version: 5.3.5
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="skyicon.matrxe.com"
PROJECT_DIR="/var/www/${DOMAIN}"
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"
LOG_FILE="/var/log/skyicon-deploy.log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        error "Please run as root (use sudo)"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    apt update
    apt install -y nginx
    
    log "Dependencies installed successfully"
}

# Create project directory
create_project_dir() {
    log "Creating project directory..."
    
    if [ -d "$PROJECT_DIR" ]; then
        warning "Project directory already exists. Backing up..."
        mv "$PROJECT_DIR" "${PROJECT_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    mkdir -p "$PROJECT_DIR"
    mkdir -p "$PROJECT_DIR/css"
    mkdir -p "$PROJECT_DIR/js"
    mkdir -p "$PROJECT_DIR/images"
    
    log "Project directory created: $PROJECT_DIR"
}

# Copy files
copy_files() {
    log "Copying project files..."
    
    # Copy all files from current directory to project directory
    cp -r ./* "$PROJECT_DIR/" 2>/dev/null || true
    
    # Remove deployment script from project directory
    rm -f "$PROJECT_DIR/deploy.sh"
    
    log "Files copied successfully"
}

# Configure Nginx
configure_nginx() {
    log "Configuring Nginx..."
    
    # Create Nginx configuration
    cat > "$NGINX_CONF" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name skyicon.matrxe.com;
    
    root /var/www/skyicon.matrxe.com;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
    
    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Disable access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Disable access to backup files
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Access and error logs
    access_log /var/log/nginx/skyicon.matrxe.com.access.log;
    error_log /var/log/nginx/skyicon.matrxe.com.error.log;
}
EOF
    
    # Enable site
    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    nginx -t || error "Nginx configuration test failed"
    
    log "Nginx configured successfully"
}

# Set permissions
set_permissions() {
    log "Setting permissions..."
    
    chown -R www-data:www-data "$PROJECT_DIR"
    chmod -R 755 "$PROJECT_DIR"
    
    log "Permissions set successfully"
}

# Restart services
restart_services() {
    log "Restarting services..."
    
    systemctl restart nginx
    systemctl enable nginx
    
    log "Services restarted successfully"
}

# Setup SSL (optional)
setup_ssl() {
    info "Do you want to setup SSL with Let's Encrypt? (y/n)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        log "Setting up SSL..."
        
        apt install -y certbot python3-certbot-nginx
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@${DOMAIN}
        
        log "SSL configured successfully"
    else
        warning "Skipping SSL setup"
    fi
}

# Display summary
display_summary() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}✅ Deployment Completed Successfully!${NC}"
    echo "=========================================="
    echo ""
    echo -e "${BLUE}🌐 Website:${NC} http://${DOMAIN}"
    echo -e "${BLUE}📁 Project Directory:${NC} ${PROJECT_DIR}"
    echo -e "${BLUE}📝 Nginx Config:${NC} ${NGINX_CONF}"
    echo -e "${BLUE}📋 Log File:${NC} ${LOG_FILE}"
    echo ""
    echo "=========================================="
    echo -e "${YELLOW}🔑 Default Login Credentials:${NC}"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo ""
    echo -e "${RED}⚠️  IMPORTANT: Change the password immediately!${NC}"
    echo "=========================================="
    echo ""
    echo -e "${GREEN}Next Steps:${NC}"
    echo "1. Open http://${DOMAIN} in your browser"
    echo "2. Login with default credentials"
    echo "3. Change admin password immediately"
    echo "4. Configure system settings"
    echo "5. Add users and start using the system"
    echo ""
    echo "=========================================="
    echo -e "${BLUE}📚 Documentation:${NC}"
    echo "   - README.md"
    echo "   - DEPLOYMENT_PACKAGE_README.md"
    echo "   - USER_MANAGEMENT_GUIDE.md"
    echo "   - TROUBLESHOOTING.md"
    echo "=========================================="
    echo ""
}

# Main deployment process
main() {
    echo ""
    echo "=========================================="
    echo "  Sky Icon Travel & Tourism System"
    echo "  Automated Deployment Script"
    echo "  Version 5.3.5"
    echo "=========================================="
    echo ""
    
    check_root
    
    log "Starting deployment for ${DOMAIN}..."
    
    install_dependencies
    create_project_dir
    copy_files
    configure_nginx
    set_permissions
    restart_services
    
    # Optional SSL
    setup_ssl
    
    display_summary
    
    log "Deployment completed successfully!"
}

# Run main function
main "$@"
