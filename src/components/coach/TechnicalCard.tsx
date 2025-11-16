import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Row, Col, Button, Table, Modal } from 'react-bootstrap';
import { CATEGORIES, getCategoryByDOBToday } from '../../utils/categoryUtils';
import type { Club } from '../../types';
import { useTechnicalCard } from '../../hooks/useFirestore';
import { UsersService as UserService } from '../../services/firestoreService';
import './TechnicalCard.css';
import './coach-responsive.css';
const CARD_NUMBER_OPTIONS = Array.from({ length: 20 }, (_, index) => String(index + 1).padStart(2, '0'));
const STATIC_AGE_CATEGORY_OPTIONS = Array.from(new Set(CATEGORIES.map(c => c.nameAr)));

const createSubject = (cardNumber: string) => `تحليل الحصة ( مذكرة رقم ${cardNumber} )`;

const extractCardNumber = (value?: string): string | undefined => {
  if (!value) return undefined;
  const match = value?.match(/رقم\s*(\d+)/);
  return match ? match[1].padStart(2, '0') : undefined;
};

interface TechnicalCardProps {
  club: Club;
  linkedLoadData?: { unitNumber: number; intensity: number; heartRate: number } | null;
}

// لاحقًا يمكن استعمال مُنشئ حالة الصفحة الثانية إن لزم


