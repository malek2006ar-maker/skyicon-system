/**
 * تهيئة قاعدة البيانات الأولية - Sky Icon Travel & Tourism
 * Database Initialization Script
 * v5.3.6 - 19 March 2026
 */

// ==========================================
// تهيئة قاعدة البيانات الأولية
// ==========================================

function initializeDatabase(force = false) {
    console.log('🔄 بدء تهيئة قاعدة البيانات...');
    
    try {
        // 1. تهيئة المستخدمين الافتراضيين
        initializeUsers(force);
        
        // 2. تهيئة الإعدادات الافتراضية
        initializeSettings(force);
        
        // 3. تهيئة دليل الحسابات
        initializeAccounts(force);
        
        // 4. تهيئة العملات
        initializeCurrencies(force);
        
        console.log('✅ تم تهيئة قاعدة البيانات بنجاح');
        return true;
    } catch (error) {
        console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
        return false;
    }
}

// ==========================================
// تهيئة المستخدمين الافتراضيين
// ==========================================

function initializeUsers(force = false) {
    const existingUsers = localStorage.getItem('users');
    
    // إذا كان هناك مستخدمون وليس force، لا نفعل شيء
    if (existingUsers && !force) {
        console.log('ℹ️ المستخدمون موجودون بالفعل');
        return;
    }
    
    const defaultUsers = [
        {
            id: 'user_001',
            username: 'admin',
            password: 'YWRtaW4xMjM=',
            fullName: 'مدير النظام',
            email: 'admin@skyicon.com',
            phone: '+967 777 180 875',
            role: 'admin',
            department: 'الإدارة',
            status: 'active',
            joinDate: '2024-01-01',
            lastLogin: Date.now(),
            permissions: ['all'],
            createdAt: Date.now(),
            updatedAt: Date.now()
        },
        {
            id: 'user_002',
            username: 'accountant',
            password: 'YWRtaW4xMjM=',
            fullName: 'المحاسب الرئيسي',
            email: 'accountant@skyicon.com',
            phone: '+967 777 111 222',
            role: 'accountant',
            department: 'المحاسبة',
            status: 'active',
            joinDate: '2024-02-01',
            lastLogin: Date.now() - 86400000,
            permissions: ['view_financial', 'edit_financial', 'reports', 'manage_invoices', 'manage_vouchers'],
            createdAt: Date.now(),
            updatedAt: Date.now()
        },
        {
            id: 'user_003',
            username: 'employee',
            password: 'YWRtaW4xMjM=',
            fullName: 'موظف الحجوزات',
            email: 'employee@skyicon.com',
            phone: '+967 777 333 444',
            role: 'employee',
            department: 'الحجوزات',
            status: 'active',
            joinDate: '2024-03-01',
            lastLogin: Date.now() - 172800000,
            permissions: ['view_bookings', 'edit_bookings', 'view_customers'],
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
    ];
    
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    console.log('✅ تم إنشاء المستخدمين الافتراضيين:', defaultUsers.length);
}

// ==========================================
// تهيئة الإعدادات الافتراضية
// ==========================================

function initializeSettings(force = false) {
    const existingSettings = localStorage.getItem('companyInfo');
    
    if (existingSettings && !force) {
        console.log('ℹ️ الإعدادات موجودة بالفعل');
        return;
    }
    
    const defaultSettings = {
        companyName: 'سكاي آيكون للسفريات والسياحة',
        companyNameEn: 'Sky Icon Travel & Tourism',
        address: 'صنعاء - ذهبان',
        phone1: '+967 783 003 636',
        phone2: '+967 783 003 838',
        phone3: '+967 783 003 939',
        email: 'admin@skyicon.com',
        website: 'www.skyicon.com',
        taxNumber: '',
        commercialRecord: '',
        logo: '',
        defaultCurrency: 'USD',
        fiscalYearStart: '01-01',
        enableNotifications: true,
        enableBackup: true,
        language: 'ar',
        theme: 'light',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    localStorage.setItem('companyInfo', JSON.stringify(defaultSettings));
    console.log('✅ تم إنشاء الإعدادات الافتراضية');
}

// ==========================================
// تهيئة دليل الحسابات
// ==========================================

function initializeAccounts(force = false) {
    const existingAccounts = localStorage.getItem('accounts');
    
    if (existingAccounts && !force) {
        console.log('ℹ️ دليل الحسابات موجود بالفعل');
        return;
    }
    
    const defaultAccounts = [
        // الأصول
        {
            id: 'acc_1',
            code: '1',
            name: 'الأصول',
            nameEn: 'Assets',
            type: 'asset',
            category: 'main',
            parentId: null,
            level: 1,
            balance: 0,
            currency: 'USD',
            isActive: true
        },
        {
            id: 'acc_11',
            code: '11',
            name: 'الأصول المتداولة',
            nameEn: 'Current Assets',
            type: 'asset',
            category: 'sub',
            parentId: 'acc_1',
            level: 2,
            balance: 0,
            currency: 'USD',
            isActive: true
        },
        {
            id: 'acc_111',
            code: '111',
            name: 'النقدية والبنوك',
            nameEn: 'Cash and Banks',
            type: 'asset',
            category: 'detail',
            parentId: 'acc_11',
            level: 3,
            balance: 0,
            currency: 'USD',
            isActive: true
        },
        
        // الخصوم
        {
            id: 'acc_2',
            code: '2',
            name: 'الخصوم',
            nameEn: 'Liabilities',
            type: 'liability',
            category: 'main',
            parentId: null,
            level: 1,
            balance: 0,
            currency: 'USD',
            isActive: true
        },
        
        // حقوق الملكية
        {
            id: 'acc_3',
            code: '3',
            name: 'حقوق الملكية',
            nameEn: 'Equity',
            type: 'equity',
            category: 'main',
            parentId: null,
            level: 1,
            balance: 0,
            currency: 'USD',
            isActive: true
        },
        
        // الإيرادات
        {
            id: 'acc_4',
            code: '4',
            name: 'الإيرادات',
            nameEn: 'Revenue',
            type: 'revenue',
            category: 'main',
            parentId: null,
            level: 1,
            balance: 0,
            currency: 'USD',
            isActive: true
        },
        
        // المصروفات
        {
            id: 'acc_5',
            code: '5',
            name: 'المصروفات',
            nameEn: 'Expenses',
            type: 'expense',
            category: 'main',
            parentId: null,
            level: 1,
            balance: 0,
            currency: 'USD',
            isActive: true
        }
    ];
    
    localStorage.setItem('accounts', JSON.stringify(defaultAccounts));
    console.log('✅ تم إنشاء دليل الحسابات الافتراضي:', defaultAccounts.length);
}

// ==========================================
// تهيئة العملات
// ==========================================

function initializeCurrencies(force = false) {
    const existingCurrency = localStorage.getItem('defaultCurrency');
    
    if (existingCurrency && !force) {
        console.log('ℹ️ إعدادات العملة موجودة بالفعل');
        return;
    }
    
    localStorage.setItem('defaultCurrency', 'USD');
    console.log('✅ تم تعيين العملة الافتراضية: USD');
}

// ==========================================
// إعادة تعيين قاعدة البيانات بالكامل
// ==========================================

function resetDatabase() {
    console.log('⚠️ إعادة تعيين قاعدة البيانات...');
    
    const confirmReset = confirm(
        '⚠️ تحذير!\n\n' +
        'سيتم حذف جميع البيانات الحالية وإعادة إنشاء البيانات الافتراضية.\n\n' +
        'هل أنت متأكد من المتابعة؟'
    );
    
    if (!confirmReset) {
        console.log('ℹ️ تم إلغاء إعادة التعيين');
        return false;
    }
    
    try {
        // حذف جميع البيانات
        const keysToKeep = ['language', 'theme']; // احتفظ ببعض الإعدادات
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        console.log('✅ تم حذف البيانات القديمة');
        
        // إعادة تهيئة قاعدة البيانات
        initializeDatabase(true);
        
        alert(
            '✅ تم إعادة تعيين قاعدة البيانات بنجاح!\n\n' +
            'بيانات الدخول الافتراضية:\n' +
            '━━━━━━━━━━━━━━━━━━━━\n' +
            'اسم المستخدم: admin\n' +
            '��لمة المرور: admin123\n' +
            '━━━━━━━━━━━━━━━━━━━━\n\n' +
            'سيتم إعادة تحميل الصفحة الآن...'
        );
        
        // إعادة تحميل الصفحة
        setTimeout(() => {
            location.reload();
        }, 1000);
        
        return true;
    } catch (error) {
        console.error('❌ خطأ في إعادة التعيين:', error);
        alert('❌ حدث خطأ أثناء إعادة التعيين. يرجى المحاولة مرة أخرى.');
        return false;
    }
}

// ==========================================
// التحقق من صحة قاعدة البيانات
// ==========================================

function validateDatabase() {
    console.log('🔍 التحقق من صحة قاعدة البيانات...');
    
    const checks = {
        users: localStorage.getItem('users'),
        settings: localStorage.getItem('companyInfo'),
        accounts: localStorage.getItem('accounts'),
        currency: localStorage.getItem('defaultCurrency')
    };
    
    const results = {
        users: checks.users ? '✅' : '❌',
        settings: checks.settings ? '✅' : '❌',
        accounts: checks.accounts ? '✅' : '❌',
        currency: checks.currency ? '✅' : '❌'
    };
    
    console.table(results);
    
    const isValid = Object.values(checks).every(check => check !== null);
    
    if (!isValid) {
        console.warn('⚠️ قاعدة البيانات غير مكتملة. تشغيل التهيئة التلقائية...');
        initializeDatabase(false);
    } else {
        console.log('✅ قاعدة البيانات صحيحة');
    }
    
    return isValid;
}

// ==========================================
// التشغيل التلقائي عند تحميل الصفحة
// ==========================================

// تنفيذ التحقق التلقائي عند تحميل النظام
if (typeof window !== 'undefined') {
    // التحقق عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 بدء التحقق من قاعدة البيانات...');
        validateDatabase();
    });
}

// ==========================================
// تصدير الدوال للاستخدام العام
// ==========================================

window.initializeDatabase = initializeDatabase;
window.resetDatabase = resetDatabase;
window.validateDatabase = validateDatabase;
window.initializeUsers = initializeUsers;

console.log('✅ تم تحميل وحدة تهيئة قاعدة البيانات (db-init.js)');
