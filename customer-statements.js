// ========================================
// كشوفات حسابات العملاء
// ========================================

function loadCustomerStatements() {
    const content = document.getElementById('content');
    const customers = getData('customers') || [];
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-file-invoice-dollar"></i> كشوفات حسابات العملاء</h3>
            </div>
            <div style="padding: 20px;">
                <div class="search-panel" style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h4><i class="fas fa-search"></i> البحث عن عميل</h4>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label>البحث</label>
                            <input type="text" id="customerSearchInput" class="form-control" 
                                   placeholder="اسم العميل، الرقم، أو الجوال..."
                                   oninput="searchCustomerForStatement(this.value)">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>أو اختر</label>
                            <select id="customerSelectStatement" class="form-control" onchange="selectCustomerForStatement(this.value)">
                                <option value="">-- اختر عميل --</option>
                                ${customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div id="customerSearchResults"></div>
                </div>
                <div id="statementArea"></div>
            </div>
        </div>
    `;
}

function searchCustomerForStatement(query) {
    if (!query || query.length < 2) {
        document.getElementById('customerSearchResults').innerHTML = '';
        return;
    }
    
    const customers = getData('customers') || [];
    const results = customers.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.customer_id && c.customer_id.toLowerCase().includes(query.toLowerCase())) ||
        (c.phone && c.phone.includes(query))
    );
    
    document.getElementById('customerSearchResults').innerHTML = results.length === 0 ? 
        '<div class="alert alert-warning">لم يتم العثور على عملاء</div>' :
        `<div style="background: white; padding: 10px; border-radius: 8px;">
            <h5><i class="fas fa-check-circle"></i> ${results.length} عميل</h5>
            ${results.map(c => `
                <div onclick="viewCustomerStatement('${c.id}')" style="padding: 10px; background: #f9f9f9; 
                     margin: 5px 0; cursor: pointer; border-radius: 4px;">
                    <strong>${c.name}</strong> - ${c.phone || 'لا يوجد'}
                </div>
            `).join('')}
        </div>`;
}

function selectCustomerForStatement(id) {
    if (id) viewCustomerStatement(id);
}

function viewCustomerStatement(customerId, currency = null) {
    const customer = findItem('customers', customerId);
    if (!customer) return showAlert('العميل غير موجود', 'error');
    
    const transactions = getCustomerTransactions(customerId);
    const filteredTransactions = currency ? transactions.filter(t => t.currency === currency) : transactions;
    const balances = calculateBalances(filteredTransactions);
    
    document.getElementById('statementArea').innerHTML = generateStatementHTML(customer, filteredTransactions, balances, 'customer', currency);
}

function getCustomerTransactions(customerId) {
    const invoices = (getData('invoices') || []).filter(i => i.customer_id === customerId && i.type === 'sales');
    const vouchers = (getData('vouchers') || []).filter(v => v.reference_type === 'customer' && v.reference_id === customerId);
    const bookings = (getData('bookings') || []).filter(b => b.customer_id === customerId);
    const journals = (getData('journal_entries') || []);
    
    const trans = [];
    
    // الفواتير
    invoices.forEach(i => trans.push({
        date: i.date, type: 'invoice', number: i.number,
        description: `فاتورة ${i.number}`, currency: i.currency,
        debit: i.total, credit: 0
    }));
    
    // السندات
    vouchers.forEach(v => {
        if (v.type === 'receipt') trans.push({
            date: v.date, type: 'voucher', number: v.number,
            description: `سند قبض ${v.number}`, currency: v.currency,
            debit: 0, credit: v.amount
        });
        else if (v.type === 'payment') trans.push({
            date: v.date, type: 'voucher', number: v.number,
            description: `سند صرف ${v.number}`, currency: v.currency,
            debit: v.amount, credit: 0
        });
    });
    
    // الحجوزات
    bookings.forEach(b => trans.push({
        date: b.date, type: 'booking', number: b.booking_number,
        description: `حجز ${b.booking_number}`, currency: b.currency,
        debit: b.amount, credit: b.paid
    }));

    // القيود المحاسبية اليدوية
    journals.forEach(je => {
        if (je.items && je.items.length > 0) {
            je.items.forEach(item => {
                // التحقق من أن القيد يخص هذا العميل (بناءً على الاسم أو الحساب)
                // في هذا النظام، يتم تخزين اسم العميل أو المورد في الملاحظات أو ربطه بالحساب
                // سنقوم بالتحقق من وجود الحسابات المتعلقة بالعملاء (112 أو 1131)
                if ((item.account_id === '112' || item.account_id === '1131') && item.party_id === customerId) {
                    trans.push({
                        date: je.date,
                        type: 'journal',
                        number: je.number,
                        description: je.description + (item.description ? ` - ${item.description}` : ''),
                        currency: je.currency || 'YER',
                        debit: parseFloat(item.debit) || 0,
                        credit: parseFloat(item.credit) || 0
                    });
                }
            });
        }
    });
    
    return trans.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function calculateBalances(transactions) {
    const bal = { YER: 0, SAR: 0, USD: 0 };
    transactions.forEach(t => {
        const curr = t.currency || 'USD';
        if (!bal[curr]) bal[curr] = 0;
        bal[curr] += (t.debit - t.credit);
    });
    return bal;
}

function generateStatementHTML(party, transactions, balances, type, selectedCurrency = null) {
    const isCustomer = type === 'customer';
    const color = isCustomer ? '#2196f3' : '#ff9800';
    const title = isCustomer ? 'كشف حساب عميل' : 'كشف حساب مورد';
    
    return `
        <div id="${type}StatementPrint">
            ${generateDocumentHeader(title)}
            
            <div style="background: white; padding: 20px; border: 2px solid #e0e0e0; margin-bottom: 20px;">
                <strong>الاسم:</strong> ${party.name}<br>
                <strong>الرقم:</strong> ${party.customer_id || party.supplier_id || '-'}<br>
                <strong>الجوال:</strong> ${party.phone || '-'}<br>
                <strong>التاريخ:</strong> ${formatDate(new Date().toISOString().split('T')[0])}
            </div>
            
            <!-- فلتر العملة -->
            <div class="no-print" style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                <label style="font-weight: bold; margin-left: 10px;">تصفية حسب العملة:</label>
                <select id="currencyFilter" onchange="view${isCustomer ? 'Customer' : 'Supplier'}Statement('${party.id}', this.value || null)" style="padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                    <option value="">كل العملات</option>
                    <option value="USD" ${selectedCurrency === 'USD' ? 'selected' : ''}>دولار أمريكي (USD)</option>
                    <option value="YER" ${selectedCurrency === 'YER' ? 'selected' : ''}>ريال يمني (YER)</option>
                    <option value="SAR" ${selectedCurrency === 'SAR' ? 'selected' : ''}>ريال سعودي (SAR)</option>
                </select>
            </div>
            
            <table class="table">
                <thead style="background: ${color}; color: white;">
                    <tr>
                        <th>التاريخ</th>
                        <th>البيان</th>
                        <th>العملة</th>
                        <th>مدين</th>
                        <th>دائن</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.length === 0 ? '<tr><td colspan="5" style="text-align: center;">لا توجد معاملات</td></tr>' :
                      transactions.map(t => `
                        <tr>
                            <td>${formatDate(t.date)}</td>
                            <td>${t.description}</td>
                            <td>${t.currency}</td>
                            <td style="color: #f44336;">${t.debit > 0 ? formatCurrency(t.debit, t.currency) : '-'}</td>
                            <td style="color: #4caf50;">${t.credit > 0 ? formatCurrency(t.credit, t.currency) : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
                <h3>الأرصدة النهائية</h3>
                ${Object.keys(balances).map(curr => {
                    const bal = balances[curr];
                    if (bal === 0) return '';
                    return `<div style="padding: 15px; background: white; margin: 10px 0; border-radius: 8px; border-right: 4px solid ${bal > 0 ? '#f44336' : '#4caf50'};">
                        <div style="font-size: 18px; margin-bottom: 10px;">
                            <strong>${curr}:</strong> <span style="font-size: 24px; color: ${bal > 0 ? '#f44336' : '#4caf50'};">${formatCurrency(Math.abs(bal), curr)}</span>
                            <span style="margin-right: 10px;">${bal > 0 ? '(عليه - مدين)' : (bal < 0 ? '(له - دائن)' : '')}</span>
                        </div>
                        <div style="font-size: 14px; font-weight: bold; color: #555; margin-top: 10px; border-top: 1px dashed #ddd; padding-top: 10px;">
                            المبلغ بالحروف: ${numberToArabicWords(Math.abs(bal), curr)}
                        </div>
                    </div>`;
                }).join('')}
            </div>
            
            ${generateDocumentFooter()}
            
            <div style="margin-top: 20px; text-align: center;" class="no-print">
                <button class="btn btn-primary" onclick="print${isCustomer ? 'Customer' : 'Supplier'}Statement()">
                    <i class="fas fa-print"></i> طباعة
                </button>
                <button class="btn btn-secondary" onclick="load${isCustomer ? 'Customer' : 'Supplier'}Statements()">
                    رجوع
                </button>
            </div>
        </div>
    `;
}

function printCustomerStatement() {
    const content = document.getElementById('customerStatementPrint').innerHTML;
    // فتح نافذة جديدة بحجم مناسب
    const win = window.open('', '', 'width=900,height=800');
    
    win.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>كشف حساب عميل</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body { 
                    font-family: 'Cairo', sans-serif; 
                    direction: rtl;
                    margin: 30px;
                    background: white;
                }
                .no-print { display: none; }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px;
                }
                th, td { 
                    padding: 10px; 
                    border: 1px solid #ddd; 
                    text-align: right; 
                    font-size: 13px;
                }
                th {
                    background-color: #004d40 !important;
                    color: white !important;
                    -webkit-print-color-adjust: exact;
                }
                .header-info { margin-bottom: 20px; }
                @media print {
                    body { margin: 0; padding: 15mm; }
                    .no-print { display: none !important; }
                    button { display: none !important; }
                }
            </style>
        </head>
        <body>
            ${content}
            <div style="margin-top: 30px; text-align: center;" class="no-print">
                <button onclick="window.print()" style="padding: 10px 20px; background: #004d40; color: white; border: none; border-radius: 5px; cursor: pointer; font-family: 'Cairo', sans-serif;">
                    تأكيد الطباعة
                </button>
            </div>
        </body>
        </html>
    `);
    
    win.document.close();
    
    // الانتظار قليلاً لضمان تحميل الخطوط والصور
    setTimeout(() => {
        win.focus();
        // لا نقوم بالإغلاق التلقائي للسماح للمستخدم برؤية المعاينة
    }, 500);
}

window.loadCustomerStatements = loadCustomerStatements;
window.searchCustomerForStatement = searchCustomerForStatement;
window.selectCustomerForStatement = selectCustomerForStatement;
window.viewCustomerStatement = viewCustomerStatement;
window.printCustomerStatement = printCustomerStatement;

console.log('✓ كشوفات حسابات العملاء جاهزة');