const TechnicalCard: React.FC<TechnicalCardProps> = ({ club, linkedLoadData }) => {
  // Get current user for trainer name
  const currentUser = UserService.getCurrentUser();
  const trainerName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'المدرب' : 'المدرب';

  const [headerInfo, setHeaderInfo] = useState({
    trainer: trainerName,
    specialty: 'جودو',
    location: '',
    equipment: 'تاتامي مطاطية / بساط 2x2 متر',
    objectives: 'أفكار خطة عدم الخروج من منطقة التدريب عن طريق تنفيذ هجمة مضادة مركبة "ushi mata -osto gari" بتقنية الشخصية tomoe nage',
    sessionNumber: 90,
    age: 20,
    ageCategory: '',
    gender: 'ذكور'
  });

  // Reference to container to collect inputs without converting all to controlled
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textareaHandlers = useRef<Map<HTMLTextAreaElement, () => void>>(new Map());

  const resizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const registerTextarea = (textarea: HTMLTextAreaElement) => {
    const handler = () => resizeTextarea(textarea);
    handler();
    textarea.addEventListener('input', handler);
    textareaHandlers.current.set(textarea, handler);
  };

  const refreshTextareas = () => {
    if (!containerRef.current) return;
    const textareas = containerRef.current.querySelectorAll<HTMLTextAreaElement>('textarea');
    textareas.forEach((textarea) => {
      if (textareaHandlers.current.has(textarea)) {
        resizeTextarea(textarea);
      } else {
        registerTextarea(textarea);
      }
    });
  };

  const cleanupTextareas = () => {
    textareaHandlers.current.forEach((handler, textarea) => {
      textarea.removeEventListener('input', handler);
    });
    textareaHandlers.current.clear();
  };

  // Extra editable sections' state
  const [trainerEvaluation, setTrainerEvaluation] = useState<string>('');
  const [secondPage, setSecondPage] = useState({
    clubName: '',
    coachName: '',
    clubAddress: '',
    subject: 'تحليل الحصة ( مذكرة رقم 01 )',
    analysisText: 'تم انجاز الحصة الخاصة بـ: التحضير البدني العام بنسبة ...... %\n\nوذلك بسبب:',
  });

  // رقم البطاقة (قائمة منسدلة)
  const [cardNumber, setCardNumber] = useState<string>(extractCardNumber('تحليل الحصة ( مذكرة رقم 01 )') || '01');
  const [hasAppliedLinkedData, setHasAppliedLinkedData] = useState(false);

  // استخدام Firestore بدلاً من localStorage
  const { cardData, saveTechnicalCard } = useTechnicalCard(club.id);
  const [ageCategoryOptions, setAgeCategoryOptions] = useState<string[]>(STATIC_AGE_CATEGORY_OPTIONS);

  // حالة النوافذ المنبثقة للحسابات
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showRestModal, setShowRestModal] = useState(false);
  const [currentInputRef, setCurrentInputRef] = useState<HTMLInputElement | null>(null);
  const [loadValue, setLoadValue] = useState('');
  const [loadTime, setLoadTime] = useState('');
  const [restLoad, setRestLoad] = useState('');
  const [restTime, setRestTime] = useState('');
  const [lastLoadValue, setLastLoadValue] = useState(''); // للاحتفاظ بآخر قيمة حمولة

  // تحميل البيانات المحفوظة مع الحفاظ على اسم المدرب الحالي
  useEffect(() => {
    if (cardData && cardData.headerInfo) {
      setHeaderInfo(_prev => ({
        ...cardData.headerInfo,
        trainer: trainerName // الحفاظ على اسم المدرب الحالي
      }));

      // Load extra sections
      if (typeof cardData.trainerEvaluation === 'string') {
        setTrainerEvaluation(cardData.trainerEvaluation);
      }
      if (cardData.secondPage) {
        setSecondPage((sp) => ({
          clubName: club.nameAr || cardData.secondPage.clubName || '',
          coachName: trainerName || cardData.secondPage.coachName || '',
          clubAddress: cardData.secondPage.clubAddress || '',
          subject: cardData.secondPage.subject || sp.subject,
          analysisText: cardData.secondPage.analysisText || sp.analysisText,
        }));

        // مزامنة رقم البطاقة من الموضوع المحفوظ فقط إذا لم نطبق بيانات الربط بعد
        if (!hasAppliedLinkedData && cardData.secondPage.subject) {
          const n = extractCardNumber(cardData.secondPage.subject) || cardNumber || '01';
          setCardNumber(n);
        }
      }

      // Apply saved table values back into inputs by DOM order فقط إذا لم تُطبَّق بيانات الربط
      if (Array.isArray(cardData.tableValues) && containerRef.current && !hasAppliedLinkedData) {
        const inputs = containerRef.current.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          'textarea.phase-content-input, textarea.objectives-input, input.content-input, textarea.formations-input, textarea.duration-input, textarea.notes-input, input.content-input'
        );
        // Flatten NodeList to array and set values up to available
        cardData.tableValues.forEach((val: string, idx: number) => {
          const el = inputs[idx];
          if (el) {
            el.value = val ?? '';
          }
        });
      }

      refreshTextareas();
    }
  }, [cardData, trainerName, hasAppliedLinkedData]);

  // استخدام جميع الفئات العمرية المتاحة
  useEffect(() => {
    setAgeCategoryOptions(STATIC_AGE_CATEGORY_OPTIONS);
  }, []);

  // تحديث موضوع الصفحة الثانية عند تغيير رقم البطاقة
  useEffect(() => {
    const newSubject = createSubject(cardNumber);
    setSecondPage(sp => (
      sp.subject === newSubject
        ? sp
        : { ...sp, subject: newSubject }
    ));
  }, [cardNumber, secondPage.subject]);

  // مزامنة اسم النادي واسم المدرب مع الصفحة الثانية عند تغيّرها
  useEffect(() => {
    setSecondPage(sp => ({
      ...sp,
      clubName: club.nameAr || sp.clubName,
      coachName: headerInfo.trainer || sp.coachName,
    }));
  }, [club.nameAr, headerInfo.trainer]);

  // مزامنة مكان التدريب مع مقر النادي في الصفحة الثانية
  useEffect(() => {
    setSecondPage(sp => ({
      ...sp,
      clubAddress: headerInfo.location,
    }));
  }, [headerInfo.location]);

  useEffect(() => {
    refreshTextareas();
    return () => {
      cleanupTextareas();
    };
  }, []);

  useEffect(() => {
    refreshTextareas();
  }, [secondPage, headerInfo]);

  useEffect(() => {
    if (!linkedLoadData || !containerRef.current) return;

    setHasAppliedLinkedData(true);

    const unitStr = String(linkedLoadData.unitNumber).padStart(2, '0');

    setCardNumber(unitStr);
    setSecondPage(sp => ({
      ...sp,
      subject: createSubject(unitStr)
    }));

    const root = containerRef.current;
    const mainPhaseRows = root.querySelectorAll<HTMLTableRowElement>('tr.main-phase');

    mainPhaseRows.forEach(row => {
      const contentCells = row.querySelectorAll<HTMLTableCellElement>('td.content-cell');
      if (contentCells.length < 3) return;

      const intensityInput = contentCells[0].querySelector<HTMLInputElement>('input.content-input');
      const heartRateInput = contentCells[2].querySelector<HTMLInputElement | HTMLTextAreaElement>('input.content-input, textarea.content-input');

      if (intensityInput) {
        intensityInput.value = `${linkedLoadData.intensity}`;
      }

      if (heartRateInput) {
        heartRateInput.value = `${linkedLoadData.heartRate} ن/د`;
      }
    });

    refreshTextareas();
  }, [linkedLoadData]);

  // حفظ البيانات
  const saveData = async () => {
    try {
      // Collect all table inputs in a consistent order
      const tableValues: string[] = [];
      if (containerRef.current) {
        const inputs = containerRef.current.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          'textarea.phase-content-input, textarea.objectives-input, input.content-input, textarea.formations-input, textarea.duration-input, textarea.notes-input, input.content-input'
        );
        inputs.forEach((el) => tableValues.push(el.value ?? ''));
      }

      const dataToSave = {
        headerInfo,
        trainerEvaluation,
        secondPage,
        tableValues,
      };
      await saveTechnicalCard(dataToSave);
      alert('تم حفظ البطاقة الفنية بنجاح');
    } catch (err) {
      alert('حدث خطأ في حفظ البطاقة الفنية');
      console.error('Error saving technical card:', err);
    }
  };

  // تحديث معلومات الرأس
  const updateHeaderInfo = (field: keyof typeof headerInfo, value: any) => {
    setHeaderInfo(prev => ({ ...prev, [field]: value }));
  };

  // فتح نافذة حساب الحمولة
  const openLoadModal = (inputElement: HTMLInputElement) => {
    setCurrentInputRef(inputElement);
    setLoadValue('');
    setLoadTime('');
    setShowLoadModal(true);
  };

  // فتح نافذة حساب الراحة
  const openRestModal = (inputElement: HTMLInputElement) => {
    setCurrentInputRef(inputElement);

    // استخدام آخر قيمة حمولة تم إدخالها في نافذة الحمولة
    if (lastLoadValue) {
      setRestLoad(lastLoadValue);
    } else {
      setRestLoad('');
    }

    setRestTime('');
    setShowRestModal(true);
  };

  // حساب وتطبيق قيمة الحمولة
  const applyLoadCalculation = () => {
    if (currentInputRef && loadValue && loadTime) {
      const load = parseFloat(loadValue);
      const time = parseFloat(loadTime);
      if (!isNaN(load) && !isNaN(time)) {
        const result = load * time;
        currentInputRef.value = result.toString();
        setLastLoadValue(loadValue); // حفظ قيمة الحمولة للاستخدام في الراحة
        setShowLoadModal(false);
        setLoadValue('');
        setLoadTime('');
        setCurrentInputRef(null);

        // حساب المدة للصف وتحديث المدة الإجمالية
        setTimeout(() => calculateRowDuration(currentInputRef), 100);
      }
    }
  };

  // حساب وتطبيق قيمة الراحة
  const applyRestCalculation = () => {
    if (currentInputRef && restLoad && restTime) {
      const load = parseFloat(restLoad);
      const time = parseFloat(restTime);
      if (!isNaN(load) && !isNaN(time)) {
        const rest = load - 1;
        const result = rest * time;
        currentInputRef.value = result.toString();
        setShowRestModal(false);
        setRestLoad('');
        setRestTime('');
        setCurrentInputRef(null);

        // حساب المدة للصف وتحديث المدة الإجمالية
        setTimeout(() => calculateRowDuration(currentInputRef), 100);
      }
    }
  };

  // حساب مدة الصف (الحمولة + الراحة) وتحديثها في عمود المدة
  const calculateRowDuration = (inputElement: HTMLInputElement | null) => {
    if (!inputElement) return;

    const row = inputElement.closest('tr');
    if (!row || !row.classList.contains('main-phase')) return;

    // الحصول على قيم الحمولة والراحة
    const contentCells = row.querySelectorAll('.content-cell');
    const loadInput = contentCells[1]?.querySelector('input') as HTMLInputElement; // خانة الحمولة
    const restInput = contentCells[3]?.querySelector('input') as HTMLInputElement; // خانة الراحة

    const loadValue = parseFloat(loadInput?.value || '0');
    const restValue = parseFloat(restInput?.value || '0');
    const rowTotal = loadValue + restValue;

    // تحديث خانة المدة في نفس الصف
    const durationCell = row.querySelector('.duration-cell textarea') as HTMLTextAreaElement;
    if (durationCell && rowTotal > 0) {
      durationCell.value = `${rowTotal} د`;
    }

    // حساب المدة الإجمالية لجميع صفوف المرحلة الأساسية
    calculateTotalDuration();
  };

  // حساب المدة الإجمالية وتحديثها في خانة المدة العلوية
  const calculateTotalDuration = () => {
    if (!containerRef.current) return;

    const mainPhaseRows = containerRef.current.querySelectorAll('tr.main-phase');
    let totalDuration = 0;

    mainPhaseRows.forEach(row => {
      const contentCells = row.querySelectorAll('.content-cell');
      const loadInput = contentCells[1]?.querySelector('input') as HTMLInputElement;
      const restInput = contentCells[3]?.querySelector('input') as HTMLInputElement;

      const loadValue = parseFloat(loadInput?.value || '0');
      const restValue = parseFloat(restInput?.value || '0');
      totalDuration += loadValue + restValue;
    });

    // تحديث خانة المدة في معلومات الرأس
    if (totalDuration > 0) {
      setHeaderInfo(prev => ({ ...prev, sessionNumber: totalDuration }));
    }
  };

  // طباعة البطاقة الفنية: صفحة 1 (العنوان + الجدول + تقييم المدرب) ثم فاصل صفحة وصفحة 2 (تحليل الحصة)
  const printTechnicalCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Read current values from the live DOM to mirror the UI exactly
    const trainerEvalVal = (containerRef.current?.querySelector('.trainer-evaluation textarea') as HTMLTextAreaElement)?.value || '';
    const subjectVal = (containerRef.current?.querySelector('#secondPageSubject') as HTMLInputElement)?.value || '';
    const analysisVal = (containerRef.current?.querySelector('#secondPageAnalysis') as HTMLTextAreaElement)?.value || '';

    // Prefer values from form controls when cloning table content for print
    const getCellContentHtml = (cell: Element) => {
      const controls = Array.from(cell.querySelectorAll('input, textarea')) as Array<HTMLInputElement | HTMLTextAreaElement>;
      if (controls.length > 0) {
        return controls
          .map(ctrl => (ctrl.value ?? '').toString().replace(/\n/g, '<br/>'))
          .join('<br/>');
      }
      const text = (cell.textContent || '').trim();
      return text.replace(/\n/g, '<br/>');
    };

    const pageHtml = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>البطاقة الفنية رقم ${cardNumber}</title>
        <style>
          * { box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 8mm; 
            direction: rtl; 
            height: 100vh; 
            display: flex; 
            flex-direction: column;
            padding: 0;
          }
          h1, h2, h3 { margin: 0 0 8px; }
          .title { text-align: center; color: #1976d2; margin-bottom: 10px; font-size: 18px; }
          .club-info { 
            text-align: center; 
            margin-bottom: 15px; 
            border: 2px solid #000; 
            padding: 12px; 
            background: #f8f9fa;
            font-size: 14px;
            line-height: 1.5;
          }
          .main-content { 
            flex: 1; 
            display: flex; 
            flex-direction: column; 
            min-height: 0;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 14px;
            margin-bottom: 10px;
          }
          th, td { 
            border: 1px solid #000; 
            padding: 8px; 
            text-align: center; 
            vertical-align: middle;
            line-height: 1.5;
            font-weight: bold;
          }
          th { 
            background-color: #e3f2fd; 
            font-weight: bold; 
            font-size: 13px;
            padding: 10px 8px;
          }
          .phase-title { 
            writing-mode: vertical-rl; 
            text-orientation: mixed; 
            transform: rotate(180deg); 
            white-space: nowrap;
            font-size: 8px;
          }
          .trainer-eval { 
            margin-top: auto; 
            border: 2px solid #000; 
            padding: 8px; 
            flex-shrink: 0;
            overflow: visible;
          }
          .page-break { page-break-after: always; }
          .box { 
            background:#fff; 
            border:1px solid #ddd; 
            padding:12px; 
            border-radius:4px;
            font-size: 14px;
            line-height: 1.5;
            overflow: visible;
            word-wrap: break-word;
          }
          .section { margin-bottom: 12px; }
          .label { font-weight: bold; margin-bottom: 6px; font-size: 16px; }
          .technical-table { 
            flex: 1; 
            display: flex;
            flex-direction: column;
          }
          .technical-table table {
            flex: 1;
            height: 100%;
          }
          .technical-table tbody {
            height: 100%;
          }
          .technical-table tbody tr {
            height: auto;
          }
          .technical-table tbody td {
            height: auto;
            min-height: 35px;
            padding: 5px;
          }
          .header-grid {
            flex-shrink: 0;
            margin-bottom: 8px !important;
          }
          @media print {
            body { 
              margin: 8mm !important; 
              height: 100vh !important;
              font-size: 10px;
            }
            .title { font-size: 20px !important; margin-bottom: 15px !important; }
            .club-info { 
              font-size: 12px !important; 
              padding: 10px !important; 
              margin-bottom: 15px !important;
              line-height: 1.6 !important;
            }
            table { font-size: 14px !important; margin-bottom: 12px !important; }
            th, td { 
              padding: 4px !important; 
              font-size: 11px !important; 
              font-weight: bold !important;
              line-height: 1.1 !important;
              min-height: 32px !important;
            }
            th {
              font-size: 13px !important;
              font-weight: bold !important;
              padding: 8px 6px !important;
            }
            .trainer-eval { 
              padding: 8px !important; 
              border: 2px solid #000 !important;
              overflow: visible !important;
            }
            .box { 
              padding: 8px !important; 
              font-size: 11px !important;
              font-weight: bold !important;
              line-height: 1.3 !important;
              overflow: visible !important;
              word-wrap: break-word !important;
            }
            .label { font-size: 14px !important; margin-bottom: 8px !important; }
          }

          @media print and (orientation: landscape) {
            body { 
              margin: 6mm !important; 
            }
            .title { font-size: 18px !important; margin-bottom: 10px !important; }
            .club-info { 
              font-size: 10px !important; 
              padding: 8px !important; 
              margin-bottom: 10px !important;
            }
            table { font-size: 12px !important; margin-bottom: 8px !important; }
            th, td { 
              padding: 3px !important; 
              font-size: 10px !important; 
              line-height: 1.0 !important;
              min-height: 25px !important;
            }
            th {
              font-size: 11px !important;
              padding: 5px 3px !important;
            }
            .trainer-eval { 
              padding: 6px !important; 
            }
            .box { 
              padding: 6px !important; 
              font-size: 10px !important;
              line-height: 1.2 !important;
            }
            .label { font-size: 12px !important; margin-bottom: 4px !important; }
          }
        </style>
      </head>
      <body>
        <!-- Page 1: Title + Header Info + Table + Trainer Evaluation -->
        
        <h2 class="title">البطاقة الفنية رقم ${cardNumber}</h2>
        
        <div class="main-content">
          <table class="header-grid">
            <tr>
              <th style="background:#f1f1f1; width:120px;">المــــدرب</th>
              <td>${(headerInfo.trainer || '').toString().replace(/\n/g, '<br/>')}</td>
              <th style="background:#f1f1f1; width:120px;">الاختصاص</th>
              <td>${(headerInfo.specialty || '').toString().replace(/\n/g, '<br/>')}</td>
            </tr>
            <tr>
              <th style="background:#f1f1f1;">المــــكان</th>
              <td>${(headerInfo.location || '').toString().replace(/\n/g, '<br/>')}</td>
              <th style="background:#f1f1f1;">الوســائل</th>
              <td>${(headerInfo.equipment || '').toString().replace(/\n/g, '<br/>')}</td>
            </tr>
            <tr>
              <th style="background:#f1f1f1;">المدة (دقيقة)</th>
              <td>${Number.isFinite(headerInfo.sessionNumber as any) ? headerInfo.sessionNumber : ''}</td>
              <th style="background:#f1f1f1;">عدد المتمرنين</th>
              <td>${Number.isFinite(headerInfo.age as any) ? headerInfo.age : ''}</td>
            </tr>
            <tr>
              <th style="background:#f1f1f1;">الفئة العمرية</th>
              <td>${headerInfo.ageCategory || ''}</td>
              <th style="background:#f1f1f1;">الصنف</th>
              <td>${headerInfo.gender || ''}</td>
            </tr>
            <tr>
              <th style="background:#f1f1f1;">الأهــــداف</th>
              <td colspan="3">${(headerInfo.objectives || '').toString().replace(/\n/g, '<br/>')}</td>
            </tr>
          </table>
          
          <div class="technical-table">
            <table style="height: 100%;"
          <thead>
            <tr>
              <th colSpan="2">المراحــل</th>
              <th>الأهداف</th>
              <th colSpan="4">المضمون</th>
              <th>التشكيــلات</th>
              <th>المدة</th>
              <th>ملاحظات</th>
            </tr>
            <tr>
              <th>العنوان</th>
              <th>المحتوى</th>
              <th></th>
              <th>الشدة</th>
              <th>التكرار</th>
              <th>ن/د</th>
              <th>الراحة</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${Array.from(containerRef.current?.querySelectorAll('tbody tr') || []).map(row => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      return `
                <tr>
                  ${cells.map(cell => {
        const colspan = cell.getAttribute('colspan') || '1';
        const rowspan = cell.getAttribute('rowspan') || '1';
        const className = (cell as HTMLElement).className || '';
        const contentHtml = getCellContentHtml(cell);
        return `<td colspan="${colspan}" rowspan="${rowspan}" class="${className}">${contentHtml}</td>`;
      }).join('')}
                </tr>
              `;
    }).join('')}
          </tbody>
            </table>
          </div>
          
          <div class="trainer-eval">
            <div class="label">تقييم المدرب:</div>
            <div class="box">${trainerEvalVal.replace(/\n/g, '<br/>')}</div>
          </div>
        </div>
        <div class="page-break"></div>

        <!-- Page 2: Session Analysis -->
        <div class="club-info" style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 2px solid #2196f3; border-radius: 15px; padding: 15px; margin-bottom: 20px; text-align: center;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="text-align: right;">
              <strong>اسم النادي: </strong>${club.nameAr || secondPage.clubName || ''}
            </div>
            <div style="text-align: right;">
              <strong>اسم ولقب المربي الرياضي: </strong>${headerInfo.trainer || secondPage.coachName || ''}
            </div>
          </div>
          <div style="text-align: right;">
            <strong>مقر النادي: </strong>${secondPage.clubAddress || headerInfo.location || ''}
          </div>
        </div>
        
        <h2 class="title">تحليل الحصة</h2>
        <div class="section">
          <div class="label">الموضوع</div>
          <div class="box">${subjectVal.replace(/\n/g, '<br/>')}</div>
        </div>
        <div class="section">
          <div class="label">تحليل الحصة</div>
          <div class="box">${analysisVal.replace(/\n/g, '<br/>')}</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(pageHtml);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 100);
  };



  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white d-flex align-items-center justify-content-between">
        <div className="text-end" dir="rtl">
          <h5 className="mb-0 d-flex align-items-center gap-2" dir="rtl">
            <i className="fas fa-clipboard-list me-2"></i>
            <span>البطاقة الفنية</span>
            <span className="ms-2">رقم</span>
            <Form.Select
              size="sm"
              value={cardNumber}
              onChange={(e) => {
                const value = e.target.value;
                setCardNumber(value);
                setSecondPage((sp) => ({ ...sp, subject: createSubject(value) }));
              }}
              style={{ width: '80px', display: 'inline-block' }}
              className="ms-1"
            >
              {CARD_NUMBER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Form.Select>
          </h5>
        </div>
        <div className="text-start">
          <Button
            variant="outline-light"
            size="sm"
            onClick={printTechnicalCard}
            dir="rtl"
          >
            <i className="fas fa-print me-2"></i>
            طباعة البطاقة
          </Button>
        </div>
      </Card.Header>

      <Card.Body className="p-2" ref={containerRef}>
        {/* معلومات الرأس */}
        <Row className="mb-3">
          <Col md={6}>
            <div className="header-info" dir="rtl">
              <div className="mb-2">
                <strong>المــــدرب:</strong>
                <Form.Control
                  type="text"
                  size="sm"
                  value={headerInfo.trainer}
                  onChange={(e) => updateHeaderInfo('trainer', e.target.value)}
                  placeholder={trainerName}
                  className="d-inline-block ms-2"
                  style={{ width: '200px' }}
                />
              </div>
              <div className="mb-2">
                <strong>الاختصاص:</strong>
                <Form.Control
                  type="text"
                  size="sm"
                  value={headerInfo.specialty}
                  onChange={(e) => updateHeaderInfo('specialty', e.target.value)}
                  className="d-inline-block ms-2"
                  style={{ width: '100px' }}
                />
              </div>
              <div className="mb-2">
                <strong>المــــكان:</strong>
                <Form.Control
                  as="textarea"
                  rows={2}
                  size="sm"
                  value={headerInfo.location}
                  onChange={(e) => updateHeaderInfo('location', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <strong>الوســائل:</strong>
                <Form.Control
                  type="text"
                  size="sm"
                  value={headerInfo.equipment}
                  onChange={(e) => updateHeaderInfo('equipment', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="header-info" dir="rtl">
              <div className="mb-2">
                <strong>المدة:</strong>
                <Form.Control
                  type="number"
                  size="sm"
                  value={headerInfo.sessionNumber}
                  onChange={(e) => updateHeaderInfo('sessionNumber', parseInt(e.target.value))}
                  className="d-inline-block ms-2"
                  style={{ width: '80px' }}
                />
                <span className="ms-1">دقيقة</span>
              </div>
              <div className="mb-2">
                <strong>عدد المتمرنين:</strong>
                <Form.Control
                  type="number"
                  size="sm"
                  value={headerInfo.age}
                  onChange={(e) => updateHeaderInfo('age', parseInt(e.target.value))}
                  className="d-inline-block ms-2"
                  style={{ width: '80px' }}
                />
              </div>
              <div className="mb-2">
                <strong>الفئة العمرية:</strong>
                <Form.Select
                  size="sm"
                  value={headerInfo.ageCategory}
                  onChange={(e) => updateHeaderInfo('ageCategory', e.target.value)}
                  className="d-inline-block ms-2"
                  style={{ width: '150px' }}
                >
                  <option value="">اختر الفئة العمرية</option>
                  {ageCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="mb-2">
                <strong>الصنف:</strong>
                <Form.Select
                  size="sm"
                  value={headerInfo.gender}
                  onChange={(e) => updateHeaderInfo('gender', e.target.value)}
                  className="d-inline-block ms-2"
                  style={{ width: '100px' }}
                >
                  <option value="ذكور">ذكور</option>
                  <option value="إناث">إناث</option>
                </Form.Select>
              </div>
              <div>
                <strong>الأهــــداف:</strong>
                <Form.Control
                  as="textarea"
                  rows={3}
                  size="sm"
                  value={headerInfo.objectives}
                  onChange={(e) => updateHeaderInfo('objectives', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </Col>
        </Row>

        {/* زر الحفظ */}
        <Row className="mb-3">
          <Col className="text-end">
            <Button
              variant="success"
              onClick={saveData}
              size="sm"
              dir="rtl"
            >
              <i className="fas fa-save me-2"></i>
              حفظ البطاقة
            </Button>
          </Col>
        </Row>

        {/* الجدول الرئيسي */}
        <div className="table-responsive">
          <Table bordered className="technical-card-table coach-table">
            <thead>
              <tr>
                <th className="phase-header" colSpan={2} dir="rtl">المراحــل</th>
                <th className="objectives-header" dir="rtl">الأهداف</th>
                <th className="content-header" colSpan={4} dir="rtl">المضمون</th>
                <th className="formations-header" dir="rtl">التشكيــلات</th>
                <th className="duration-header" dir="rtl">المدة</th>
                <th className="notes-header" dir="rtl">ملاحظات</th>
              </tr>
              <tr>
                <th className="phase-sub-header" dir="rtl">العنوان</th>
                <th className="phase-sub-header" dir="rtl">المحتوى</th>
                <th></th>
                <th className="content-sub-header" dir="rtl">الشدة</th>
                <th className="content-sub-header" dir="rtl">الحمولة</th>
                <th className="content-sub-header" dir="rtl">ن/د</th>
                <th className="content-sub-header" dir="rtl">الراحة</th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {/* المرحلة التحضيرية - صفين */}
              <tr className="prep-phase">
                <td rowSpan={2} className="phase-title-cell">
                  <div className="phase-title" dir="rtl">
                    المرحلة التحضيرية
                  </div>
                </td>
                <td className="phase-content-cell">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    defaultValue="الإستعداد النفسي والانضباط"
                    className="phase-content-input"
                    dir="rtl"
                  />
                </td>
                <td className="objectives-cell">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    defaultValue="- المحافظات&#10;- مراقبة النظافة"
                    className="objectives-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    defaultValue="5"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="formations-cell">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    defaultValue="***************&#10;+"
                    className="formations-input"
                    dir="rtl"
                  />
                </td>
                <td className="duration-cell">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    defaultValue="+ 5"
                    className="duration-input"
                    dir="rtl"
                  />
                </td>
                <td className="notes-cell">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    defaultValue="الهدوء"
                    className="notes-input"
                    dir="rtl"
                  />
                </td>
              </tr>
              <tr className="prep-phase">
                <td className="phase-content-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="-1- لعبة تسخين: التنين والفارس بإستخدام كومي كاتا&#10;-2- تسخين خاص"
                    className="phase-content-input"
                    dir="rtl"
                  />
                </td>
                <td className="objectives-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="- التنقل على البساط&#10;-1- الإحماء العام: المسك الجيد والتحكم والإفلات على البساط&#10;-2- إحماء المفاصل"
                    className="objectives-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    defaultValue="5"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="formations-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="-1- التنين والفارس بإستخدام كومي كاتا بين طلاب مبتدئين&#10;-2- تسخين مفاصل داخل الدائرة"
                    className="formations-input"
                    dir="rtl"
                  />
                </td>
                <td className="duration-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="العمل بشدة متوسطة&#10;+ 5"
                    className="duration-input"
                    dir="rtl"
                  />
                </td>
                <td className="notes-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="-1- لعبة تسخين: التنين والفارس بإستخدام كومي كاتا&#10;-2- تسخين خاص"
                    className="notes-input"
                    dir="rtl"
                  />
                </td>
              </tr>

              {/* المرحلة الأساسية - ثلاث صفوف */}
              <tr className="main-phase">
                <td rowSpan={3} className="phase-title-cell">
                  <div className="phase-title" dir="rtl">
                    المرحلة الأساسية
                  </div>
                </td>
                <td className="phase-content-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="البدء في أداء التقنية المركبة&#10;ushi mata -osto gari -1"
                    className="phase-content-input"
                    dir="rtl"
                  />
                </td>
                <td className="objectives-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="-1- إتقان المهارة وإيجاد الحل من أجل تنفيذ الإفلات والهجوم بحركة مركبة لتفادي الخروج من منطقة التباري"
                    className="objectives-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    defaultValue="10"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell" onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) openLoadModal(input);
                }} style={{ cursor: 'pointer', backgroundColor: '#fffacd' }} title="اضغط لحساب الحمولة">
                  <Form.Control
                    type="text"
                    className="content-input load-input"
                    dir="rtl"
                    placeholder="اضغط"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell" onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) openRestModal(input);
                }} style={{ cursor: 'pointer', backgroundColor: '#e0f7fa' }} title="اضغط لحساب الراحة">
                  <Form.Control
                    type="text"
                    className="content-input rest-input"
                    dir="rtl"
                    placeholder="اضغط"
                  />
                </td>
                <td className="formations-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="-1- تطبيق حركة بطريقة بالرجلين&#10;-2- حركة في الدورة مع تطبيق الخصم&#10;-3- تطبيق حركة وحركة OSTO GARI&#10;-4- تنفيذ هجمة خفيفة ushi mata وإسقاط الخصم"
                    className="formations-input"
                    dir="rtl"
                  />
                </td>
                <td className="duration-cell">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    defaultValue="العمل بشدة متوسطة&#10;+ 30"
                    className="duration-input"
                    dir="rtl"
                  />
                </td>
                <td className="notes-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="العمل بكرمي&#10;Migi -&#10;Hidari"
                    className="notes-input"
                    dir="rtl"
                  />
                </td>
              </tr>
              <tr className="main-phase">
                <td className="phase-content-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="أداء تقنية التضحية&#10;tomoe nage"
                    className="phase-content-input"
                    dir="rtl"
                  />
                </td>
                <td className="objectives-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="-2- تنفيذ خطة عدم الخروج من منطقة التباري بتقنية التضحية الخلفية&#10;tomoe nage"
                    className="objectives-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    defaultValue="10"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell" onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) openLoadModal(input);
                }} style={{ cursor: 'pointer', backgroundColor: '#fffacd' }} title="اضغط لحساب الحمولة">
                  <Form.Control
                    type="text"
                    className="content-input load-input"
                    dir="rtl"
                    placeholder="اضغط"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell" onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) openRestModal(input);
                }} style={{ cursor: 'pointer', backgroundColor: '#e0f7fa' }} title="اضغط لحساب الراحة">
                  <Form.Control
                    type="text"
                    className="content-input rest-input"
                    dir="rtl"
                    placeholder="اضغط"
                  />
                </td>
                <td className="formations-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="-1- تنفيذ هجمة خفيفة tomoe nage&#10;مع الخصم أو مع هجمات بعدها"
                    className="formations-input"
                    dir="rtl"
                  />
                </td>
                <td className="duration-cell">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    defaultValue="العمل بشدة متوسطة&#10;+ 30"
                    className="duration-input"
                    dir="rtl"
                  />
                </td>
                <td className="notes-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="البدوء والتوقيف مع الإشارة"
                    className="notes-input"
                    dir="rtl"
                  />
                </td>
              </tr>
              <tr className="main-phase">
                <td className="phase-content-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="Ne waza"
                    className="phase-content-input"
                    dir="rtl"
                  />
                </td>
                <td className="objectives-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="-Gagarikeiko&#10;-Randori"
                    className="objectives-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell" onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) openLoadModal(input);
                }} style={{ cursor: 'pointer', backgroundColor: '#fffacd' }} title="اضغط لحساب الحمولة">
                  <Form.Control
                    type="text"
                    className="content-input load-input"
                    dir="rtl"
                    placeholder="اضغط"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell" onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) openRestModal(input);
                }} style={{ cursor: 'pointer', backgroundColor: '#e0f7fa' }} title="اضغط لحساب الراحة">
                  <Form.Control
                    type="text"
                    className="content-input rest-input"
                    dir="rtl"
                    placeholder="اضغط"
                  />
                </td>
                <td className="formations-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="في كل الإتجاهات وقلب بهاتهم للتحصيل على تثبيت خفي أو كسر متوازن أرضي"
                    className="formations-input"
                    dir="rtl"
                  />
                </td>
                <td className="duration-cell">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    defaultValue="+ 12"
                    className="duration-input"
                    dir="rtl"
                  />
                </td>
                <td className="notes-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="Ne waza"
                    className="notes-input"
                    dir="rtl"
                  />
                </td>
              </tr>

              {/* المرحلة النهائية */}
              <tr className="final-phase">
                <td className="phase-title-cell">
                  <div className="phase-title" dir="rtl">
                    المرحلة النهائية
                  </div>
                </td>
                <td className="phase-content-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="Retour au calme&#10;المشي على البساط"
                    className="phase-content-input"
                    dir="rtl"
                  />
                </td>
                <td className="objectives-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="الهدف وضعية تقييمية وتحفيزية"
                    className="objectives-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="content-cell">
                  <Form.Control
                    type="text"
                    className="content-input"
                    dir="rtl"
                  />
                </td>
                <td className="formations-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="في كل الإتجاهات تشجيع كل واحد على تقديم عمل أحسن التوجه لفرقة الملابس"
                    className="formations-input"
                    dir="rtl"
                  />
                </td>
                <td className="duration-cell">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    defaultValue="النهاية&#10;+ 1"
                    className="duration-input"
                    dir="rtl"
                  />
                </td>
                <td className="notes-cell">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    defaultValue="Retour au calme المشي على البساط"
                    className="notes-input"
                    dir="rtl"
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        </div>


        {/* تقييم المدرب */}
        <Row className="mt-3">
          <Col>
            <div className="trainer-evaluation" dir="rtl">
              <strong>تقييم المدرب:</strong>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="ملاحظات وتقييم المدرب للحصة..."
                value={trainerEvaluation}
                onChange={(e) => setTrainerEvaluation(e.target.value)}
                className="mt-2"
              />
            </div>
          </Col>
        </Row>

        {/* الصفحة الثانية - تكملة البطاقة */}
        <div className="mt-4" style={{ pageBreakBefore: 'always' }}>
          <div className="second-page-header" style={{
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            border: '2px solid #2196f3',
            borderRadius: '15px',
            padding: '15px',
            marginBottom: '60px',
            textAlign: 'center',
            direction: 'rtl'
          }}>
            <Row>
              <Col md={6} className="text-right d-flex align-items-center gap-2" style={{ justifyContent: 'flex-end' }}>
                <strong className="ms-2">اسم النادي:</strong>
                <Form.Control
                  type="text"
                  size="sm"
                  value={club.nameAr || secondPage.clubName}
                  readOnly
                  style={{ maxWidth: '260px', display: 'inline-block' }}
                />
              </Col>
              <Col md={6} className="text-right d-flex align-items-center gap-2" style={{ justifyContent: 'flex-end' }}>
                <strong className="ms-2">اسم ولقب المربي الرياضي:</strong>
                <Form.Control
                  type="text"
                  size="sm"
                  value={headerInfo.trainer || secondPage.coachName}
                  readOnly
                  style={{ maxWidth: '260px', display: 'inline-block' }}
                />
              </Col>
            </Row>
            <Row className="mt-2">
              <Col md={6} className="text-right d-flex align-items-center gap-2" style={{ justifyContent: 'flex-end' }}>
                <strong className="ms-2">مقر النادي:</strong>
                <Form.Control
                  type="text"
                  size="sm"
                  value={secondPage.clubAddress}
                  readOnly
                  style={{ maxWidth: '260px', display: 'inline-block' }}
                />
              </Col>

            </Row>
          </div>

          <div className="text-center mb-3">
            <div style={{
              background: 'linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)',
              border: '2px solid #03a9f4',
              borderRadius: '15px',
              padding: '15px',
              direction: 'rtl',
              display: 'inline-block',
              fontWeight: 'bold'
            }}>
              <div>رقم الحصة: {cardNumber}</div>
              <div>الموضوع: {secondPage.subject}</div>
            </div>
          </div>

          <div className="second-page-analysis-block" style={{
            background: 'linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)',
            border: '2px solid #4caf50',
            borderRadius: '15px',
            padding: '20px',
            direction: 'rtl',
            minHeight: '400px'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontWeight: 'bold',
                fontSize: '16px',
                marginBottom: '10px',
                textAlign: 'right'
              }}>
                الهدف من الحصة:
              </div>
              <div style={{
                background: 'white',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid #ddd',
                minHeight: '100px'
              }}>
                <Form.Group controlId="secondPageSubject" className="mb-2">
                  <Form.Label className="mb-1">الموضوع</Form.Label>
                  <Form.Control
                    type="text"
                    size="sm"
                    value={secondPage.subject}
                    onChange={(e) => setSecondPage(sp => ({ ...sp, subject: e.target.value }))}
                  />
                </Form.Group>
                <Form.Group controlId="secondPageAnalysis">
                  <Form.Label className="mb-1">تحليل الحصة</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={secondPage.analysisText}
                    onChange={(e) => setSecondPage(sp => ({ ...sp, analysisText: e.target.value }))}
                  />
                </Form.Group>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .technical-card-table {
            font-size: 12px;
            direction: rtl;
          }

          .technical-card-table th,
          .technical-card-table td {
            padding: 8px;
            vertical-align: middle;
            text-align: center;
            border: 1px solid #dee2e6;
          }

          .technical-card-table .form-control {
            text-align: center;
          }

          .notes-header,
          .duration-header,
          .formations-header,
          .content-header,
          .objectives-header,
          .phase-header {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #495057;
          }

          .content-sub-header,
          .phase-sub-header {
            background-color: #e9ecef;
            font-size: 11px;
            font-weight: 600;
          }

          .phase-title-cell {
            background-color: #fff3cd;
            font-weight: bold;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            width: 100px;
            padding: 5px;
            text-align: center;
            vertical-align: middle;
          }

          .phase-content-cell {
            background-color: #f8f9fa;
            width: 220px;
            min-width: 220px;
            text-align: center;
            vertical-align: middle;
          }

          .phase-title {
            transform: rotate(0deg);
            white-space: nowrap;
            font-size: 11px;
            line-height: 1.2;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
          }

          .objectives-input,
          .formations-input,
          .notes-input,
          .phase-content-input {
            font-size: 10px;
            line-height: 1.3;
            resize: none;
            border: none;
            background: transparent;
            width: 100%;
            text-align: center;
          }

          .content-input,
          .duration-input {
            font-size: 11px;
            border: none;
            background: transparent;
            text-align: center;
            width: 100%;
          }

          .prep-phase {
            background-color: #f8f9fa;
          }

          .main-phase {
            background-color: #e3f2fd;
          }

          .final-phase {
            background-color: #f3e5f5;
          }

          .trainer-evaluation {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #dee2e6;
          }
        `}</style>
      </Card.Body>

      {/* نافذة حساب الحمولة */}
      <Modal show={showLoadModal} onHide={() => setShowLoadModal(false)} centered dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>حساب الحمولة</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>الحمولة</Form.Label>
              <Form.Control
                type="number"
                value={loadValue}
                onChange={(e) => setLoadValue(e.target.value)}
                placeholder="أدخل قيمة الحمولة"
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>الوقت (دقيقة)</Form.Label>
              <Form.Control
                type="number"
                value={loadTime}
                onChange={(e) => setLoadTime(e.target.value)}
                placeholder="أدخل الوقت بالدقائق"
              />
            </Form.Group>
            {loadValue && loadTime && (
              <div className="alert alert-info" dir="rtl">
                النتيجة: {parseFloat(loadValue) * parseFloat(loadTime)}
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoadModal(false)}>
            إلغاء
          </Button>
          <Button variant="primary" onClick={applyLoadCalculation}>
            موافق
          </Button>
        </Modal.Footer>
      </Modal>

      {/* نافذة حساب الراحة */}
      <Modal show={showRestModal} onHide={() => setShowRestModal(false)} centered dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>حساب الراحة</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {restLoad ? (
              <>
                <div className="alert alert-info mb-3" dir="rtl">
                  <strong>قيمة الحمولة:</strong> {restLoad}
                </div>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>قيمة الراحة</Form.Label>
                  <Form.Control
                    type="text"
                    value={parseFloat(restLoad) - 1}
                    readOnly
                    style={{
                      backgroundColor: '#d1ecf1',
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      textAlign: 'center',
                      border: '2px solid #0dcaf0'
                    }}
                  />
                  <Form.Text className="text-muted">
                    (الحمولة - 1) = ({restLoad} - 1) = {parseFloat(restLoad) - 1}
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>الوقت (دقيقة)</Form.Label>
                  <Form.Control
                    type="number"
                    value={restTime}
                    onChange={(e) => setRestTime(e.target.value)}
                    placeholder="أدخل الوقت بالدقائق"
                    autoFocus
                  />
                </Form.Group>
                {restTime && (
                  <div className="alert alert-success" dir="rtl" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    النتيجة النهائية: {parseFloat(restLoad) - 1} × {restTime} = {(parseFloat(restLoad) - 1) * parseFloat(restTime)}
                  </div>
                )}
              </>
            ) : (
              <div className="alert alert-warning" dir="rtl">
                يرجى إدخال قيمة في خانة الحمولة أولاً
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRestModal(false)}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={applyRestCalculation}
            disabled={!restLoad || !restTime}
          >
            موافق
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default TechnicalCard;
