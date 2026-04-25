// ========================================
// شجرة الحسابات
// ========================================

function loadAccounts() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-sitemap"></i>
                    شجرة الحسابات
                </h3>
                <button class="btn btn-primary" onclick="openAddAccountModal()">
                    <i class="fas fa-plus"></i>
                    إضافة حساب
                </button>
            </div>
            
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>رمز الحساب</th>
                            <th>اسم الحساب</th>
                            <th>النوع</th>
                            <th>العملة</th>
                            <th>الرصيد المدين</th>
                            <th>الرصيد الدائن</th>
                            <th>الرصيد الصافي</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="accountsTableBody">
                        ${renderAccountsTree()}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Add Account Modal -->
        <div class="modal" id="addAccountModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">إضافة حساب جديد</h3>
                    <button class="modal-close" onclick="hideModal('addAccountModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="addAccountForm" onsubmit="saveAccount(event)">
                        <div class="form-group">
                            <label class="form-label">رمز الحساب *</label>
                            <input type="text" class="form-control" id="accountCode" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">اسم الحساب *</label>
                            <input type="text" class="form-control" id="accountName" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">نوع الحساب *</label>
                            <select class="form-control" id="accountType" required>
                                <option value="main">رئيسي</option>
                                <option value="sub">فرعي</option>
                                <option value="detail">تفصيلي</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">الحساب الأب</label>
                            <select class="form-control" id="accountParent">
                                <option value="">لا يوجد (حساب رئيسي)</option>
                                ${renderParentAccountOptions()}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">العملة *</label>
                            ${createCurrencySelect(getDefaultCurrency(), 'accountCurrency')}
                            <small class="form-text" style="color: #6b7280; font-size: 12px; margin-top: 5px; display: block;">اختر العملة المستخدمة لهذا الحساب</small>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="document.getElementById('addAccountForm').requestSubmit()">
                        <i class="fas fa-save"></i>
                        حفظ
                    </button>
                    <button class="btn btn-secondary" onclick="hideModal('addAccountModal')">
                        <i class="fas fa-times"></i>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Edit Account Modal -->
        <div class="modal" id="editAccountModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">تعديل الحساب</h3>
                    <button class="modal-close" onclick="hideModal('editAccountModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="editAccountForm" onsubmit="updateAccount(event)">
                        <input type="hidden" id="editAccountId">
                        
                        <div class="form-group">
                            <label class="form-label">رمز الحساب *</label>
                            <input type="text" class="form-control" id="editAccountCode" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">اسم الحساب *</label>
                            <input type="text" class="form-control" id="editAccountName" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">نوع الحساب *</label>
                            <select class="form-control" id="editAccountType" required>
                                <option value="main">رئيسي</option>
                                <option value="sub">فرعي</option>
                                <option value="detail">تفصيلي</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">الحساب الأب</label>
                            <select class="form-control" id="editAccountParent">
                                <option value="">لا يوجد (حساب رئيسي)</option>
                                ${renderParentAccountOptions()}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">العملة *</label>
                            ${createCurrencySelect(getDefaultCurrency(), 'editAccountCurrency')}
                            <small class="form-text" style="color: #6b7280; font-size: 12px; margin-top: 5px; display: block;">اختر العملة المستخدمة لهذا الحساب</small>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="document.getElementById('editAccountForm').requestSubmit()">
                        <i class="fas fa-save"></i>
                        حفظ التغييرات
                    </button>
                    <button class="btn btn-secondary" onclick="hideModal('editAccountModal')">
                        <i class="fas fa-times"></i>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// عرض شجرة الحسابات
