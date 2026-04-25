// ========================================
// إدارة القيود اليومية - Journal Management
// ========================================

// تحميل القيود اليومية
function loadJournal() {
    let entries = getData('journal_entries') || [];
    const accounts = getData('accounts') || [];
    
    // تصفية حسب البحث والعملة
    const searchTerm = document.getElementById('searchJournal')?.value?.toLowerCase() || '';
    const selectedCurrency = document.getElementById('filterJournalCurrency')?.value || '';
    
    if (searchTerm) {
        entries = entries.filter(entry => 
            entry.number.toLowerCase().includes(searchTerm) ||
            entry.description.toLowerCase().includes(searchTerm) ||
            formatDate(entry.date).includes(searchTerm)
        );
    }
    
    if (selectedCurrency) {
        entries = entries.filter(entry => entry.currency === selectedCurrency);
    }
    
    // ترتيب حسب التاريخ (الأحدث أولاً)
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-book"></i>
                    دفتر القيود اليومية
                </h3>
                <button class="btn btn-primary" onclick="showJournalModal()">
                    <i class="fas fa-plus"></i>
                    قيد جديد
                </button>
            </div>
            
            <div class="card-body">
                <!-- البحث والتصفية -->
                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <div style="flex: 1;">
                        <input type="text" id="searchJournal" placeholder="البحث في القيود (رقم، وصف، تاريخ...)" class="form-input" onkeyup="loadJournal()">
                    </div>
                    <div style="width: 200px;">
                        <select id="filterJournalCurrency" class="form-input" onchange="loadJournal()">
                            <option value="">كل العملات</option>
                            <option value="USD">دولار (USD)</option>
                            <option value="YER">ريال يمني (YER)</option>
                            <option value="SAR">ريال سعودي (SAR)</option>
                        </select>
                    </div>
                </div>
                
                <table class="table">
                    <thead>
                        <tr>
                            <th>رقم القيد</th>
                            <th>التاريخ</th>
                            <th>البيان</th>
                            <th>العملة</th>
                            <th>إجمالي المدين</th>
                            <th>إجمالي الدائن</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>`;
    
    if (entries.length === 0) {
        html += `
                        <tr>
                            <td colspan="7" style="text-align: center; padding: 40px;">
                                <i class="fas fa-inbox" style="font-size: 48px; color: var(--border-color); margin-bottom: 15px; display: block;"></i>
                                <p style="color: var(--text-light);">لا توجد قيود محاسبية بعد. قم بإنشاء أول قيد.</p>
                            </td>
                        </tr>`;
    } else {
        entries.forEach(entry => {
            const totalDebit = entry.items ? entry.items.reduce((sum, item) => sum + item.debit, 0) : 0;
            const totalCredit = entry.items ? entry.items.reduce((sum, item) => sum + item.credit, 0) : 0;
            const currency = entry.currency || 'USD';
            
            html += `
                        <tr>
                            <td><strong>${entry.number}</strong></td>
                            <td>${formatDate(entry.date)}</td>
                            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${entry.description || '-'}</td>
                            <td><span class="badge">${CURRENCIES[currency]?.symbol || currency}</span></td>
                            <td>${formatCurrency(totalDebit, currency)}</td>
                            <td>${formatCurrency(totalCredit, currency)}</td>
                            <td>
                                <div class="action-btns">
                                    <button class="btn-icon" title="عرض" onclick="viewJournalEntry('${entry.id}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-icon" title="حذف" onclick="deleteJournalEntry('${entry.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>`;
        });
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('content').innerHTML = html;
}

