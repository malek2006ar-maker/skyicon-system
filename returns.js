// ========================================
// إدارة المرتجعات والمردودات
// Returns & Refunds Management
// ========================================
// ملاحظة: الدوال الأساسية (getData, saveData, findItem, addItem, updateItem, generateId, formatNumber)
// معرّفة في app.js ولا يجب إعادة تعريفها هنا


// تحميل صفحة المرتجعات
function loadReturns() {
    const content = document.getElementById('content');
    content.style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-undo"></i>
                    المرتجعات والمردودات
                </h3>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="showReturnModal('sales')">
                        <i class="fas fa-plus"></i>
                        مرتجع مبيعات
                    </button>
                    <button class="btn btn-secondary" onclick="showReturnModal('purchase')">
                        <i class="fas fa-plus"></i>
                        مردود مشتريات
                    </button>
                </div>
            </div>
            
            <div class="card-body">
                <div class="filters">
                    <select id="returnTypeFilter" class="form-control" onchange="loadReturns()">
                        <option value="">كل الأنواع</option>
                        <option value="sales">مرتجعات المبيعات</option>
                        <option value="purchase">مردودات المشتريات</option>
                    </select>
                    
                    <select id="returnStatusFilter" class="form-control" onchange="loadReturns()">
                        <option value="">كل الحالات</option>
                        <option value="pending">معلق</option>
                        <option value="approved">موافق</option>
                        <option value="rejected">مرفوض</option>
                    </select>
                    
                    <input type="date" id="returnDateFilter" class="form-control" onchange="loadReturns()" placeholder="تاريخ المرتجع">
                </div>
                
                <div id="returnsTable"></div>
            </div>
        </div>
    `;
    
    renderReturnsTable();
}

// عرض جدول المرتجعات
function renderReturnsTable() {
    const returns = getData('returns') || [];
    const typeFilter = document.getElementById('returnTypeFilter')?.value || '';
    const statusFilter = document.getElementById('returnStatusFilter')?.value || '';
    const dateFilter = document.getElementById('returnDateFilter')?.value || '';
    
    let filteredReturns = returns;
    
    if (typeFilter) {
        filteredReturns = filteredReturns.filter(r => r.type === typeFilter);
    }
    
    if (statusFilter) {
        filteredReturns = filteredReturns.filter(r => r.status === statusFilter);
    }
    
    if (dateFilter) {
        filteredReturns = filteredReturns.filter(r => r.date === dateFilter);
    }
    
    const tableHtml = `
        <table class="table">
            <thead>
                <tr>
                    <th>رقم المرتجع</th>
                    <th>النوع</th>
                    <th>الفاتورة الأصلية</th>
                    <th>التاريخ</th>
                    <th>العميل/المورد</th>
                    <th>المبلغ</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${filteredReturns.length === 0 ? 
                    '<tr><td colspan="8" style="text-align: center;">لا توجد مرتجعات</td></tr>' :
                    filteredReturns.map(ret => renderReturnRow(ret)).join('')
                }
            </tbody>
        </table>
    `;
    
    document.getElementById('returnsTable').innerHTML = tableHtml;
}

// عرض صف مرتجع
function renderReturnRow(ret) {
    const statusColors = {
        pending: '#ff9800',
        approved: '#4caf50',
        rejected: '#f44336'
    };
    
    const statusLabels = {
        pending: 'معلق',
        approved: 'موافق',
        rejected: 'مرفوض'
    };
    
    const typeLabels = {
        sales: 'مرتجع مبيعات',
        purchase: 'مردود مشتريات'
    };
    
    return `
        <tr>
            <td><strong>${ret.number}</strong></td>
            <td>${typeLabels[ret.type]}</td>
            <td>${ret.invoice_number}</td>
            <td>${formatDate(ret.date)}</td>
            <td>${ret.party_name}</td>
            <td style="color: var(--danger-color); font-weight: bold;">${formatCurrency(ret.total, ret.currency)}</td>
            <td>
                <span class="badge" style="background: ${statusColors[ret.status]}; color: white;">
                    ${statusLabels[ret.status]}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewReturn('${ret.id}')" title="عرض">
                    <i class="fas fa-eye"></i>
                </button>
                ${ret.status === 'pending' ? `
                    <button class="btn btn-sm btn-success" onclick="approveReturn('${ret.id}')" title="موافقة">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="rejectReturn('${ret.id}')" title="رفض">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-print" onclick="printReturn('${ret.id}')" title="طباعة">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        </tr>
    `;
}

// إظهار نموذج إضافة مرتجع
function showReturnModal(type) {
    const invoices = (getData('invoices') || []).filter(inv => inv.type === type);
    
    // إزالة أي نموذج سابق
    const existingModal = document.getElementById('returnModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHtml = `
        <div class="modal-overlay" id="returnModal" onclick="if(event.target === this) closeReturnModal()">
            <div class="modal" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h3>${type === 'sales' ? 'مرتجع مبيعات' : 'مردود مشتريات'}</h3>
                    <button class="close-btn" onclick="closeReturnModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="returnForm" onsubmit="saveReturn(event, '${type}')">
                        <div class="form-group">
                            <label class="form-label">الفاتورة الأصلية *</label>
                            <select class="form-control" id="originalInvoice" required onchange="loadInvoiceDetails()">
                                <option value="">اختر فاتورة</option>
                                ${invoices.map(inv => `
                                    <option value="${inv.id}">${inv.number} - ${formatCurrency(inv.total, inv.currency)}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div id="invoiceDetails"></div>
                        
                        <div class="form-group">
                            <label class="form-label">التاريخ *</label>
                            <input type="date" class="form-control" id="returnDate" required value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">سبب المرتجع *</label>
                            <select class="form-control" id="returnReason" required>
                                <option value="">اختر السبب</option>
                                <option value="damaged">بضاعة تالفة</option>
                                <option value="defective">عيب في المنتج</option>
                                <option value="wrong_item">صنف خاطئ</option>
                                <option value="customer_request">طلب العميل</option>
                                <option value="quality">جودة غير مطابقة</option>
                                <option value="other">سبب آخر</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-control" id="returnNotes" rows="3"></textarea>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                حفظ المرتجع
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="closeReturnModal()">
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
}

// إغلاق نموذج المرتجع
function closeReturnModal() {
    const modal = document.getElementById('returnModal');
    if (modal) {
        modal.remove();
    }
}

// تحميل تفاصيل الفاتورة المحددة
function loadInvoiceDetails() {
    const invoiceId = document.getElementById('originalInvoice').value;
    if (!invoiceId) {
        document.getElementById('invoiceDetails').innerHTML = '';
        return;
    }
    
    const invoice = findItem('invoices', invoiceId);
    if (!invoice) return;
    
    const detailsHtml = `
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="margin-bottom: 10px;">تفاصيل الفاتورة</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div><strong>رقم الفاتورة:</strong> ${invoice.number}</div>
                <div><strong>التاريخ:</strong> ${formatDate(invoice.date)}</div>
                <div><strong>الإجمالي:</strong> ${formatCurrency(invoice.total, invoice.currency)}</div>
                <div><strong>العملة:</strong> ${CURRENCIES[invoice.currency]?.name}</div>
            </div>
            
            <div style="margin-top: 15px;">
                <strong>الأصناف:</strong>
                <div style="max-height: 200px; overflow-y: auto; margin-top: 10px;">
                    ${invoice.items.map((item, index) => `
                        <div style="padding: 10px; background: white; margin: 5px 0; border-radius: 5px; display: flex; justify-content: space-between;">
                            <div>
                                <input type="checkbox" id="item_${index}" data-item-index="${index}" checked>
                                <label for="item_${index}">${item.description}</label>
                            </div>
                            <div>
                                <strong>${formatCurrency(item.total, invoice.currency)}</strong>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('invoiceDetails').innerHTML = detailsHtml;
}

// حفظ المرتجع
function saveReturn(event, type) {
    event.preventDefault();
    
    const invoiceId = document.getElementById('originalInvoice').value;
    const invoice = findItem('invoices', invoiceId);
    if (!invoice) {
        showAlert('الفاتورة غير موجودة', 'danger');
        return;
    }
    
    // جمع الأصناف المحددة
    const selectedItems = [];
    const checkboxes = document.querySelectorAll('[data-item-index]');
    checkboxes.forEach(cb => {
        if (cb.checked) {
            const index = parseInt(cb.getAttribute('data-item-index'));
            selectedItems.push(invoice.items[index]);
        }
    });
    
    if (selectedItems.length === 0) {
        showAlert('يجب اختيار صنف واحد على الأقل', 'danger');
        return;
    }
    
    const total = selectedItems.reduce((sum, item) => sum + item.total, 0);
    
    // إنشاء رقم المرتجع
    const returns = getData('returns') || [];
    const year = new Date().getFullYear();
    const prefix = type === 'sales' ? 'SR' : 'PR';
    const count = returns.filter(r => r.number.startsWith(`${prefix}-${year}`)).length + 1;
    const number = `${prefix}-${year}-${String(count).padStart(5, '0')}`;
    
    const returnData = {
        id: generateId(),
        number: number,
        type: type,
        invoice_id: invoiceId,
        invoice_number: invoice.number,
        date: document.getElementById('returnDate').value,
        reason: document.getElementById('returnReason').value,
        notes: document.getElementById('returnNotes').value,
        party_name: type === 'sales' ? 
            (findItem('customers', invoice.customer_id)?.name || 'غير محدد') :
            (findItem('suppliers', invoice.supplier_id)?.name || 'غير محدد'),
        party_id: type === 'sales' ? invoice.customer_id : invoice.supplier_id,
        items: selectedItems,
        currency: invoice.currency,
        total: total,
        status: 'pending',
        created_at: new Date().toISOString(),
        created_by: (getCurrentUser && getCurrentUser().username) || getCurrentUsername() || 'admin'
    };
    
    try {
        addItem('returns', returnData);
        closeReturnModal();
        showAlert('تم إضافة المرتجع بنجاح', 'success');
        loadReturns();
    } catch (error) {
        console.error('خطأ في حفظ المرتجع:', error);
        showAlert('حدث خطأ أثناء حفظ المرتجع', 'danger');
    }
}

// عرض تفاصيل مرتجع
function viewReturn(returnId) {
    const ret = findItem('returns', returnId);
    if (!ret) return;
    
    const statusLabels = {
        pending: 'معلق',
        approved: 'موافق',
        rejected: 'مرفوض'
    };
    
    const reasonLabels = {
        damaged: 'بضاعة تالفة',
        defective: 'عيب في المنتج',
        wrong_item: 'صنف خاطئ',
        customer_request: 'طلب العميل',
        quality: 'جودة غير مطابقة',
        other: 'سبب آخر'
    };
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-undo"></i>
                    تفاصيل ${ret.type === 'sales' ? 'مرتجع المبيعات' : 'مردود المشتريات'}
                </h3>
                <button class="btn btn-secondary" onclick="loadReturns()">
                    <i class="fas fa-arrow-right"></i>
                    رجوع
                </button>
            </div>
            
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; background: var(--light-bg); padding: 20px; border-radius: 10px;">
                    <div>
                        <strong style="color: var(--text-light);">رقم المرتجع:</strong>
                        <p style="font-size: 18px; font-weight: bold; color: var(--primary-color); margin-top: 5px;">${ret.number}</p>
                    </div>
                    <div>
                        <strong style="color: var(--text-light);">التاريخ:</strong>
                        <p style="font-size: 18px; margin-top: 5px;">${formatDate(ret.date)}</p>
                    </div>
                    <div>
                        <strong style="color: var(--text-light);">الحالة:</strong>
                        <p style="font-size: 18px; margin-top: 5px;">${statusLabels[ret.status]}</p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                    <div style="background: var(--light-bg); padding: 15px; border-radius: 8px;">
                        <h4 style="margin-bottom: 10px;">معلومات الفاتورة الأصلية</h4>
                        <p><strong>رقم الفاتورة:</strong> ${ret.invoice_number}</p>
                        <p><strong>${ret.type === 'sales' ? 'العميل' : 'المورد'}:</strong> ${ret.party_name}</p>
                    </div>
                    
                    <div style="background: var(--light-bg); padding: 15px; border-radius: 8px;">
                        <h4 style="margin-bottom: 10px;">تفاصيل المرتجع</h4>
                        <p><strong>السبب:</strong> ${reasonLabels[ret.reason]}</p>
                        <p><strong>المبلغ:</strong> <span style="color: var(--danger-color); font-weight: bold;">${formatCurrency(ret.total, ret.currency)}</span></p>
                    </div>
                </div>
                
                <h4>الأصناف المرتجعة</h4>
                <table class="table">
                    <thead>
                        <tr>
                            <th>الوصف</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                            <th>الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ret.items.map(item => `
                            <tr>
                                <td>${item.description}</td>
                                <td>${item.quantity}</td>
                                <td>${formatCurrency(item.price, ret.currency)}</td>
                                <td>${formatCurrency(item.total, ret.currency)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background: var(--primary-color); color: white; font-weight: bold;">
                            <td colspan="3" style="text-align: center;">الإجمالي</td>
                            <td>${formatCurrency(ret.total, ret.currency)}</td>
                        </tr>
                    </tfoot>
                </table>
                
                ${ret.notes ? `
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-right: 4px solid #ffc107; margin: 20px 0;">
                        <strong>ملاحظات:</strong>
                        <p style="margin-top: 10px;">${ret.notes}</p>
                    </div>
                ` : ''}
                
                <div style="margin-top: 30px;">
                    ${ret.status === 'pending' ? `
                        <button class="btn btn-success" onclick="approveReturn('${ret.id}')">
                            <i class="fas fa-check"></i>
                            موافقة
                        </button>
                        <button class="btn btn-danger" onclick="rejectReturn('${ret.id}')">
                            <i class="fas fa-times"></i>
                            رفض
                        </button>
                    ` : ''}
                    <button class="btn btn-primary" onclick="printReturn('${ret.id}')">
                        <i class="fas fa-print"></i>
                        طباعة
                    </button>
                </div>
            </div>
        </div>
    `;
}



// موافقة على المرتجع
function approveReturn(returnId) {
    if (!confirm('هل أنت متأكد من الموافقة على هذا المرتجع؟ \n\nسيتم تلقائياً:\n- إنشاء قيد محاسبي\n- إنشاء سند ' + (findItem('returns', returnId).type === 'sales' ? 'صرف' : 'قبض') + '\n- تحديث حساب العميل/المورد')) return;
    
    const ret = findItem('returns', returnId);
    if (!ret) return;
    
    ret.status = 'approved';
    ret.approved_at = new Date().toISOString();
    ret.approved_by = (getCurrentUser && getCurrentUser().username) || getCurrentUsername() || 'admin';
    updateItem('returns', ret.id, ret);
    
    // 1. إنشاء قيد محاسبي للمرتجع
    createReturnJournalEntry(ret);
    
    // 2. إنشاء سند قبض/صرف تلقائي
    createReturnVoucher(ret);
    
    // 3. تحديث ملاحظات الفاتورة الأصلية
    addReturnNoteToInvoice(ret);
    
    showAlert('تم الموافقة على المرتجع وتم إنشاء القيد والسند بنجاح', 'success');
    viewReturn(returnId);
}

// إنشاء قيد محاسبي للمرتجع
function createReturnJournalEntry(ret) {
    const journal_entries = getData('journal_entries') || [];
    const year = new Date().getFullYear();
    const count = journal_entries.filter(e => e.number.startsWith(`JE-${year}`)).length + 1;
    const number = `JE-${year}-${String(count).padStart(5, '0')}`;
    
    let description = '';
    let items = [];
    
    if (ret.type === 'sales') {
        // مرتجع مبيعات: مردودات المبيعات (مدين) / من حــ/ـ العملاء (دائن)
        description = `قيد مرتجع مبيعات رقم ${ret.number} - عن الفاتورة ${ret.invoice_number} - العميل: ${ret.party_name}`;
        items = [
            {
                account_id: '4111',  // مردودات المبيعات
                account_name: 'مردودات المبيعات',
                debit: parseFloat(ret.total),
                credit: 0
            },
            {
                account_id: '1131',  // مدينو المبيعات (العملاء)
                account_name: `مدينو المبيعات - ${ret.party_name}`,
                debit: 0,
                credit: parseFloat(ret.total)
            }
        ];
    } else {
        // مردود مشتريات: من حــ/ـ الموردين (مدين) / إلى حــ/ـ مردودات المشتريات (دائن)
        description = `قيد مردود مشتريات رقم ${ret.number} - عن الفاتورة ${ret.invoice_number} - المورد: ${ret.party_name}`;
        items = [
            {
                account_id: '2111',  // دائنو المشتريات (الموردين)
                account_name: `دائنو المشتريات - ${ret.party_name}`,
                debit: parseFloat(ret.total),
                credit: 0
            },
            {
                account_id: '5111',  // مردودات المشتريات
                account_name: 'مردودات المشتريات',
                debit: 0,
                credit: parseFloat(ret.total)
            }
        ];
    }
    
    const journalEntry = {
        id: generateId(),
        number: number,
        date: ret.date,
        description: description,
        currency: ret.currency,
        items: items,
        status: 'posted',
        return_id: ret.id,
        return_number: ret.number,
        created_at: new Date().toISOString(),
        created_by: (getCurrentUser && getCurrentUser().username) || getCurrentUsername() || 'admin'
    };
    
    addItem('journal_entries', journalEntry);
    ret.journal_entry_id = journalEntry.id;
    ret.journal_entry_number = journalEntry.number;
    updateItem('returns', ret.id, ret);
}

// إنشاء سند قبض/صرف للمرتجع
function createReturnVoucher(ret) {
    const vouchers = getData('vouchers') || [];
    const year = new Date().getFullYear();
    const voucherType = ret.type === 'sales' ? 'payment' : 'receipt';
    const prefix = voucherType === 'receipt' ? 'RV' : 'PV';
    const count = vouchers.filter(v => v.number.startsWith(`${prefix}-${year}`)).length + 1;
    const number = `${prefix}-${year}-${String(count).padStart(5, '0')}`;
    
    const voucher = {
        id: generateId(),
        number: number,
        type: voucherType,
        date: ret.date,
        amount: parseFloat(ret.total),
        currency: ret.currency,
        operation_type: 'cash',
        payment_method: 'cash',
        reference_type: ret.type === 'sales' ? 'customer' : 'supplier',
        reference_id: ret.party_id,
        description: `${ret.type === 'sales' ? 'صرف بموجب مرتجع مبيعات' : 'قبض بموجب مردود مشتريات'} رقم ${ret.number} - عن الفاتورة ${ret.invoice_number}`,
        return_id: ret.id,
        return_number: ret.number,
        created_at: new Date().toISOString(),
        created_by: (getCurrentUser && getCurrentUser().username) || getCurrentUsername() || 'admin'
    };
    
    addItem('vouchers', voucher);
    ret.voucher_id = voucher.id;
    ret.voucher_number = voucher.number;
    updateItem('returns', ret.id, ret);
    
    // إنشاء قيد محاسبي للسند باستخدام نظام الترحيل التلقائي
    if (typeof updateAutoPostedEntry === 'function') {
        updateAutoPostedEntry('voucher', voucher.id, voucher);
    }
}

// إضافة عبارة توضيحية للفاتورة الأصلية
function addReturnNoteToInvoice(ret) {
    const invoice = findItem('invoices', ret.invoice_id);
    if (!invoice) return;
    
    if (!invoice.return_notes) {
        invoice.return_notes = [];
    }
    
    invoice.return_notes.push({
        return_id: ret.id,
        return_number: ret.number,
        return_date: ret.date,
        return_amount: ret.total,
        note: `تم إرجاع بضاعة بقيمة ${formatCurrency(ret.total, ret.currency)} بتاريخ ${formatDate(ret.date)} بموجب ${ret.type === 'sales' ? 'مرتجع مبيعات' : 'مردود مشتريات'} رقم ${ret.number}`
    });
    
    updateItem('invoices', invoice.id, invoice);
}

// رفض المرتجع
function rejectReturn(returnId) {
    const reason = prompt('سبب الرفض:');
    if (!reason) return;
    
    const ret = findItem('returns', returnId);
    if (!ret) return;
    
    ret.status = 'rejected';
    ret.rejection_reason = reason;
    ret.rejected_at = new Date().toISOString();
    ret.rejected_by = (getCurrentUser && getCurrentUser().username) || getCurrentUsername() || 'admin';
    updateItem('returns', ret.id, ret);
    
    showAlert('تم رفض المرتجع', 'info');
    viewReturn(returnId);
}

// طباعة المرتجع
function printReturn(returnId) {
    const ret = findItem('returns', returnId);
    if (!ret) return;
    
    const statusLabels = {
        pending: 'معلق',
        approved: 'موافق',
        rejected: 'مرفوض'
    };
    
    const reasonLabels = {
        damaged: 'بضاعة تالفة',
        defective: 'عيب في المنتج',
        wrong_item: 'صنف خاطئ',
        customer_request: 'طلب العميل',
        quality: 'جودة غير مطابقة',
        other: 'سبب آخر'
    };
    
    // تنسيق التاريخ
    const formattedDate = new Date(ret.date).toLocaleDateString('ar-YE');
    
    // تنسيق العملة
    const currencyInfo = CURRENCIES[ret.currency] || CURRENCIES['USD'];
    const formatMoney = (amount) => {
        return `${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount)} ${currencyInfo.symbol}`;
    };
    
    // التفقيط
    const amountInWords = numberToArabicWords(ret.total, ret.currency);
    
    // رأس المستند
    const documentHeader = `
        <div class="header" style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 15px; margin-bottom: 15px; padding: 12px 10px; border-bottom: 3px solid #f57c00;">
            <div style="text-align: right; padding-right: 10px;">
                <div style="font-size: 15px; font-weight: bold; color: #004d40; margin: 0 0 4px 0; line-height: 1.2;">سكاي آيكون للسفريات والسياحة</div>
                <div style="font-size: 13px; color: #004d40; margin: 0 0 3px 0; line-height: 1.2;">وخدمات الحج والعمرة</div>
                <p style="color: #666; margin: 0; font-size: 10px; line-height: 1.2;">صنعاء - ذهبان - جوار سوق القات</p>
            </div>
            <div style="text-align: center;">
                <img src="${COMPANY_INFO.logo}" alt="سكاي آيكون" style="max-width: 120px; max-height: 90px; object-fit: contain; display: block; margin: 0 auto;">
            </div>
            <div style="text-align: left; padding-left: 10px; direction: ltr;">
                <div style="font-size: 15px; font-weight: bold; color: #004d40; margin: 0 0 4px 0; line-height: 1.2;">Sky Icon Travel & Tourism</div>
                <div style="font-size: 12px; color: #004d40; margin: 0 0 3px 0; line-height: 1.2;">Hajj & Umrah Services</div>
                <p style="color: #666; margin: 0; font-size: 10px; line-height: 1.2;">Sana'a - Dhahban - Yemen</p>
            </div>
        </div>
        <h2 style="text-align: center; color: #f57c00; margin: 12px 0; font-size: 18px; font-weight: bold;">${ret.type === 'sales' ? 'مرتجع مبيعات' : 'مردود مشتريات'}</h2>`;
    
    // ذيل المستند
    const documentFooter = `
        <div class="footer" style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #f57c00; text-align: center; color: #666; font-size: 11px; line-height: 1.5;">
            <p style="margin: 0; direction: ltr; font-size: 13px; font-weight: bold; color: #004d40; letter-spacing: 1px;">
                ${COMPANY_INFO.phones.office.join(' • ')}
            </p>
            <p style="margin: 8px 0 0 0; font-size: 9px; color: #999;">
                ${new Date().toLocaleDateString('ar-YE')} - ${new Date().toLocaleTimeString('ar-YE', {hour: '2-digit', minute: '2-digit'})}
            </p>
        </div>`;
    
    const html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>${ret.type === 'sales' ? 'مرتجع مبيعات' : 'مردود مشتريات'} - ${ret.number}</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    direction: rtl;
                    margin: 20px auto;
                    max-width: 900px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: center;
                }
                th {
                    background-color: #f57c00;
                    color: white;
                }
                @media print {
                    body { margin: 0 auto; }
                }
            </style>
        </head>
        <body>
            ${documentHeader}
            
            <div style="display: flex; justify-content: space-between; margin: 20px 0;">
                <div>
                    <p><strong>رقم المرتجع:</strong> ${ret.number}</p>
                    <p><strong>التاريخ:</strong> ${formattedDate}</p>
                    <p><strong>الحالة:</strong> ${statusLabels[ret.status]}</p>
                </div>
                <div>
                    <p><strong>الفاتورة الأصلية:</strong> ${ret.invoice_number}</p>
                    <p><strong>${ret.type === 'sales' ? 'العميل' : 'المورد'}:</strong> ${ret.party_name}</p>
                    <p><strong>السبب:</strong> ${reasonLabels[ret.reason]}</p>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>الوصف</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${ret.items.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td>${item.quantity}</td>
                            <td>${formatMoney(item.price)}</td>
                            <td>${formatMoney(item.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr style="background: #f5f5f5; font-weight: bold;">
                        <td colspan="3">الإجمالي</td>
                        <td style="color: #f44336;">${formatMoney(ret.total)}</td>
                    </tr>
                </tfoot>
            </table>
            
            <!-- التفقيط -->
            <div style="background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); padding: 18px; border-radius: 10px; margin: 20px 0; border-right: 4px solid #ff9800;">
                <div style="font-size: 14px; color: #856404; margin-bottom: 8px; font-weight: 600;">
                    💬 المبلغ الإجمالي بالحروف:
                </div>
                <div style="font-size: 18px; font-weight: bold; color: #856404; line-height: 1.8; font-family: 'Cairo', 'Segoe UI', sans-serif;">
                    ${amountInWords}
                </div>
            </div>
            
            ${ret.notes ? `
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <strong>ملاحظات:</strong>
                    <p style="margin-top: 10px;">${ret.notes}</p>
                </div>
            ` : ''}
            
            ${documentFooter}
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

// ========================================
// تصدير الدوال لجعلها متاحة عالمياً
// ========================================
window.loadReturns = loadReturns;
window.showReturnModal = showReturnModal;
window.closeReturnModal = closeReturnModal;
window.loadInvoiceDetails = loadInvoiceDetails;
window.saveReturn = saveReturn;
window.viewReturn = viewReturn;
window.approveReturn = approveReturn;
window.rejectReturn = rejectReturn;
window.printReturn = printReturn;

console.log('✅ نظام المرتجعات والمردودات جاهز - Returns System Ready');
