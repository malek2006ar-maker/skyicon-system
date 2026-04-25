/**
 * نظام التفقيط - تحويل الأرقام إلى كلمات
 * Number to Words Converter - Arabic & English
 * Sky Icon Travel & Tourism System
 * Version: 1.0.0
 */

/**
 * تحويل الأرقام إلى كلمات بالعربية
 * @param {number} num - الرقم المراد تحويله
 * @param {string} currency - رمز العملة (USD, YER, SAR)
 * @returns {string} - الرقم مكتوباً بالحروف
 */
function numberToArabicWords(num, currency = 'USD') {
    if (isNaN(num) || num === null || num === undefined) {
        return '';
    }

    // تحويل إلى رقم صحيح والجزء العشري
    const integerPart = Math.floor(Math.abs(num));
    const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);
    
    // الأرقام الأساسية
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثماني مائة', 'تسعمائة'];
    const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];

    // دالة لتحويل رقم من 1-999 إلى كلمات
    function convertChunk(n) {
        if (n === 0) return '';
        
        let result = '';
        
        // المئات
        if (n >= 100) {
            result += hundreds[Math.floor(n / 100)];
            n %= 100;
            if (n > 0) result += ' و';
        }
        
        // من 11 إلى 19
        if (n >= 11 && n <= 19) {
            result += teens[n - 10];
        }
        // العشرات والآحاد
        else if (n === 10) {
            result += tens[1];
        }
        else if (n > 0) {
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

    // معالجة الرقم السالب
    let result = num < 0 ? 'سالب ' : '';
    
    // معالجة الصفر
    if (integerPart === 0 && decimalPart === 0) {
        return 'صفر ' + getCurrencyName(currency, 0).main;
    }

    // تقسيم الرقم إلى مجموعات (آحاد، آلاف، ملايين، مليارات)
    const billions = Math.floor(integerPart / 1000000000);
    const millions = Math.floor((integerPart % 1000000000) / 1000000);
    const thousands = Math.floor((integerPart % 1000000) / 1000);
    const ones_group = integerPart % 1000;

    // المليارات
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

    // الملايين
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

    // الآلاف
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

    // الآحاد
    if (ones_group > 0) {
        result += convertChunk(ones_group);
    }

    // إضافة اسم العملة
    const currencyNames = getCurrencyName(currency, integerPart);
    result += ' ' + currencyNames.main;

    // الجزء العشري (السنتات/الفلوس/الهللات)
    if (decimalPart > 0) {
        result += ' و' + convertChunk(decimalPart) + ' ' + currencyNames.fraction;
    }

    return 'فقط ' + result.trim() + ' لا غير.';
}

/**
 * تحويل الأرقام إلى كلمات بالإنجليزية
 * @param {number} num - الرقم المراد تحويله
 * @param {string} currency - رمز العملة
 * @returns {string} - الرقم مكتوباً بالحروف
 */
function numberToEnglishWords(num, currency = 'USD') {
    if (isNaN(num) || num === null || num === undefined) {
        return '';
    }

    const integerPart = Math.floor(Math.abs(num));
    const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convertChunk(n) {
        if (n === 0) return '';
        
        let result = '';
        
        if (n >= 100) {
            result += ones[Math.floor(n / 100)] + ' Hundred';
            n %= 100;
            if (n > 0) result += ' and ';
        }
        
        if (n >= 10 && n <= 19) {
            result += teens[n - 10];
        } else if (n >= 20 || n === 10) {
            result += tens[Math.floor(n / 10)];
            n %= 10;
            if (n > 0) result += '-';
        }
        
        if (n > 0 && n < 10) {
            result += ones[n];
        }
        
        return result;
    }

    let result = num < 0 ? 'Negative ' : '';
    
    if (integerPart === 0 && decimalPart === 0) {
        return 'Zero ' + getCurrencyNameEn(currency, 0).main;
    }

    const billions = Math.floor(integerPart / 1000000000);
    const millions = Math.floor((integerPart % 1000000000) / 1000000);
    const thousands = Math.floor((integerPart % 1000000) / 1000);
    const ones_group = integerPart % 1000;

    if (billions > 0) {
        result += convertChunk(billions) + ' Billion';
        if (millions > 0 || thousands > 0 || ones_group > 0) result += ', ';
    }

    if (millions > 0) {
        result += convertChunk(millions) + ' Million';
        if (thousands > 0 || ones_group > 0) result += ', ';
    }

    if (thousands > 0) {
        result += convertChunk(thousands) + ' Thousand';
        if (ones_group > 0) result += ' and ';
    }

    if (ones_group > 0) {
        result += convertChunk(ones_group);
    }

    const currencyNames = getCurrencyNameEn(currency, integerPart);
    result += ' ' + currencyNames.main;

    if (decimalPart > 0) {
        result += ' and ' + convertChunk(decimalPart) + ' ' + currencyNames.fraction;
    }

    return result.trim();
}

/**
 * الحصول على اسم العملة بالعربية
 * @param {string} currency - رمز العملة
 * @param {number} amount - المبلغ
 * @returns {object} - أسماء العملة والكسور
 */
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
        },
        'EUR': {
            main: amount === 1 ? 'يورو' : amount === 2 ? 'يوروان' : amount <= 10 ? 'يوروات' : 'يورو',
            fraction: 'سنت'
        },
        'GBP': {
            main: amount === 1 ? 'جنيه إسترليني' : amount === 2 ? 'جنيهان إسترلينيان' : amount <= 10 ? 'جنيهات إسترلينية' : 'جنيه إسترليني',
            fraction: 'بنس'
        }
    };

    return currencies[currency] || currencies['USD'];
}