// عرض نموذج إنشاء قيد جديد
function showJournalModal() {
    const nextNumber = generateEntryNumber();
    
    const modal = `
        <div class="modal" id="journalModal">
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3><i class="fas fa-book"></i> قيد محاسبي جديد</h3>
                    <button class="btn-close" onclick="closeModal('journalModal')">&times;</button>
                </div>
                <form id="journalForm" onsubmit="saveJournalEntry(event)">
                    <div class="modal-body">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>رقم القيد <span class="required">*</span></label>
                                <input type="text" id="entryNumber" value="${nextNumber}" readonly class="form-input">
                            </div>
                            <div class="form-group">
                                <label>التاريخ <span class="required">*</span></label>
                                <input type="date" id="entryDate" value="${new Date().toISOString().split('T')[0]}" required class="form-input">
                            </div>
                            <div class="form-group">
                                <label>العملة <span class="required">*</span></label>
                                <select id="entryCurrency" required class="form-input">
                                    <option value="USD" selected>دولار أمريكي (USD)</option>
                                    <option value="YER">ريال يمني (YER)</option>
                                    <option value="SAR">ريال سعودي (SAR)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>البيان</label>
                            <textarea id="entryDescription" rows="2" placeholder="وصف القيد المحاسبي..." class="form-input"></textarea>
                        </div>
                        
                        <div style="border-top: 2px solid var(--border-color); padding-top: 20px; margin-top: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h4>بنود القيد</h4>
                                <button type="button" class="btn btn-secondary" onclick="addJournalRow()">
                                    <i class="fas fa-plus"></i> إضافة بند
                                </button>
                            </div>
                            
                            <div id="journalRows" style="max-height: 400px; overflow-y: auto;"></div>
                            
                            <div style="margin-top: 20px; padding: 15px; background: var(--light-bg); border-radius: 8px;">
                                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                    <span>إجمالي المدين:</span>
                                    <span id="totalDebit" style="color: var(--danger-color);">0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px;">
                                    <span>إجمالي الدائن:</span>
                                    <span id="totalCredit" style="color: var(--success-color);">0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 2px solid var(--border-color);">
                                    <span>الفرق:</span>
                                    <span id="difference">0.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeModal('journalModal')">إلغاء</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> حفظ القيد
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    
    // إضافة صفين افتراضيين
    addJournalRow();
    addJournalRow();
}

let journalRowCounter = 0;

function addJournalRow() {
    journalRowCounter++;
    const accounts = getData('accounts') || [];
    
    const row = `
        <div class="journal-row" id="row${journalRowCounter}" style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; margin-bottom: 10px; padding: 10px; background: white; border: 1px solid var(--border-color); border-radius: 5px;">
            <select class="form-input" required onchange="updateTotals()">
                <option value="">اختر الحساب...</option>
                ${accounts.map(acc => `<option value="${acc.id}">${acc.code} - ${acc.name}</option>`).join('')}
            </select>
            <input type="number" step="0.01" min="0" placeholder="مدين" class="form-input debit-input" oninput="updateTotals()">
            <input type="number" step="0.01" min="0" placeholder="دائن" class="form-input credit-input" oninput="updateTotals()">
            <button type="button" class="btn btn-danger" onclick="removeJournalRow(${journalRowCounter})" title="حذف">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    document.getElementById('journalRows').insertAdjacentHTML('beforeend', row);
}

function removeJournalRow(rowId) {
    document.getElementById(`row${rowId}`).remove();
    updateTotals();
}

function updateTotals() {
    const currency = document.getElementById('entryCurrency').value || 'USD';
    const currencySymbol = CURRENCIES[currency]?.symbol || '$';
    
    let totalDebit = 0;
    let totalCredit = 0;
    
    document.querySelectorAll('.debit-input').forEach(input => {
        totalDebit += parseFloat(input.value) || 0;
    });
    
    document.querySelectorAll('.credit-input').forEach(input => {
        totalCredit += parseFloat(input.value) || 0;
    });
    
    const difference = Math.abs(totalDebit - totalCredit);
    
    document.getElementById('totalDebit').textContent = formatCurrency(totalDebit, currency);
    document.getElementById('totalCredit').textContent = formatCurrency(totalCredit, currency);
    document.getElementById('difference').textContent = formatCurrency(difference, currency);
    document.getElementById('difference').style.color = difference === 0 ? 'var(--success-color)' : 'var(--danger-color)';
}