// ========================================
function renderAccountsTree() {
    const accounts = getData('accounts') || [];
    
    if (accounts.length === 0) {
        return '<tr><td colspan="8" style="text-align: center; padding: 40px;">لا توجد حسابات. قم بإضافة حساب جديد.</td></tr>';
    }
    
    // ترتيب الحسابات حسب الرمز
    accounts.sort((a, b) => a.code.localeCompare(b.code));
    
    let html = '';
    
    accounts.forEach(account => {
        const level = account.code.length;
        const indent = '&nbsp;'.repeat((level - 1) * 4);
        // تمرير عملة الحساب لحساب الرصيد بالعملة الصحيحة
        const accountCurrency = account.currency || 'YER';
        const balance = getAccountBalance(account.id, accountCurrency);
        const isDebit = balance >= 0;
        
        const typeLabels = {
            main: 'رئيسي',
            sub: 'فرعي',
            detail: 'تفصيلي'
        };
        
        html += `
            <tr>
                <td style="font-weight: ${account.type === 'main' ? 'bold' : 'normal'};">
                    ${indent}${account.code}
                </td>
                <td style="font-weight: ${account.type === 'main' ? 'bold' : 'normal'};">
                    ${account.name}
                </td>
                <td>
                    <span class="badge" style="padding: 5px 10px; border-radius: 4px; font-size: 12px; background: ${account.type === 'main' ? '#004d40' : account.type === 'sub' ? '#f57c00' : '#2196f3'}; color: white;">
                        ${typeLabels[account.type]}
                    </span>
                </td>
                <td>
                    ${renderCurrencyBadge(accountCurrency)}
                </td>
                <td>${isDebit ? formatCurrency(Math.abs(balance), accountCurrency) : '-'}</td>
                <td>${!isDebit ? formatCurrency(Math.abs(balance), accountCurrency) : '-'}</td>
                <td style="font-weight: bold; color: ${balance >= 0 ? '#4caf50' : '#f44336'};">
                    ${formatCurrency(Math.abs(balance), accountCurrency)}
                </td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-sm btn-edit" onclick="openEditAccountModal('${account.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${account.type === 'detail' ? `
                            <button class="btn btn-sm btn-view" onclick="viewAccountStatement('${account.id}')" title="كشف الحساب">
                                <i class="fas fa-list"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-delete" onclick="deleteAccount('${account.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    return html;
}

// ========================================
// خيارات الحساب الأب
// ========================================
function renderParentAccountOptions() {
    const accounts = getData('accounts') || [];
    const mainAndSubAccounts = accounts.filter(acc => acc.type === 'main' || acc.type === 'sub');
    
    return mainAndSubAccounts.map(acc => 
        `<option value="${acc.id}">${acc.code} - ${acc.name}</option>`
    ).join('');
}

// ========================================
// فتح نافذة إضافة حساب
// ========================================
function openAddAccountModal() {
    document.getElementById('addAccountForm').reset();
    showModal('addAccountModal');
}

// ========================================
// حفظ حساب جديد
// ========================================
function saveAccount(event) {
    event.preventDefault();
    
    const code = document.getElementById('accountCode').value.trim();
    const name = document.getElementById('accountName').value.trim();
    const type = document.getElementById('accountType').value;
    const parent = document.getElementById('accountParent').value;
    const currency = document.getElementById('accountCurrency').value;
    
    // التحقق من عدم تكرار رمز الحساب
    const accounts = getData('accounts') || [];
    if (accounts.some(acc => acc.code === code)) {
        showAlert('رمز الحساب موجود بالفعل. الرجاء استخدام رمز آخر.', 'danger');
        return;
    }
    
    const newAccount = {
        id: generateId(),
        code,
        name,
        type,
        parent: parent || null,
        currency: currency || 'USD',
        debit: 0,
        credit: 0
    };
    
    addItem('accounts', newAccount);
    hideModal('addAccountModal');
    showAlert('تم إضافة الحساب بنجاح', 'success');
    loadAccounts();
}

// ========================================
// فتح نافذة تعديل حساب
// ========================================
function openEditAccountModal(accountId) {
    const account = findItem('accounts', accountId);
    if (!account) return;
    
    document.getElementById('editAccountId').value = account.id;
    document.getElementById('editAccountCode').value = account.code;
    document.getElementById('editAccountName').value = account.name;
    document.getElementById('editAccountType').value = account.type;
    document.getElementById('editAccountParent').value = account.parent || '';
    document.getElementById('editAccountCurrency').value = account.currency || 'USD';
    
    showModal('editAccountModal');
}

// ========================================
// تحديث حساب
// ========================================
function updateAccount(event) {
    event.preventDefault();
    
    const id = document.getElementById('editAccountId').value;
    const code = document.getElementById('editAccountCode').value.trim();
    const name = document.getElementById('editAccountName').value.trim();
    const type = document.getElementById('editAccountType').value;
    const parent = document.getElementById('editAccountParent').value;
    const currency = document.getElementById('editAccountCurrency').value;
    
    // التحقق من عدم تكرار رمز الحساب (باستثناء الحساب الحالي)
    const accounts = getData('accounts') || [];
    if (accounts.some(acc => acc.code === code && acc.id !== id)) {
        showAlert('رمز الحساب موجود بالفعل. الرجاء استخدام رمز آخر.', 'danger');
        return;
    }
    
    const updatedAccount = {
        code,
        name,
        type,
        parent: parent || null,
        currency: currency || 'USD'
    };
    
    updateItem('accounts', id, updatedAccount);
    hideModal('editAccountModal');
    showAlert('تم تحديث الحساب بنجاح', 'success');
    loadAccounts();
}

// ========================================
// حذف حساب
// ========================================
function deleteAccount(accountId) {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;
    
    // التحقق من وجود حسابات فرعية
    const accounts = getData('accounts') || [];
    const hasChildren = accounts.some(acc => acc.parent === accountId);
    
    if (hasChildren) {
        showAlert('لا يمكن حذف هذا الحساب لأنه يحتوي على حسابات فرعية', 'danger');
        return;
    }
    
    // التحقق من وجود قيود محاسبية على الحساب
    const journalEntries = getData('journal_entries') || [];
    const hasEntries = journalEntries.some(entry => 
        entry.items.some(item => item.accountId === accountId)
    );
    
    if (hasEntries) {
        showAlert('لا يمكن حذف هذا الحساب لأنه مستخدم في قيود محاسبية', 'danger');
        return;
    }
    
    deleteItem('accounts', accountId);
    showAlert('تم حذف الحساب بنجاح', 'success');
    loadAccounts();
}

// ========================================
// عرض كشف الحساب
// ========================================
function viewAccountStatement(accountId) {
    // استخدام نظام كشف الحساب متعدد العملات الجديد
    displayCurrencyStatement(accountId);
    return;
}