/**
 * الحصول على اسم العملة بالإنجليزية
 * @param {string} currency - رمز العملة
 * @param {number} amount - المبلغ
 * @returns {object} - أسماء العملة والكسور
 */
function getCurrencyNameEn(currency, amount) {
    const currencies = {
        'USD': {
            main: amount === 1 ? 'US Dollar' : 'US Dollars',
            fraction: amount === 1 ? 'Cent' : 'Cents'
        },
        'YER': {
            main: amount === 1 ? 'Yemeni Rial' : 'Yemeni Rials',
            fraction: amount === 1 ? 'Fils' : 'Fils'
        },
        'SAR': {
            main: amount === 1 ? 'Saudi Riyal' : 'Saudi Riyals',
            fraction: amount === 1 ? 'Halala' : 'Halalas'
        },
        'EUR': {
            main: amount === 1 ? 'Euro' : 'Euros',
            fraction: amount === 1 ? 'Cent' : 'Cents'
        },
        'GBP': {
            main: amount === 1 ? 'British Pound' : 'British Pounds',
            fraction: amount === 1 ? 'Penny' : 'Pence'
        }
    };

    return currencies[currency] || currencies['USD'];
}

/**
 * دالة مساعدة للحصول على التفقيط حسب اللغة
 * @param {number} amount - المبلغ
 * @param {string} currency - رمز العملة
 * @param {string} language - اللغة ('ar' أو 'en')
 * @returns {string} - المبلغ مكتوباً بالحروف
 */
function amountToWords(amount, currency = 'USD', language = 'ar') {
    if (language === 'en') {
        return numberToEnglishWords(amount, currency);
    }
    return numberToArabicWords(amount, currency);
}

/**
 * دالة للحصول على HTML مُنسق للتفقيط
 * @param {number} amount - المبلغ
 * @param {string} currency - رمز العملة
 * @param {string} language - اللغة
 * @returns {string} - HTML للعرض
 */
function getAmountInWordsHTML(amount, currency = 'USD', language = 'ar') {
    const words = amountToWords(amount, currency, language);
    
    return `
        <div class="amount-in-words" style="
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 15px 20px;
            border-radius: 8px;
            border-right: 4px solid #1976d2;
            margin: 15px 0;
            font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
        ">
            <div style="
                color: #555;
                font-size: 12px;
                margin-bottom: 5px;
                font-weight: 600;
            ">
                ${language === 'ar' ? 'المبلغ بالحروف:' : 'Amount in Words:'}
            </div>
            <div style="
                color: #1976d2;
                font-size: 16px;
                font-weight: bold;
                line-height: 1.6;
            ">
                ${words}
            </div>
        </div>
    `;
}

/**
 * دالة للحصول على التفقيط في الطباعة
 * @param {number} amount - المبلغ
 * @param {string} currency - رمز العملة
 * @param {string} language - اللغة
 * @returns {string} - HTML للطباعة
 */
function getAmountInWordsPrint(amount, currency = 'USD', language = 'ar') {
    const words = amountToWords(amount, currency, language);
    
    return `
        <div class="amount-in-words-print" style="
            border: 2px solid #333;
            padding: 10px;
            margin: 10px 0;
            background: #f9f9f9;
        ">
            <strong>${language === 'ar' ? 'المبلغ بالحروف:' : 'Amount in Words:'}</strong><br>
            <span style="font-size: 14px; font-weight: bold;">${words}</span>
        </div>
    `;
}

// اختبارات سريعة
console.log('🔢 نظام التفقيط - Sky Icon');
console.log('============================');
console.log('1,234.56 USD (AR):', numberToArabicWords(1234.56, 'USD'));
console.log('1,234.56 USD (EN):', numberToEnglishWords(1234.56, 'USD'));
console.log('5,000 SAR (AR):', numberToArabicWords(5000, 'SAR'));
console.log('10,250.75 YER (AR):', numberToArabicWords(10250.75, 'YER'));
console.log('============================');
