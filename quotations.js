// ========================================
// إدارة عروض الأسعار (Quotations)
// Sky Icon Travel & Tourism System
// ========================================

console.log('✅ نظام عروض الأسعار جاهز - Quotations System Ready');

// تحميل صفحة عروض الأسعار
function loadQuotations() {
    const content = document.getElementById('content');
    content.style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-file-invoice-dollar"></i>
                    عروض الأسعار
                </h3>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="showQuotationModal()">
                        <i class="fas fa-plus"></i>
                        عرض سعر جديد
                    </button>
                </div>
            </div>
            
            <div class="card-body">
                <div class="filters">
                    <input type="text" id="quotationSearch" class="form-control" placeholder="بحث برقم العرض أو اسم العميل" onkeyup="filterQuotations()">
                    
                    <select id="quotationStatusFilter" class="form-control" onchange="filterQuotations()">
                        <option value="">كل الحالات</option>
                        <option value="pending">معلق</option>
                        <option value="accepted">مقبول</option>
                        <option value="rejected">مرفوض</option>
                        <option value="expired">منتهي</option>
                    </select>
                </div>
                
                <div id="quotationsTable"></div>
            </div>
        </div>
    `;
    
    renderQuotationsTable();
}

// عرض جدول عروض الأسعار
function renderQuotationsTable() {
    const quotations = getData('quotations') || [];
    const searchTerm = document.getElementById('quotationSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('quotationStatusFilter')?.value || '';
    
    let filtered = quotations;
    
    if (searchTerm) {
        filtered = filtered.filter(q => 
            q.number.toLowerCase().includes(searchTerm) ||
            q.customer_name.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter) {
        filtered = filtered.filter(q => q.status === statusFilter);
    }
    
    const tableHtml = `
        <table class="table">
            <thead>
                <tr>
                    <th>رقم العرض</th>
                    <th>التاريخ</th>
                    <th>العميل</th>
                    <th>المبلغ</th>
                    <th>العملة</th>
                    <th>الحالة</th>
                    <th>صلاحية العرض</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.length === 0 ? 
                    '<tr><td colspan="8" style="text-align: center;">لا توجد عروض أسعار</td></tr>' :
                    filtered.map(q => renderQuotationRow(q)).join('')
                }
            </tbody>
        </table>
    `;
    
    document.getElementById('quotationsTable').innerHTML = tableHtml;
}

// عرض صف عرض سعر
function renderQuotationRow(quotation) {
    const statusLabels = {
        pending: 'معلق',
        accepted: 'مقبول',
        rejected: 'مرفوض',
        expired: 'منتهي'
    };
    
    const statusColors = {
        pending: '#ff9800',
        accepted: '#4caf50',
        rejected: '#f44336',
        expired: '#9e9e9e'
    };
    
    const validUntil = new Date(quotation.valid_until);
    const today = new Date();
    const isExpired = validUntil < today && quotation.status === 'pending';
    
    return `
        <tr>
            <td><strong>${quotation.number}</strong></td>
            <td>${formatDate(quotation.date)}</td>
            <td>${quotation.customer_name}</td>
            <td style="font-weight: bold; color: var(--primary-color);">${formatCurrency(quotation.total, quotation.currency)}</td>
            <td><span class="badge" style="background: #2196f3;">${quotation.currency}</span></td>
            <td>
                <span class="badge" style="background: ${isExpired ? statusColors.expired : statusColors[quotation.status]};">
                    ${isExpired ? statusLabels.expired : statusLabels[quotation.status]}
                </span>
            </td>
            <td>${formatDate(quotation.valid_until)}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewQuotation('${quotation.id}')" title="عرض">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-print" onclick="printQuotation('${quotation.id}')" title="طباعة">
                    <i class="fas fa-print"></i>
                </button>
                ${quotation.status === 'pending' && !isExpired ? `
                    <button class="btn btn-sm btn-success" onclick="acceptQuotation('${quotation.id}')" title="قبول">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editQuotation('${quotation.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteQuotation('${quotation.id}')" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

// فلترة عروض الأسعار
function filterQuotations() {
    renderQuotationsTable();
}

// إظهار نموذج عرض سعر جديد
function showQuotationModal(quotationId = null) {
    const quotation = quotationId ? findItem('quotations', quotationId) : null;
    const customers = getData('customers') || [];
    const currencies = window.CURRENCIES || {
        'USD': { name: 'دولار أمريكي', symbol: '$' },
        'YER': { name: 'ريال يمني', symbol: 'ر.ي' },
        'SAR': { name: 'ريال سعودي', symbol: 'ر.س' },
        'EUR': { name: 'يورو', symbol: '€' },
        'GBP': { name: 'جنيه إسترليني', symbol: '£' }
    };
    
    const today = new Date().toISOString().split('T')[0];
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    const validUntilStr = validUntil.toISOString().split('T')[0];
    
    const modalHtml = `
        <div class="modal-overlay" id="quotationModal" onclick="if(event.target === this) closeQuotationModal()">
            <div class="modal" style="max-width: 1000px; max-height: 95vh; overflow-y: auto;">
                <div class="modal-header">
                    <h3>${quotation ? 'تعديل عرض السعر' : 'عرض سعر جديد'}</h3>
                    <button class="close-btn" onclick="closeQuotationModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="quotationForm" onsubmit="saveQuotation(event, ${quotation ? `'${quotation.id}'` : 'null'})">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label class="form-label">العميل *</label>
                                <input type="text" class="form-control" id="customerName" required 
                                    value="${quotation ? quotation.customer_name : ''}"
                                    list="customersList" placeholder="اسم العميل">
                                <datalist id="customersList">
                                    ${customers.map(c => `<option value="${c.name}">`).join('')}
                                </datalist>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">التاريخ *</label>
                                <input type="date" class="form-control" id="quotationDate" required 
                                    value="${quotation ? quotation.date : today}">
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label class="form-label">العملة * <small>(يمكن كتابة عملة جديدة)</small></label>
                                <input type="text" class="form-control" id="quotationCurrency" required 
                                    value="${quotation ? quotation.currency : 'USD'}"
                                    list="currenciesList" placeholder="USD, YER, SAR...">
                                <datalist id="currenciesList">
                                    ${Object.keys(currencies).map(code => `
                                        <option value="${code}">${currencies[code].name} (${currencies[code].symbol})</option>
                                    `).join('')}
                                </datalist>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">صلاحية العرض *</label>
                                <input type="date" class="form-control" id="validUntil" required 
                                    value="${quotation ? quotation.valid_until : validUntilStr}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">عنوان العرض</label>
                            <input type="text" class="form-control" id="quotationTitle" 
                                value="${quotation ? quotation.title || '' : ''}"
                                placeholder="مثال: عرض سياحي لتركيا لمدة 7 أيام">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">
                                الأصناف/الخدمات *
                                <button type="button" class="btn btn-sm btn-success" onclick="addQuotationItem()" style="margin-right: 10px;">
                                    <i class="fas fa-plus"></i> إضافة صنف
                                </button>
                            </label>
                            <div id="quotationItems">
                                ${quotation && quotation.items ? 
                                    quotation.items.map((item, idx) => createQuotationItemRow(item, idx)).join('') :
                                    createQuotationItemRow(null, 0)
                                }
                            </div>
                        </div>
                        
                        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <strong>المجموع الفرعي:</strong>
                                <span id="subtotalDisplay">0.00</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-bottom: 10px;">
                                <strong>الخصم:</strong>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <input type="number" class="form-control" id="discount" 
                                        value="${quotation ? quotation.discount : 0}" 
                                        min="0" step="0.01" style="width: 120px;" onchange="calculateQuotationTotal()">
                                    <select id="discountType" class="form-control" style="width: 100px;" onchange="calculateQuotationTotal()">
                                        <option value="fixed" ${quotation && quotation.discount_type === 'fixed' ? 'selected' : ''}>مبلغ ثابت</option>
                                        <option value="percentage" ${quotation && quotation.discount_type === 'percentage' ? 'selected' : ''}>نسبة %</option>
                                    </select>
                                </div>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #ddd;">
                                <strong style="font-size: 18px;">الإجمالي:</strong>
                                <strong id="totalDisplay" style="font-size: 20px; color: var(--primary-color);">0.00</strong>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">ملاحظات إضافية</label>
                            <textarea class="form-control" id="quotationNotes" rows="3">${quotation ? quotation.notes || '' : ''}</textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                ${quotation ? 'تحديث' : 'حفظ'}
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="closeQuotationModal()">
                                <i class="fas fa-times"></i>
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    calculateQuotationTotal();
}