function saveJournalEntry(event) {
    event.preventDefault();
    
    const number = document.getElementById('entryNumber').value;
    const date = document.getElementById('entryDate').value;
    const currency = document.getElementById('entryCurrency').value;
    const description = document.getElementById('entryDescription').value;
    
    const items = [];
    document.querySelectorAll('.journal-row').forEach(row => {
        const select = row.querySelector('select');
        const debitInput = row.querySelector('.debit-input');
        const creditInput = row.querySelector('.credit-input');
        
        const accountId = select.value;
        const debit = parseFloat(debitInput.value) || 0;
        const credit = parseFloat(creditInput.value) || 0;
        
        if (accountId && (debit > 0 || credit > 0)) {
            items.push({
                account_id: accountId,
                debit: debit,
                credit: credit
            });
        }
    });
    
    if (items.length < 2) {
        showAlert('يجب إضافة بندين على الأقل', 'error');
        return;
    }
    
    const totalDebit = items.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = items.reduce((sum, item) => sum + item.credit, 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        showAlert('القيد غير متوازن! يجب أن يتساوى المدين مع الدائن', 'error');
        return;
    }
    
    const entry = {
        id: generateId(),
        number: number,
        date: date,
        currency: currency,
        description: description,
        items: items,
        created_at: new Date().toISOString(),
        created_by: getCurrentUser().username
    };
    
    addItem('journal_entries', entry);
    closeModal('journalModal');
    showAlert('تم حفظ القيد بنجاح', 'success');
    loadJournal();
}

function generateEntryNumber() {
    const entries = getData('journal_entries') || [];
    const year = new Date().getFullYear();
    const count = entries.filter(e => e.number.startsWith(`JE-${year}`)).length + 1;
    return `JE-${year}-${String(count).padStart(5, '0')}`;
}

function viewJournalEntry(entryId) {
    const entry = findItem('journal_entries', entryId);
    if (!entry) return;
    
    const accounts = getData('accounts') || [];
    
    let html = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-book"></i>
                    تفاصيل القيد المحاسبي
                </h3>
                <button class="btn btn-secondary" onclick="loadJournal()">
                    <i class="fas fa-arrow-right"></i>
                    رجوع
                </button>
            </div>
            
            <div class="card-body">
                <div style="background: var(--light-bg); padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                        <div>
                            <strong style="color: var(--text-light);">رقم القيد:</strong>
                            <p style="font-size: 18px; font-weight: bold; color: var(--primary-color); margin-top: 5px;">${entry.number}</p>
                        </div>
                        <div>
                            <strong style="color: var(--text-light);">التاريخ:</strong>
                            <p style="font-size: 18px; margin-top: 5px;">${formatDate(entry.date)}</p>
                        </div>
                        <div>
                            <strong style="color: var(--text-light);">العملة:</strong>
                            <p style="font-size: 18px; margin-top: 5px;">${CURRENCIES[entry.currency || 'USD']?.name || 'دولار أمريكي'}</p>
                        </div>
                    </div>
                </div>
                
                <table class="table">
                    <thead>
                        <tr>
                            <th style="width: 40px;">م</th>
                            <th style="width: 120px;">رمز الحساب</th>
                            <th>اسم الحساب</th>
                            <th style="width: 150px;">مدين</th>
                            <th style="width: 150px;">دائن</th>
                        </tr>
                    </thead>
                    <tbody>`;
    
    entry.items.forEach((item, index) => {
        const accountId = item.account_id || item.accountId;
        const account = accounts.find(a => a.id === accountId || a.code === accountId);
        const accountName = account ? account.name : (accountId ? `حساب ${accountId}` : 'غير محدد');
        
        html += `
                        <tr>
                            <td>${index + 1}</td>
                            <td><strong>${account ? account.code : (accountId || '-')}</strong></td>
                            <td style="text-align: right;">${accountName}</td>
                            <td style="color: var(--danger-color); font-weight: bold;">${item.debit > 0 ? formatCurrency(item.debit, entry.currency || 'USD') : '-'}</td>
                            <td style="color: var(--success-color); font-weight: bold;">${item.credit > 0 ? formatCurrency(item.credit, entry.currency || 'USD') : '-'}</td>
                        </tr>`;
    });
    
    const totalDebit = entry.items.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = entry.items.reduce((sum, item) => sum + item.credit, 0);
    
    html += `
                        <tr style="background: var(--primary-color); color: white; font-weight: bold; font-size: 16px;">
                            <td colspan="3" style="text-align: center;">الإجمالي</td>
                            <td>${formatCurrency(totalDebit, entry.currency || 'USD')}</td>
                            <td>${formatCurrency(totalCredit, entry.currency || 'USD')}</td>
                        </tr>
                    </tbody>
                </table>
                
                <!-- التفقيط -->
                <div style="background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); padding: 18px; border-radius: 10px; margin: 25px 0; border-right: 4px solid #ff9800;">
                    <div style="font-size: 13px; color: #856404; margin-bottom: 8px; font-weight: 600;">
                        💬 إجمالي المدين/الدائن بالحروف:
                    </div>
                    <div style="font-size: 18px; font-weight: bold; color: #856404; line-height: 1.8; font-family: 'Cairo', 'Segoe UI', sans-serif;">
                        ${numberToArabicWords(entry.items.reduce((sum, item) => sum + item.debit, 0), entry.currency || 'USD')}
                    </div>
                </div>
                
                ${entry.description ? `
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-right: 4px solid #ffc107; margin: 20px 0; text-align: right; direction: rtl;">
                    <strong style="color: #856404; display: block; margin-bottom: 10px;">البيان:</strong>
                    <p style="line-height: 1.8; color: #1f2937; margin: 0; text-align: right;">${entry.description}</p>
                </div>
                ` : ''}
                
                <div style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="printJournalEntry('${entry.id}')">
                        <i class="fas fa-print"></i>
                        طباعة
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('content').innerHTML = html;
}

