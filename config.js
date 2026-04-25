/**
 * Sky Icon Accounting System - Configuration
 * Domain: skyicon.matrxe.com
 * Version: 5.3.6
 * Date: 19 March 2026
 */

const CONFIG = {
    // Domain Configuration
    domain: 'skyicon.matrxe.com',
    baseUrl: 'https://skyicon.matrxe.com',
    apiUrl: 'https://skyicon.matrxe.com/api',
    
    // Application Info
    appName: 'سكاي آيكون - النظام المحاسبي المتكامل',
    appNameEn: 'Sky Icon Accounting System',
    version: '5.3.6',
    
    // Company Info
    company: {
        name: 'سكاي آيكون للسفريات والسياحة',
        nameEn: 'Sky Icon Travel & Tourism',
        address: 'صنعاء - ذهبان - جوار سوق القات',
        addressEn: 'Sana\'a - Dhahaban - Near Qat Market',
        phones: [
            '+967 783 003 636',
            '+967 783 003 838',
            '+967 783 003 939'
        ],
        email: 'admin@skyicon.com',
        website: 'www.skyicon.com',
        logo: 'images/logo.png'
    },
    
    // Default Settings
    defaults: {
        language: 'ar',
        currency: 'USD',  // ← تغيير إلى دولار أمريكي
        theme: 'light',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
        timezone: 'Asia/Aden',
        pagination: {
            itemsPerPage: 10,
            maxPages: 10
        }
    },
    
    // Currency Settings
    currencies: {
        YER: {
            code: 'YER',
            name: 'ريال يمني',
            nameEn: 'Yemeni Rial',
            symbol: 'ر.ي',
            symbolEn: 'YER',
            decimals: 2,
            rate: 1
        },
        USD: {
            code: 'USD',
            name: 'دولار أمريكي',
            nameEn: 'US Dollar',
            symbol: '$',
            symbolEn: 'USD',
            decimals: 2,
            rate: 0.004
        },
        SAR: {
            code: 'SAR',
            name: 'ريال سعودي',
            nameEn: 'Saudi Riyal',
            symbol: 'ر.س',
            symbolEn: 'SAR',
            decimals: 2,
            rate: 0.015
        }
    },
    
    // User Roles
    roles: {
        admin: {
            label: 'مدير النظام',
            labelEn: 'System Administrator',
            permissions: ['all']
        },
        manager: {
            label: 'مدير',
            labelEn: 'Manager',
            permissions: ['view_all', 'edit_all', 'reports', 'manage_bookings', 'manage_invoices']
        },
        accountant: {
            label: 'محاسب',
            labelEn: 'Accountant',
            permissions: ['view_financial', 'edit_financial', 'reports', 'manage_invoices', 'manage_vouchers']
        },
        employee: {
            label: 'موظف',
            labelEn: 'Employee',
            permissions: ['view_bookings', 'edit_bookings', 'view_customers']
        },
        viewer: {
            label: 'مشاهد',
            labelEn: 'Viewer',
            permissions: ['view_only']
        }
    },
    
    // Storage Keys
    storageKeys: {
        users: 'users',
        currentUser: 'currentUser',
        currentSession: 'currentSession',
        accounts: 'accounts',
        invoices: 'invoices',
        vouchers: 'vouchers',
        journalEntries: 'journalEntries',
        customers: 'customers',
        suppliers: 'suppliers',
        bookings: 'bookings',
        passports: 'passports',
        companyInfo: 'companyInfo',
        settings: 'settings'
    },
    
    // Security Settings
    security: {
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        rememberMeTimeout: 30 * 24 * 60 * 60 * 1000, // 30 days
        passwordMinLength: 6,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutes
    },
    
    // Backup Settings
    backup: {
        autoBackup: true,
        backupInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxBackups: 10,
        includeKeys: [
            'users',
            'accounts',
            'invoices',
            'vouchers',
            'journalEntries',
            'customers',
            'suppliers',
            'bookings',
            'passports',
            'companyInfo'
        ]
    },
    
    // Notification Settings
    notifications: {
        enabled: true,
        duration: 5000, // 5 seconds
        position: 'top-right',
        types: {
            success: { icon: 'fa-check-circle', color: '#28a745' },
            error: { icon: 'fa-times-circle', color: '#dc3545' },
            warning: { icon: 'fa-exclamation-triangle', color: '#ffc107' },
            info: { icon: 'fa-info-circle', color: '#17a2b8' }
        }
    },
    
    // Feature Flags
    features: {
        multiCurrency: true,
        autoPosting: true,
        smartDescriptions: true,
        servicePricing: true,
        smartValidations: true,
        advancedSearch: true,
        userManagement: true,
        activityLog: true,
        backup: true,
        reports: true,
        print: true
    },
    
    // Environment
    env: 'production', // development, staging, production
    debug: false,
    
    // API Endpoints (for future use)
    api: {
        baseUrl: '/api',
        endpoints: {
            users: '/users',
            auth: '/auth',
            accounts: '/accounts',
            invoices: '/invoices',
            vouchers: '/vouchers',
            journal: '/journal',
            customers: '/customers',
            suppliers: '/suppliers',
            bookings: '/bookings',
            passports: '/passports',
            reports: '/reports'
        }
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Make available globally
window.CONFIG = CONFIG;

console.log('✅ تم تحميل إعدادات النظام - Domain:', CONFIG.domain);
