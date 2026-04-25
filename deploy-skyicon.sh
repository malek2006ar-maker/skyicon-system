#!/bin/bash

# ==========================================
# Sky Icon Accounting System - Deployment Script
# Domain: skyicon.matrxe.com
# Version: 5.3.6
# Date: 19 March 2026
# ==========================================

echo "🚀 بدء نشر نظام سكاي آيكون المحاسبي..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="skyicon.matrxe.com"
DEPLOY_DIR="/var/www/html/${DOMAIN}"
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"
BACKUP_DIR="/var/backups/skyicon"

# ==========================================
# 1. Check Prerequisites
# ==========================================

echo ""
echo "📋 1/8 - فحص المتطلبات الأساسية..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ يجب تشغيل هذا السكريبت بصلاحيات root${NC}"
    echo "استخدم: sudo bash deploy.sh"
    exit 1
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nginx غير مثبت. جاري التثبيت...${NC}"
    apt update
    apt install nginx -y
fi

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}⚠️  Certbot غير مثبت. جاري التثبيت...${NC}"
    apt install certbot python3-certbot-nginx -y
fi

echo -e "${GREEN}✅ جميع المتطلبات متوفرة${NC}"

# ==========================================
# 2. Create Backup
# ==========================================

echo ""
echo "💾 2/8 - إنشاء نسخة احتياطية..."

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Backup existing deployment if exists
if [ -d "${DEPLOY_DIR}" ]; then
    BACKUP_FILE="${BACKUP_DIR}/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf ${BACKUP_FILE} -C ${DEPLOY_DIR} .
    echo -e "${GREEN}✅ تم إنشاء نسخة احتياطية: ${BACKUP_FILE}${NC}"
else
    echo "ℹ️  لا توجد نسخة سابقة للنسخ الاحتياطي"
fi

# ==========================================
# 3. Create Deployment Directory
# ==========================================

echo ""
echo "📁 3/8 - إنشاء مجلد النشر..."

# Create deployment directory
mkdir -p ${DEPLOY_DIR}

# Set permissions
chown -R www-data:www-data ${DEPLOY_DIR}
chmod -R 755 ${DEPLOY_DIR}

echo -e "${GREEN}✅ تم إنشاء المجلد: ${DEPLOY_DIR}${NC}"

# ==========================================
# 4. Copy Files
# ==========================================

echo ""
echo "📦 4/8 - نسخ ملفات المشروع..."

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Copy all files except excluded
rsync -av --exclude='deploy.sh' \
         --exclude='*.md' \
         --exclude='.git' \
         --exclude='.gitignore' \
         --exclude='node_modules' \
         ${SCRIPT_DIR}/ ${DEPLOY_DIR}/

echo -e "${GREEN}✅ تم نسخ الملفات${NC}"

# ==========================================
# 5. Configure Nginx
# ==========================================

echo ""
echo "⚙️  5/8 - تكوين Nginx..."

# Copy Nginx configuration
if [ -f "${SCRIPT_DIR}/nginx-${DOMAIN}.conf" ]; then
    cp ${SCRIPT_DIR}/nginx-${DOMAIN}.conf ${NGINX_CONF}
    
    # Create symbolic link
    ln -sf ${NGINX_CONF} /etc/nginx/sites-enabled/${DOMAIN}
    
    # Remove default configuration if exists
    if [ -f "/etc/nginx/sites-enabled/default" ]; then
        rm /etc/nginx/sites-enabled/default
    fi
    
    # Test Nginx configuration
    if nginx -t 2>&1 | grep -q "successful"; then
        echo -e "${GREEN}✅ تكوين Nginx صحيح${NC}"
    else
        echo -e "${RED}❌ خطأ في تكوين Nginx${NC}"
        nginx -t
        exit 1
    fi
else
    echo -e "${RED}❌ ملف تكوين Nginx غير موجود${NC}"
    exit 1
fi

# ==========================================
# 6. SSL Certificate
# ==========================================

echo ""
echo "🔒 6/8 - الحصول على شهادة SSL..."

# Check if SSL certificate already exists
if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo "ℹ️  شهادة SSL موجودة بالفعل"
    echo "جاري التجديد..."
    certbot renew --nginx --quiet
else
    echo "جاري الحصول على شهادة SSL جديدة..."
    
    # Get SSL certificate
    certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos -m admin@skyicon.com
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ تم الحصول على شهادة SSL${NC}"
    else
        echo -e "${YELLOW}⚠️  فشل الحصول على شهادة SSL. سيتم استخدام HTTP فقط${NC}"
        # Comment out SSL lines in Nginx config
        sed -i 's/listen 443/# listen 443/g' ${NGINX_CONF}
        sed -i 's/ssl_/# ssl_/g' ${NGINX_CONF}
    fi
fi

# ==========================================
# 7. Reload Nginx
# ==========================================

echo ""
echo "🔄 7/8 - إعادة تحميل Nginx..."

systemctl reload nginx

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم إعادة تحميل Nginx${NC}"
else
    echo -e "${RED}❌ فشل إعادة تحميل Nginx${NC}"
    systemctl status nginx
    exit 1
fi

# ==========================================
# 8. Verify Deployment
# ==========================================

echo ""
echo "✅ 8/8 - التحقق من النشر..."

# Check if Nginx is running
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx يعمل بنجاح${NC}"
else
    echo -e "${RED}❌ Nginx غير نشط${NC}"
    exit 1
fi

# Check if site is accessible
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://${DOMAIN})
if [ "${HTTP_CODE}" == "200" ] || [ "${HTTP_CODE}" == "301" ] || [ "${HTTP_CODE}" == "302" ]; then
    echo -e "${GREEN}✅ الموقع يعمل بنجاح (HTTP ${HTTP_CODE})${NC}"
else
    echo -e "${YELLOW}⚠️  الموقع قد لا يكون متاحاً (HTTP ${HTTP_CODE})${NC}"
fi

# ==========================================
# Deployment Complete
# ==========================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 تم النشر بنجاح!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 معلومات النشر:"
echo "   الدومين: https://${DOMAIN}"
echo "   المجلد: ${DEPLOY_DIR}"
echo "   تكوين Nginx: ${NGINX_CONF}"
echo ""
echo "🔑 بيانات تسجيل الدخول الافتراضية:"
echo "   اسم المستخدم: admin"
echo "   كلمة المرور: admin123"
echo ""
echo "⚠️  تذكير: قم بتغيير كلمة المرور فوراً بعد أول تسجيل دخول!"
echo ""
echo "📞 للدعم الفني:"
echo "   الهواتف: 783003636 | 783003838 | 783003939"
echo "   البريد: admin@skyicon.com"
echo ""
echo "✅ النظام جاهز للاستخدام!"
echo ""