function printJournalEntry(entryId) {
    const entry = findItem('journal_entries', entryId);
    if (!entry) return;
    
    const accounts = getData('accounts') || [];
    
    // إنشاء نافذة طباعة جديدة
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    
    const totalDebit = entry.items.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = entry.items.reduce((sum, item) => sum + item.credit, 0);
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>قيد محاسبي - ${entry.number}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: white;
                    padding: 20px;
                    direction: rtl;
                }
                
                .entry-container {
                    max-width: 900px;
                    margin: 0 auto;
                    border: 2px solid #333;
                    background: white;
                }
                
                .company-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 30px;
                    border-bottom: 3px solid #f57c00;
                    background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%);
                }
                
                .company-header .ar-section {
                    flex: 1;
                    text-align: right;
                }
                
                .company-header .logo-section {
                    flex: 0 0 auto;
                    padding: 0 20px;
                }
                
                .company-header .en-section {
                    flex: 1;
                    text-align: left;
                    direction: ltr;
                }
                
                .company-name {
                    font-size: 18px;
                    color: #f57c00;
                    font-weight: 700;
                    margin-bottom: 5px;
                }
                
                .company-subtitle {
                    font-size: 12px;
                    color: #6b7280;
                    margin: 3px 0;
                }
                
                .entry-title {
                    padding: 15px;
                    background: #f57c00;
                    color: white;
                    text-align: center;
                    font-size: 22px;
                    font-weight: 700;
                }
                
                .entry-body {
                    padding: 30px;
                }
                
                .entry-header {
                    display: flex;
                    justify-content: space-between;
                    padding: 15px;
                    background: #f9fafb;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border: 1px solid #e5e7eb;
                }
                
                .entry-header > div {
                    text-align: center;
                }
                
                .entry-header strong {
                    color: #6b7280;
                    font-size: 13px;
                    display: block;
                    margin-bottom: 5px;
                }
                
                .entry-header span {
                    color: #1f2937;
                    font-size: 16px;
                    font-weight: 600;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                
                table th,
                table td {
                    padding: 12px;
                    border: 1px solid #e5e7eb;
                    text-align: center;
                }
                
                table th {
                    background: #004d40;
                    color: white;
                    font-weight: 600;
                }
                
                table tbody tr:nth-child(even) {
                    background: #f9fafb;
                }
                
                table tbody td:nth-child(3) {
                    text-align: right;
                    padding-right: 15px;
                }
                
                .total-row {
                    background: #e0f7fa !important;
                    font-weight: bold;
                    font-size: 16px;
                }
                
                .total-row td {
                    background: #004d40;
                    color: white;
                }
                
                .amount-words-container {
                    background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 30px 0;
                    border-right: 4px solid #ff9800;
                }
                
                .amount-words-label {
                    font-size: 13px;
                    color: #856404;
                    margin-bottom: 8px;
                    font-weight: 600;
                    text-align: center;
                }
                
                .amount-words-text {
                    font-size: 18px;
                    font-weight: bold;
                    color: #856404;
                    line-height: 1.8;
                    text-align: center;
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    font-family: 'Cairo', 'Segoe UI', sans-serif;
                }
                
                .description-box {
                    background: #fff3cd;
                    padding: 15px;
                    border-radius: 8px;
                    border-right: 4px solid #ffc107;
                    margin: 20px 0;
                    text-align: right;
                    direction: rtl;
                }
                
                .description-box strong {
                    color: #856404;
                    display: block;
                    margin-bottom: 10px;
                    text-align: right;
                }
                
                .description-box p {
                    line-height: 1.8;
                    color: #1f2937;
                    text-align: right;
                    direction: rtl;
                }
                
                .signatures {
                    margin-top: 50px;
                    display: flex;
                    justify-content: space-between;
                    gap: 40px;
                }
                
                .signature {
                    text-align: center;
                    flex: 1;
                }
                
                .signature-line {
                    border-top: 2px solid #1f2937;
                    padding-top: 10px;
                    margin-top: 40px;
                    font-weight: 600;
                }
                
                .company-footer {
                    padding: 15px;
                    background: #f9fafb;
                    border-top: 2px solid #e5e7eb;
                    text-align: center;
                    font-size: 12px;
                    color: #6b7280;
                }
                
                @media print {
                    body {
                        padding: 0;
                    }
                    
                    .entry-container {
                        border: none;
                    }
                    
                    @page {
                        margin: 1cm;
                    }
                }
            </style>
            <script>
                const CURRENCIES = {
                    'USD': { name: 'دولار أمريكي', symbol: '$', rate: 1 },
                    'YER': { name: 'ريال يمني', symbol: 'ر.ي', rate: 250 },
                    'SAR': { name: 'ريال سعودي', symbol: 'ر.س', rate: 0.27 }
                };
                
                const COMPANY_INFO = {
                    name: 'سكاي آيكون للسفريات والسياحة',
                    location: 'صنعاء - ذهبان - جوار سوق القات',
                    phones: {
                        office: ['+967 783 003 636', '+967 783 003 838', '+967 783 003 939']
                    },
                    logo: 'images/logo.png'
                };
                
                function formatCurrency(amount, currency = 'USD') {
                    const curr = CURRENCIES[currency] || CURRENCIES['USD'];
                    return curr.symbol + ' ' + Number(amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
                
                function formatDate(dateString) {
                    const date = new Date(dateString);
                    return date.toLocaleDateString('ar-YE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }
                
                function numberToArabicWords(num, currency = 'USD') {
                    if (isNaN(num) || num === null || num === undefined) {
                        return '';
                    }

                    const integerPart = Math.floor(Math.abs(num));
                    const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);
                    
                    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
                    const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
                    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثماني مائة', 'تسعمائة'];
                    const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];

                    function convertChunk(n) {
                        if (n === 0) return '';
                        
                        let result = '';
                        
                        if (n >= 100) {
                            result += hundreds[Math.floor(n / 100)];
                            n %= 100;
                            if (n > 0) result += ' و';
                        }
                        
                        if (n >= 11 && n <= 19) {
                            result += teens[n - 10];
                        } else if (n === 10) {
                            result += tens[1];
                        } else if (n > 0) {
                            if (n >= 20) {
                                result += tens[Math.floor(n / 10)];
                                n %= 10;
                                if (n > 0) result += ' و';
                            }
                            if (n > 0 && n < 10) {
                                result += ones[n];
                            }
                        }
                        
                        return result;
                    }
                    
                    function getCurrencyName(currency, amount) {
                        const currencies = {
                            'USD': {
                                main: amount === 1 ? 'دولار أمريكي' : amount === 2 ? 'دولاران أمريكيان' : amount <= 10 ? 'دولارات أمريكية' : 'دولار أمريكي',
                                fraction: 'سنت'
                            },
                            'YER': {
                                main: amount === 1 ? 'ريال يمني' : amount === 2 ? 'ريالان يمنيان' : amount <= 10 ? 'ريالات يمنية' : 'ريال يمني',
                                fraction: 'فلس'
                            },
                            'SAR': {
                                main: amount === 1 ? 'ريال سعودي' : amount === 2 ? 'ريالان سعوديان' : amount <= 10 ? 'ريالات سعودية' : 'ريال سعودي',
                                fraction: 'هللة'
                            }
                        };
                        return currencies[currency] || currencies['USD'];
                    }

                    let result = num < 0 ? 'سالب ' : '';
                    
                    if (integerPart === 0 && decimalPart === 0) {
                        return 'صفر ' + getCurrencyName(currency, 0).main;
                    }

                    const billions = Math.floor(integerPart / 1000000000);
                    const millions = Math.floor((integerPart % 1000000000) / 1000000);
                    const thousands = Math.floor((integerPart % 1000000) / 1000);
                    const ones_group = integerPart % 1000;

                    if (billions > 0) {
                        if (billions === 1) {
                            result += 'مليار';
                        } else if (billions === 2) {
                            result += 'ملياران';
                        } else if (billions <= 10) {
                            result += convertChunk(billions) + ' مليارات';
                        } else {
                            result += convertChunk(billions) + ' مليار';
                        }
                        if (millions > 0 || thousands > 0 || ones_group > 0) result += ' و';
                    }

                    if (millions > 0) {
                        if (millions === 1) {
                            result += 'مليون';
                        } else if (millions === 2) {
                            result += 'مليونان';
                        } else if (millions <= 10) {
                            result += convertChunk(millions) + ' ملايين';
                        } else {
                            result += convertChunk(millions) + ' مليون';
                        }
                        if (thousands > 0 || ones_group > 0) result += ' و';
                    }

                    if (thousands > 0) {
                        if (thousands === 1) {
                            result += 'ألف';
                        } else if (thousands === 2) {
                            result += 'ألفان';
                        } else if (thousands <= 10) {
                            result += convertChunk(thousands) + ' آلاف';
                        } else {
                            result += convertChunk(thousands) + ' ألف';
                        }
                        if (ones_group > 0) result += ' و';
                    }

                    if (ones_group > 0) {
                        result += convertChunk(ones_group);
                    }

                    const currencyNames = getCurrencyName(currency, integerPart);
                    result += ' ' + currencyNames.main;

                    if (decimalPart > 0) {
                        result += ' و' + convertChunk(decimalPart) + ' ' + currencyNames.fraction;
                    }

                    return result.trim();
                }
            </script>
        </head>
        <body>
            <div class="entry-container">
                <div class="company-header">
                    <div class="ar-section">
                        <div class="company-name">${COMPANY_INFO.name}</div>
                        <div class="company-subtitle">${COMPANY_INFO.location}</div>
                        <div class="company-subtitle" style="direction: ltr; text-align: right;">
                            ${COMPANY_INFO.phones.office.join(' - ')}
                        </div>
                    </div>
                    
                    <div class="logo-section">
                        <img src="${window.location.origin}/${COMPANY_INFO.logo}" alt="Logo" style="max-width: 100px; max-height: 80px;">
                    </div>
                    
                    <div class="en-section">
                        <div class="company-name">Sky Icon Travel & Tourism</div>
                        <div class="company-subtitle">Sana'a - Dhahban</div>
                        <div class="company-subtitle">
                            ${COMPANY_INFO.phones.office.join(' - ')}
                        </div>
                    </div>
                </div>
                
                <div class="entry-title">
                    قيد محاسبي
                </div>
                
                <div class="entry-body">
                    <div class="entry-header">
                        <div>
                            <strong>رقم القيد:</strong>
                            <span style="color: #f57c00;">${entry.number}</span>
                        </div>
                        <div>
                            <strong>التاريخ:</strong>
                            <span><script>document.write(formatDate('${entry.date}'))</script></span>
                        </div>
                        <div>
                            <strong>العملة:</strong>
                            <span><script>document.write(CURRENCIES['${entry.currency || 'USD'}'] ? CURRENCIES['${entry.currency || 'USD'}'].name : 'دولار أمريكي')</script></span>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40px;">م</th>
                                <th style="width: 120px;">رمز الحساب</th>
                                <th>اسم الحساب</th>
                                <th style="width: 150px;">مدين</th>
                                <th style="width: 150px;">دائن</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${entry.items.map((item, index) => {
                                const accountId = item.account_id || item.accountId;
                                const account = accounts.find(a => a.id === accountId || a.code === accountId);
                                const accountName = account ? account.name : (accountId ? `حساب رقم ${accountId}` : 'حساب غير محدد');
                                const accountCode = account ? account.code : (accountId || '-');
                                
                                return `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td><strong>${accountCode}</strong></td>
                                        <td style="text-align: right; padding-right: 15px;">${accountName}</td>
                                        <td><script>document.write(${item.debit} > 0 ? formatCurrency(${item.debit}, '${entry.currency || 'USD'}') : '-')</script></td>
                                        <td><script>document.write(${item.credit} > 0 ? formatCurrency(${item.credit}, '${entry.currency || 'USD'}') : '-')</script></td>
                                    </tr>
                                `;
                            }).join('')}
                            <tr class="total-row">
                                <td colspan="3" style="text-align: center;">الإجمالي</td>
                                <td><script>document.write(formatCurrency(${totalDebit}, '${entry.currency || 'USD'}'))</script></td>
                                <td><script>document.write(formatCurrency(${totalCredit}, '${entry.currency || 'USD'}'))</script></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="amount-words-container">
                        <div class="amount-words-label">💬 إجمالي المدين/الدائن بالحروف:</div>
                        <div class="amount-words-text">
                            <script>document.write(numberToArabicWords(${totalDebit}, '${entry.currency || 'USD'}'))</script>
                        </div>
                    </div>
                    
                    ${entry.description ? `
                        <div class="description-box">
                            <strong>البيان:</strong>
                            <p>${entry.description}</p>
                        </div>
                    ` : ''}
                    
                    <div class="signatures">
                        <div class="signature">
                            <div class="signature-line">المحاسب</div>
                        </div>
                        <div class="signature">
                            <div class="signature-line">المراجع</div>
                        </div>
                        <div class="signature">
                            <div class="signature-line">المدير المالي</div>
                        </div>
                    </div>
                </div>
                
                <div class="company-footer">
                    <span>هاتف/جوال: ${COMPANY_INFO.phones.office.join(' - ')}</span>
                    <span style="margin: 0 10px;">|</span>
                    <span>${COMPANY_INFO.location}</span>
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

function deleteJournalEntry(entryId) {
    if (!confirm('هل أنت متأكد من حذف هذا القيد؟')) return;
    deleteItem('journal_entries', entryId);
    showAlert('تم حذف القيد بنجاح', 'success');
    loadJournal();
}
