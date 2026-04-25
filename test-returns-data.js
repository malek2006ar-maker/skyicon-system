// ========================================
// بيانات اختبار للمرتجعات والمردودات
// Test Data for Returns & Refunds System
// ========================================

console.log('🧪 بدء إنشاء بيانات اختبار للمرتجعات...');

function createTestReturnsData() {
    // 1. إنشاء عملاء تجريبيين
    const testCustomers = [
        {
            id: 'cust-test-001',
            name: 'أحمد محمد علي',
            phone: '777123456',
            email: 'ahmed@example.com',
            address: 'صنعاء - شارع الزبيري',
            created_at: new Date().toISOString()
        },
        {
            id: 'cust-test-002',
            name: 'فاطمة حسن',
            phone: '773234567',
            email: 'fatima@example.com',
            address: 'عدن - المعلا',
            created_at: new Date().toISOString()
        }
    ];
    
    // 2. إنشاء موردين تجريبيين
    const testSuppliers = [
        {
            id: 'supp-test-001',
            name: 'شركة التوريدات العالمية',
            phone: '777345678',
            email: 'global@supply.com',
            address: 'صنعاء - شارع حده',
            created_at: new Date().toISOString()
        },
        {
            id: 'supp-test-002',
            name: 'مؤسسة الخليج التجارية',
            phone: '773456789',
            email: 'gulf@trading.com',
            address: 'تعز - صالة',
            created_at: new Date().toISOString()
        }
    ];
    
    // 3. إنشاء فواتير مبيعات تجريبية
    const testSalesInvoices = [
        {
            id: 'inv-sales-001',
            number: 'INV-2026-00001',
            type: 'sales',
            date: '2026-04-15',
            customer_id: 'cust-test-001',
            customer_name: 'أحمد محمد علي',
            currency: 'USD',
            items: [
                {
                    description: 'تذكرة سفر صنعاء - القاهرة',
                    quantity: 2,
                    price: 350.00,
                    total: 700.00
                },
                {
                    description: 'حجز فندقي - 3 ليالي',
                    quantity: 1,
                    price: 450.00,
                    total: 450.00
                }
            ],
            subtotal: 1150.00,
            tax: 0,
            discount: 0,
            total: 1150.00,
            payment_status: 'paid',
            notes: 'فاتورة مبيعات تجريبية',
            created_at: new Date('2026-04-15').toISOString()
        },
        {
            id: 'inv-sales-002',
            number: 'INV-2026-00002',
            type: 'sales',
            date: '2026-04-18',
            customer_id: 'cust-test-002',
            customer_name: 'فاطمة حسن',
            currency: 'SAR',
            items: [
                {
                    description: 'تأشيرة عمرة',
                    quantity: 4,
                    price: 800.00,
                    total: 3200.00
                },
                {
                    description: 'خدمات النقل الداخلي',
                    quantity: 1,
                    price: 600.00,
                    total: 600.00
                }
            ],
            subtotal: 3800.00,
            tax: 0,
            discount: 200.00,
            total: 3600.00,
            payment_status: 'partial',
            notes: 'حزمة عمرة متكاملة',
            created_at: new Date('2026-04-18').toISOString()
        }
    ];
    
    // 4. إنشاء فواتير مشتريات تجريبية
    const testPurchaseInvoices = [
        {
            id: 'inv-purch-001',
            number: 'PINV-2026-00001',
            type: 'purchase',
            date: '2026-04-10',
            supplier_id: 'supp-test-001',
            supplier_name: 'شركة التوريدات العالمية',
            currency: 'USD',
            items: [
                {
                    description: 'تذاكر طيران بالجملة',
                    quantity: 20,
                    price: 280.00,
                    total: 5600.00
                }
            ],
            subtotal: 5600.00,
            tax: 0,
            discount: 0,
            total: 5600.00,
            payment_status: 'unpaid',
            notes: 'شراء تذاكر بالجملة',
            created_at: new Date('2026-04-10').toISOString()
        },
        {
            id: 'inv-purch-002',
            number: 'PINV-2026-00002',
            type: 'purchase',
            date: '2026-04-12',
            supplier_id: 'supp-test-002',
            supplier_name: 'مؤسسة الخليج التجارية',
            currency: 'YER',
            items: [
                {
                    description: 'خدمات فندقية',
                    quantity: 10,
                    price: 50000.00,
                    total: 500000.00
                }
            ],
            subtotal: 500000.00,
            tax: 0,
            discount: 0,
            total: 500000.00,
            payment_status: 'partial',
            notes: 'حجوزات فندقية مسبقة',
            created_at: new Date('2026-04-12').toISOString()
        }
    ];
    
    // حفظ البيانات
    try {
        // إضافة العملاء فقط إذا لم يكونوا موجودين
        const existingCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
        const newCustomers = testCustomers.filter(tc => 
            !existingCustomers.find(ec => ec.id === tc.id)
        );
        if (newCustomers.length > 0) {
            localStorage.setItem('customers', JSON.stringify([...existingCustomers, ...newCustomers]));
            console.log(`✅ تم إضافة ${newCustomers.length} عميل تجريبي`);
        }
        
        // إضافة الموردين
        const existingSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
        const newSuppliers = testSuppliers.filter(ts => 
            !existingSuppliers.find(es => es.id === ts.id)
        );
        if (newSuppliers.length > 0) {
            localStorage.setItem('suppliers', JSON.stringify([...existingSuppliers, ...newSuppliers]));
            console.log(`✅ تم إضافة ${newSuppliers.length} مورد تجريبي`);
        }
        
        // إضافة فواتير المبيعات
        const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        const allTestInvoices = [...testSalesInvoices, ...testPurchaseInvoices];
        const newInvoices = allTestInvoices.filter(ti => 
            !existingInvoices.find(ei => ei.id === ti.id)
        );
        if (newInvoices.length > 0) {
            localStorage.setItem('invoices', JSON.stringify([...existingInvoices, ...newInvoices]));
            console.log(`✅ تم إضافة ${newInvoices.length} فاتورة تجريبية`);
        }
        
        console.log('✅ تم إنشاء جميع بيانات الاختبار بنجاح!');
        console.log('📊 الآن يمكنك:');
        console.log('   1. الذهاب إلى قسم المرتجعات والمردودات');
        console.log('   2. الضغط على "مرتجع مبيعات" أو "مردود مشتريات"');
        console.log('   3. اختيار فاتورة من القائمة');
        console.log('   4. حفظ المرتجع');
        
        return true;
    } catch (error) {
        console.error('❌ خطأ في إنشاء بيانات الاختبار:', error);
        return false;
    }
}

// تشغيل تلقائي عند التحميل
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createTestReturnsData);
} else {
    createTestReturnsData();
}

// جعل الدالة متاحة عالمياً
window.createTestReturnsData = createTestReturnsData;

console.log('✅ ملف بيانات اختبار المرتجعات جاهز');
console.log('💡 للإضافة يدوياً: createTestReturnsData()');
