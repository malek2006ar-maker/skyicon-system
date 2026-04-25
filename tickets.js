// ========================================
// نظام تذاكر اليمنية - Yemenia Tickets System
// ========================================

// تحميل صفحة التذاكر
function loadTickets() {
    const content = document.getElementById('content');
    content.style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-plane-departure"></i>
                    نظام تذاكر اليمنية للطيران
                </h3>
                <button class="btn btn-secondary" onclick="loadDashboard()">
                    <i class="fas fa-arrow-right"></i>
                    رجوع
                </button>
            </div>
            
            <div class="card-body" style="text-align: center; padding: 60px 20px;">
                <div style="background: linear-gradient(135deg, #1a237e 0%, #c41e3a 100%); 
                            padding: 80px 40px; 
                            border-radius: 20px; 
                            box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
                    
                    <div style="margin-bottom: 30px;">
                        <i class="fas fa-ticket-alt" style="font-size: 80px; color: white; margin-bottom: 20px;"></i>
                    </div>
                    
                    <h2 style="color: white; font-size: 32px; margin-bottom: 20px; font-weight: bold;">
                        نظام إصدار تذاكر اليمنية
                    </h2>
                    
                    <p style="color: #e8e8e8; font-size: 18px; margin-bottom: 40px; line-height: 1.8;">
                        تصميم احترافي متكامل لطباعة تذاكر اليمنية للطيران<br>
                        مع دعم كامل للرحلات الذهاب والعودة
                    </p>
                    
                    <button onclick="openYemeniaTicket()" 
                            class="btn btn-primary" 
                            style="background: white; 
                                   color: #1a237e; 
                                   border: none; 
                                   padding: 20px 60px; 
                                   font-size: 22px; 
                                   font-weight: bold; 
                                   border-radius: 50px; 
                                   box-shadow: 0 8px 25px rgba(255,255,255,0.3);
                                   transition: all 0.3s;
                                   cursor: pointer;">
                        <i class="fas fa-plane-departure"></i>
                        فتح نموذج التذكرة
                    </button>
                    
                    <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.3);">
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 800px; margin: 0 auto;">
                            <div style="color: white; padding: 20px;">
                                <i class="fas fa-print" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
                                <div style="font-size: 16px; font-weight: bold;">طباعة فورية</div>
                                <div style="font-size: 13px; opacity: 0.8; margin-top: 5px;">جودة عالية</div>
                            </div>
                            <div style="color: white; padding: 20px;">
                                <i class="fas fa-exchange-alt" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
                                <div style="font-size: 16px; font-weight: bold;">ذهاب وعودة</div>
                                <div style="font-size: 13px; opacity: 0.8; margin-top: 5px;">دعم كامل</div>
                            </div>
                            <div style="color: white; padding: 20px;">
                                <i class="fas fa-mobile-alt" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
                                <div style="font-size: 16px; font-weight: bold;">تصميم متجاوب</div>
                                <div style="font-size: 13px; opacity: 0.8; margin-top: 5px;">جميع الأجهزة</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px; text-align: right;">
                    <h4 style="color: #1a237e; margin-bottom: 15px;">
                        <i class="fas fa-info-circle"></i>
                        ملاحظات هامة:
                    </h4>
                    <ul style="list-style: none; padding: 0; color: #555;">
                        <li style="padding: 8px 0; border-bottom: 1px solid #ddd;">
                            <i class="fas fa-check" style="color: #28a745; margin-left: 10px;"></i>
                            التصميم يطابق تذاكر اليمنية الرسمية
                        </li>
                        <li style="padding: 8px 0; border-bottom: 1px solid #ddd;">
                            <i class="fas fa-check" style="color: #28a745; margin-left: 10px;"></i>
                            يدعم طباعة رحلة واحدة أو رحلتين (ذهاب وعودة)
                        </li>
                        <li style="padding: 8px 0; border-bottom: 1px solid #ddd;">
                            <i class="fas fa-check" style="color: #28a745; margin-left: 10px;"></i>
                            جميع الحقول قابلة للتعديل المباشر
                        </li>
                        <li style="padding: 8px 0;">
                            <i class="fas fa-check" style="color: #28a745; margin-left: 10px;"></i>
                            طباعة بجودة احترافية عالية
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// فتح نموذج تذكرة اليمنية في نافذة جديدة
function openYemeniaTicket() {
    // فتح الملف المرفق مباشرة
    window.open('yemenia_template.html', '_blank', 'width=900,height=900,scrollbars=yes,resizable=yes');
}
