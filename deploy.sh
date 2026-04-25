#!/bin/bash

# سكريبت نشر نظام سكاي آيكون على Hostinger VPS
# Sky Icon Deployment Script for Hostinger VPS
# v5.3.5

echo "========================================="
echo "🚀 Sky Icon Deployment Script"
echo "========================================="
echo ""

# الألوان
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# دالة للطباعة بالألوان
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# التحقق من صلاحيات root
if [ "$EUID" -ne 0 ]; then 
    print_error "يرجى تشغيل هذا السكريبت بصلاحيات root"
    echo "استخدم: sudo ./deploy.sh"
    exit 1
fi

print_success "تم التحقق من صلاحيات root"

# المتغيرات
DOMAIN=""
EMAIL=""
PROJECT_PATH="/var/www/html/sky-icon"
BACKUP_PATH="/home/backups"

# طلب المعلومات
echo ""
echo "📝 أدخل المعلومات التالية:"
echo ""

read -p "🌐 اسم النطاق (مثال: example.com): " DOMAIN
read -p "📧 البريد الإلكتروني: " EMAIL

echo ""
print_warning "سيتم النشر على: $DOMAIN"
print_warning "مسار المشروع: $PROJECT_PATH"
echo ""

read -p "هل تريد المتابعة؟ (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    print_error "تم إلغاء النشر"
    exit 0
fi

echo ""
echo "========================================="
echo "🔧 بدء عملية النشر..."
echo "========================================="
echo ""

# 1. تحديث النظام
echo "1️⃣ تحديث النظام..."
apt update -y > /dev/null 2>&1
apt upgrade -y > /dev/null 2>&1
print_success "تم تحديث النظام"

# 2. تثبيت Apache
echo "2️⃣ التحقق من Apache..."
if ! command -v apache2 &> /dev/null; then
    apt install apache2 -y > /dev/null 2>&1
    print_success "تم تثبيت Apache"
else
    print_success "Apache مثبت مسبقاً"
fi

# 3. تفعيل Apache Modules
echo "3️⃣ تفعيل Apache Modules..."
a2enmod rewrite > /dev/null 2>&1
a2enmod headers > /dev/null 2>&1
a2enmod expires > /dev/null 2>&1
a2enmod deflate > /dev/null 2>&1
a2enmod ssl > /dev/null 2>&1
print_success "تم تفعيل Apache Modules"

# 4. إنشاء مجلد المشروع
echo "4️⃣ إنشاء مجلد المشروع..."
mkdir -p $PROJECT_PATH
print_success "تم إنشاء المجلد: $PROJECT_PATH"

# 5. نسخ الملفات
echo "5️⃣ نسخ ملفات المشروع..."
cp -r ./* $PROJECT_PATH/
print_success "تم نسخ الملفات"

# 6. ضبط الصلاحيات
echo "6️⃣ ضبط الصلاحيات..."
chown -R www-data:www-data $PROJECT_PATH
find $PROJECT_PATH -type d -exec chmod 755 {} \;
find $PROJECT_PATH -type f -exec chmod 644 {} \;
print_success "تم ضبط الصلاحيات"

# 7. إعداد Virtual Host
echo "7️⃣ إعداد Virtual Host..."
cat > /etc/apache2/sites-available/sky-icon.conf << EOF
<VirtualHost *:80>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    DocumentRoot $PROJECT_PATH
    
    <Directory $PROJECT_PATH>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/sky-icon-error.log
    CustomLog \${APACHE_LOG_DIR}/sky-icon-access.log combined
</VirtualHost>
EOF

a2ensite sky-icon.conf > /dev/null 2>&1
a2dissite 000-default.conf > /dev/null 2>&1
systemctl reload apache2 > /dev/null 2>&1
print_success "تم إعداد Virtual Host"

# 8. تثبيت Certbot
echo "8️⃣ تثبيت Certbot لـ SSL..."
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-apache -y > /dev/null 2>&1
    print_success "تم تثبيت Certbot"
else
    print_success "Certbot مثبت مسبقاً"
fi

# 9. إصدار شهادة SSL
echo "9️⃣ إصدار شهادة SSL..."
print_warning "قد يستغرق هذا بعض الوقت..."
certbot --apache -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_success "تم إصدار شهادة SSL بنجاح"
else
    print_error "فشل إصدار شهادة SSL - يمكنك محاولة إصدارها يدوياً لاحقاً"
fi

# 10. تحديث sitemap.xml و robots.txt
echo "🔟 تحديث sitemap.xml و robots.txt..."
sed -i "s|https://yourdomain.com|https://$DOMAIN|g" $PROJECT_PATH/sitemap.xml
sed -i "s|https://yourdomain.com|https://$DOMAIN|g" $PROJECT_PATH/robots.txt
print_success "تم تحديث الملفات"

# 11. إعداد Firewall
echo "1️⃣1️⃣ إعداد Firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp > /dev/null 2>&1
    ufw allow 443/tcp > /dev/null 2>&1
    ufw allow 22/tcp > /dev/null 2>&1
    print_success "تم إعداد Firewall"
else
    print_warning "UFW غير مثبت - تخطي هذه الخطوة"
fi

# 12. إنشاء مجلد النسخ الاحتياطي
echo "1️⃣2️⃣ إعداد النسخ الاحتياطي..."
mkdir -p $BACKUP_PATH
chmod 700 $BACKUP_PATH
print_success "تم إنشاء مجلد النسخ الاحتياطي: $BACKUP_PATH"

# 13. إنشاء نسخة احتياطية أولية
echo "1️⃣3️⃣ إنشاء نسخة احتياطية أولية..."
tar -czf $BACKUP_PATH/sky-icon-initial-$(date +%Y%m%d-%H%M%S).tar.gz -C $PROJECT_PATH . > /dev/null 2>&1
print_success "تم إنشاء نسخة احتياطية"

# 14. إعادة تشغيل Apache
echo "1️⃣4️⃣ إعادة تشغيل Apache..."
systemctl restart apache2
print_success "تم إعادة تشغيل Apache"

echo ""
echo "========================================="
echo "✅ اكتمل النشر بنجاح!"
echo "========================================="
echo ""
echo "📊 معلومات النشر:"
echo "   🌐 النطاق: https://$DOMAIN"
echo "   📁 المسار: $PROJECT_PATH"
echo "   💾 النسخ الاحتياطي: $BACKUP_PATH"
echo ""
echo "🔑 بيانات تسجيل الدخول:"
echo "   👤 اسم المستخدم: admin"
echo "   🔒 كلمة المرور: admin123"
echo ""
echo "⚠️  تحذير: غيّر كلمة المرور فوراً بعد أول تسجيل دخول!"
echo ""
echo "🔗 لزيارة الموقع:"
echo "   https://$DOMAIN"
echo ""
echo "📝 السجلات:"
echo "   tail -f /var/log/apache2/sky-icon-error.log"
echo "   tail -f /var/log/apache2/sky-icon-access.log"
echo ""
echo "========================================="
echo "🎉 شكراً لاستخدام نظام سكاي آيكون!"
echo "========================================="
echo ""