// إنشاء صف صنف في عرض السعر
function createQuotationItemRow(item = null, index = 0) {
    return `
        <div class="quotation-item" id="item-${index}" style="display: grid; grid-template-columns: 3fr 1fr 1fr 1fr 50px; gap: 10px; margin-bottom: 10px; padding: 10px; background: white; border: 1px solid #ddd; border-radius: 5px;">
            <input type="text" class="form-control" placeholder="الوصف" 
                value="${item ? item.description : ''}" 
                data-field="description" required>
            <input type="number" class="form-control" placeholder="الكمية" 
                value="${item ? item.quantity : 1}" 
                data-field="quantity" min="1" step="1" required 
                onchange="calculateQuotationTotal()">
            <input type="number" class="form-control" placeholder="السعر" 
                value="${item ? item.price : 0}" 
                data-field="price" min="0" step="0.01" required 
                onchange="calculateQuotationTotal()">
            <input type="text" class="form-control" readonly 
                value="${item ? (item.quantity * item.price).toFixed(2) : '0.00'}" 
                data-field="total" style="background: #f5f5f5; font-weight: bold;">
            <button type="button" class="btn btn-sm btn-danger" onclick="removeQuotationItem(${index})" title="حذف">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

// إضافة صنف جديد
function addQuotationItem() {
    const itemsContainer = document.getElementById('quotationItems');
    const currentItems = itemsContainer.querySelectorAll('.quotation-item').length;
    itemsContainer.insertAdjacentHTML('beforeend', createQuotationItemRow(null, currentItems));
}

// إزالة صنف
function removeQuotationItem(index) {
    const item = document.getElementById(`item-${index}`);
    if (item) {
        const itemsContainer = document.getElementById('quotationItems');
        if (itemsContainer.querySelectorAll('.quotation-item').length > 1) {
            item.remove();
            calculateQuotationTotal();
        } else {
            showAlert('يجب أن يحتوي العرض على صنف واحد على الأقل', 'warning');
        }
    }
}

// حساب الإجمالي
function calculateQuotationTotal() {
    const items = document.querySelectorAll('.quotation-item');
    let subtotal = 0;
    
    items.forEach(item => {
        const quantity = parseFloat(item.querySelector('[data-field="quantity"]').value) || 0;
        const price = parseFloat(item.querySelector('[data-field="price"]').value) || 0;
        const total = quantity * price;
        
        item.querySelector('[data-field="total"]').value = total.toFixed(2);
        subtotal += total;
    });
    
    const discountType = document.getElementById('discountType')?.value || 'fixed';
    const discountValue = parseFloat(document.getElementById('discount')?.value) || 0;
    
    let discountAmount = 0;
    if (discountType === 'percentage') {
        discountAmount = (subtotal * discountValue) / 100;
    } else {
        discountAmount = discountValue;
    }
    
    const total = subtotal - discountAmount;
    
    document.getElementById('subtotalDisplay').textContent = subtotal.toFixed(2);
    document.getElementById('totalDisplay').textContent = total.toFixed(2);
}

// حفظ عرض السعر
function saveQuotation(event, quotationId = null) {
    event.preventDefault();
    
    const items = [];
    document.querySelectorAll('.quotation-item').forEach(itemEl => {
        const description = itemEl.querySelector('[data-field="description"]').value;
        const quantity = parseFloat(itemEl.querySelector('[data-field="quantity"]').value);
        const price = parseFloat(itemEl.querySelector('[data-field="price"]').value);
        
        if (description && quantity > 0 && price >= 0) {
            items.push({
                description: description,
                quantity: quantity,
                price: price,
                total: quantity * price
            });
        }
    });
    
    if (items.length === 0) {
        showAlert('يجب إضافة صنف واحد على الأقل', 'danger');
        return;
    }
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountType = document.getElementById('discountType').value;
    const discountValue = parseFloat(document.getElementById('discount').value) || 0;
    
    let discountAmount = 0;
    if (discountType === 'percentage') {
        discountAmount = (subtotal * discountValue) / 100;
    } else {
        discountAmount = discountValue;
    }
    
    const total = subtotal - discountAmount;
    
    const quotationData = {
        customer_name: document.getElementById('customerName').value,
        date: document.getElementById('quotationDate').value,
        currency: document.getElementById('quotationCurrency').value.toUpperCase(),
        valid_until: document.getElementById('validUntil').value,
        title: document.getElementById('quotationTitle').value,
        items: items,
        subtotal: subtotal,
        discount: discountValue,
        discount_type: discountType,
        discount_amount: discountAmount,
        total: total,
        notes: document.getElementById('quotationNotes').value,
        status: 'pending'
    };
    
    try {
        if (quotationId) {
            // تحديث
            const quotation = findItem('quotations', quotationId);
            Object.assign(quotation, quotationData);
            quotation.updated_at = new Date().toISOString();
            updateItem('quotations', quotation.id, quotation);
            showAlert('تم تحديث عرض السعر بنجاح', 'success');
        } else {
            // إضافة جديد
            const quotations = getData('quotations') || [];
            const year = new Date().getFullYear();
            const count = quotations.filter(q => q.number.startsWith(`QT-${year}`)).length + 1;
            
            quotationData.id = generateId();
            quotationData.number = `QT-${year}-${String(count).padStart(5, '0')}`;
            quotationData.created_at = new Date().toISOString();
            quotationData.created_by = (getCurrentUser && getCurrentUser().username) || 'admin';
            
            addItem('quotations', quotationData);
            showAlert('تم إضافة عرض السعر بنجاح', 'success');
        }
        
        closeQuotationModal();
        loadQuotations();
    } catch (error) {
        console.error('خطأ في حفظ عرض السعر:', error);
        showAlert('حدث خطأ أثناء حفظ عرض السعر', 'danger');
    }
}

// إغلاق نموذج عرض السعر
function closeQuotationModal() {
    const modal = document.getElementById('quotationModal');
    if (modal) {
        modal.remove();
    }
}

// عرض تفاصيل عرض السعر
function viewQuotation(quotationId) {
    const quotation = findItem('quotations', quotationId);
    if (!quotation) return;
    
    const statusLabels = {
        pending: 'معلق',
        accepted: 'مقبول',
        rejected: 'مرفوض',
        expired: 'منتهي'
    };
    
    let itemsHtml = '';
    quotation.items.forEach((item, idx) => {
        itemsHtml += `
            <tr>
                <td>${idx + 1}</td>
                <td style="text-align: right;">${item.description}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price, quotation.currency)}</td>
                <td>${formatCurrency(item.total, quotation.currency)}</td>
            </tr>
        `;
    });
    
    const modalHtml = `
        <div class="modal-overlay" id="viewQuotationModal" onclick="if(event.target === this) closeViewQuotationModal()">
            <div class="modal" style="max-width: 900px;">
                <div class="modal-header">
                    <h3>تفاصيل عرض السعر - ${quotation.number}</h3>
                    <button class="close-btn" onclick="closeViewQuotationModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div><strong>رقم العرض:</strong> ${quotation.number}</div>
                        <div><strong>التاريخ:</strong> ${formatDate(quotation.date)}</div>
                        <div><strong>العميل:</strong> ${quotation.customer_name}</div>
                        <div><strong>العملة:</strong> ${quotation.currency}</div>
                        <div><strong>صلاحية العرض:</strong> ${formatDate(quotation.valid_until)}</div>
                        <div><strong>الحالة:</strong> <span class="badge">${statusLabels[quotation.status]}</span></div>
                    </div>
                    
                    ${quotation.title ? `<div style="margin-bottom: 15px;"><strong>العنوان:</strong> ${quotation.title}</div>` : ''}
                    
                    <table class="table">
                        <thead>
                            <tr>
                                <th style="width: 50px;">م</th>
                                <th>الوصف</th>
                                <th style="width: 80px;">الكمية</th>
                                <th style="width: 120px;">السعر</th>
                                <th style="width: 120px;">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" style="text-align: left;"><strong>المجموع الفرعي:</strong></td>
                                <td><strong>${formatCurrency(quotation.subtotal, quotation.currency)}</strong></td>
                            </tr>
                            ${quotation.discount > 0 ? `
                            <tr>
                                <td colspan="4" style="text-align: left;"><strong>الخصم (${quotation.discount_type === 'percentage' ? quotation.discount + '%' : ''}):</strong></td>
                                <td><strong>${formatCurrency(quotation.discount_amount, quotation.currency)}</strong></td>
                            </tr>
                            ` : ''}
                            <tr style="background: #f5f5f5;">
                                <td colspan="4" style="text-align: left; font-size: 18px;"><strong>الإجمالي النهائي:</strong></td>
                                <td style="font-size: 18px;"><strong>${formatCurrency(quotation.total, quotation.currency)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    ${quotation.notes ? `<div style="margin-top: 15px; padding: 15px; background: #f5f5f5; border-radius: 5px;"><strong>ملاحظات:</strong><br>${quotation.notes}</div>` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeViewQuotationModal() {
    const modal = document.getElementById('viewQuotationModal');
    if (modal) modal.remove();
}

// قبول عرض السعر
function acceptQuotation(quotationId) {
    if (!confirm('هل تريد قبول عرض السعر وتحويله إلى فاتورة؟')) return;
    
    const quotation = findItem('quotations', quotationId);
    if (!quotation) return;
    
    quotation.status = 'accepted';
    quotation.accepted_at = new Date().toISOString();
    updateItem('quotations', quotation.id, quotation);
    
    // إنشاء فاتورة من عرض السعر
    createInvoiceFromQuotation(quotation);
    
    showAlert('تم قبول عرض السعر وإنشاء فاتورة', 'success');
    loadQuotations();
}

// إنشاء فاتورة من عرض السعر
function createInvoiceFromQuotation(quotation) {
    const invoices = getData('invoices') || [];
    const year = new Date().getFullYear();
    const count = invoices.filter(inv => inv.number.startsWith(`INV-${year}`)).length + 1;
    
    const invoice = {
        id: generateId(),
        number: `INV-${year}-${String(count).padStart(5, '0')}`,
        type: 'sales',
        date: new Date().toISOString().split('T')[0],
        customer_name: quotation.customer_name,
        quotation_id: quotation.id,
        quotation_number: quotation.number,
        currency: quotation.currency,
        items: quotation.items,
        subtotal: quotation.subtotal,
        discount: quotation.discount_amount,
        tax: 0,
        total: quotation.total,
        payment_status: 'unpaid',
        notes: `فاتورة تم إنشاؤها من عرض السعر ${quotation.number}` + (quotation.notes ? `\n${quotation.notes}` : ''),
        created_at: new Date().toISOString(),
        created_by: (getCurrentUser && getCurrentUser().username) || 'admin'
    };
    
    addItem('invoices', invoice);
    
    // ترحيل الفاتورة تلقائيا
    if (typeof updateAutoPostedEntry === 'function') {
        updateAutoPostedEntry('invoice', invoice.id, invoice);
    }
}

// تعديل عرض السعر
function editQuotation(quotationId) {
    showQuotationModal(quotationId);
}

// حذف عرض السعر
function deleteQuotation(quotationId) {
    if (!confirm('هل أنت متأكد من حذف عرض السعر؟')) return;
    
    deleteItem('quotations', quotationId);
    showAlert('تم حذف عرض السعر بنجاح', 'success');
    loadQuotations();
}

// طباعة عرض السعر
function printQuotation(quotationId) {
    const quotation = findItem('quotations', quotationId);
    if (!quotation) return;
    
    const currencySymbol = (window.CURRENCIES && window.CURRENCIES[quotation.currency]) ? 
        window.CURRENCIES[quotation.currency].symbol : quotation.currency;
    
    const amountInWords = numberToArabicWords(quotation.total, quotation.currency);
    
    let itemsHtml = '';
    quotation.items.forEach((item, idx) => {
        itemsHtml += `
            <tr>
                <td>${idx + 1}</td>
                <td style="text-align: right;">${item.description}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
                <td style="font-weight: bold;">${item.total.toFixed(2)}</td>
            </tr>
        `;
    });
    
    const html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>عرض سعر - ${quotation.number}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 20px; }
                .header { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 15px; margin-bottom: 20px; padding: 15px; border-bottom: 3px solid #f57c00; }
                .header .ar-section { text-align: right; }
                .header .en-section { text-align: left; direction: ltr; }
                .company-name { font-size: 16px; font-weight: bold; color: #004d40; margin-bottom: 5px; }
                .company-subtitle { font-size: 12px; color: #6b7280; margin: 3px 0; }
                .title { text-align: center; font-size: 24px; font-weight: bold; color: #f57c00; margin: 20px 0; padding: 15px; background: #fff9e6; border-radius: 8px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
                .info-item { padding: 10px; background: #f5f5f5; border-radius: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
                th { background: #004d40; color: white; }
                .total-row { background: #f5f5f5; font-weight: bold; }
                .grand-total { background: #fff9e6; font-size: 18px; }
                .amount-words { background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-right: 4px solid #ff9800; }
                .amount-words-label { font-size: 13px; color: #856404; margin-bottom: 8px; font-weight: 600; text-align: center; }
                .amount-words-text { font-size: 16px; font-weight: bold; color: #856404; line-height: 1.8; text-align: center; background: white; padding: 15px; border-radius: 8px; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px; }
                @media print {
                    body { padding: 0; }
                    @page { margin: 1cm; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="ar-section">
                    <div class="company-name">سكاي آيكون للسفريات والسياحة</div>
                    <div class="company-subtitle">وخدمات الحج والعمرة</div>
                    <p style="color: #666; font-size: 10px;">صنعاء - ذهبان - جوار سوق القات</p>
                </div>
                <div>
                    <img src="${window.COMPANY_INFO?.logo || 'images/logo.png'}" alt="Logo" style="max-width: 120px; max-height: 90px;">
                </div>
                <div class="en-section">
                    <div class="company-name">Sky Icon Travel & Tourism</div>
                    <div class="company-subtitle">Hajj & Umrah Services</div>
                    <p style="color: #666; font-size: 10px;">Sana'a - Dhahban - Yemen</p>
                </div>
            </div>
            
            <div class="title">عرض سعر - QUOTATION</div>
            
            <div class="info-grid">
                <div class="info-item"><strong>رقم العرض:</strong> ${quotation.number}</div>
                <div class="info-item"><strong>التاريخ:</strong> ${formatDate(quotation.date)}</div>
                <div class="info-item"><strong>العميل:</strong> ${quotation.customer_name}</div>
                <div class="info-item"><strong>صلاحية العرض:</strong> ${formatDate(quotation.valid_until)}</div>
            </div>
            
            ${quotation.title ? `<div style="padding: 15px; background: #e3f2fd; border-radius: 5px; margin: 15px 0; text-align: center; font-weight: bold;">${quotation.title}</div>` : ''}
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 50px;">م</th>
                        <th>الوصف / Description</th>
                        <th style="width: 80px;">الكمية / Qty</th>
                        <th style="width: 100px;">السعر / Price</th>
                        <th style="width: 120px;">الإجمالي / Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="4" style="text-align: left;">المجموع الفرعي / Subtotal</td>
                        <td>${quotation.subtotal.toFixed(2)} ${currencySymbol}</td>
                    </tr>
                    ${quotation.discount_amount > 0 ? `
                    <tr class="total-row">
                        <td colspan="4" style="text-align: left;">الخصم / Discount ${quotation.discount_type === 'percentage' ? '(' + quotation.discount + '%)' : ''}</td>
                        <td>-${quotation.discount_amount.toFixed(2)} ${currencySymbol}</td>
                    </tr>
                    ` : ''}
                    <tr class="grand-total">
                        <td colspan="4" style="text-align: left; font-size: 18px;">الإجمالي النهائي / Grand Total</td>
                        <td style="font-size: 18px;">${quotation.total.toFixed(2)} ${currencySymbol}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="amount-words">
                <div class="amount-words-label">💬 المبلغ الإجمالي بالحروف / Amount in Words</div>
                <div class="amount-words-text">${amountInWords}</div>
            </div>
            
            ${quotation.notes ? `<div style="padding: 15px; background: #f5f5f5; border-radius: 5px; margin: 15px 0;"><strong>ملاحظات / Notes:</strong><br>${quotation.notes}</div>` : ''}
            
            <div class="footer">
                <p><strong>📞 للتواصل / Contact:</strong> +967 783 003 636 | +967 783 003 838 | +967 783 003 939</p>
                <p style="margin-top: 10px;">هذا عرض سعر ساري حتى ${formatDate(quotation.valid_until)} ويخضع للشروط والأحكام</p>
                <p style="margin-top: 5px;">This quotation is valid until ${formatDate(quotation.valid_until)} and subject to terms & conditions</p>
            </div>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '', 'height=900,width=900');
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 500);
}

// تصدير الدوال
window.loadQuotations = loadQuotations;
window.showQuotationModal = showQuotationModal;
window.closeQuotationModal = closeQuotationModal;
window.saveQuotation = saveQuotation;
window.filterQuotations = filterQuotations;
window.addQuotationItem = addQuotationItem;
window.removeQuotationItem = removeQuotationItem;
window.calculateQuotationTotal = calculateQuotationTotal;
window.viewQuotation = viewQuotation;
window.closeViewQuotationModal = closeViewQuotationModal;
window.acceptQuotation = acceptQuotation;
window.editQuotation = editQuotation;
window.deleteQuotation = deleteQuotation;
window.printQuotation = printQuotation;
