import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Row, Col, Button, Table, Modal } from 'react-bootstrap';
import { CATEGORIES } from '../../utils/categoryUtils';
import { useAdminTechnicalCard } from '../../hooks/useFirestore';

const CARD_NUMBER_OPTIONS = Array.from({ length: 130 }, (_, index) => String(index + 1).padStart(2, '0'));
const STATIC_AGE_CATEGORY_OPTIONS = Array.from(new Set(CATEGORIES.map(c => c.nameAr)));

const createSubject = (cardNumber: string) => `تحليل الحصة ( مذكرة رقم ${cardNumber} )`;

interface AdminTechnicalCardProps {
  linkedLoadData?: { unitNumber: number; intensity: number; heartRate: number } | null;
}

const AdminTechnicalCard: React.FC<AdminTechnicalCardProps> = ({ linkedLoadData }) => {
  const [cardNumber, setCardNumber] = useState<string>('01');
  
  const [headerInfo, setHeaderInfo] = useState({
    specialty: 'جودو',
    location: '',
    equipment: 'تاتامي مطاطية / بساط 2x2 متر',
    objectives: 'أفكار خطة عدم الخروج من منطقة التدريب عن طريق تنفيذ هجمة مضادة مركبة "ushi mata -osto gari" بتقنية الشخصية tomoe nage',
    sessionNumber: 90,
    age: 20,
    ageCategory: '',
    gender: 'ذكور'
  });

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

  const [trainerEvaluation, setTrainerEvaluation] = useState<string>('');
  const [secondPage, setSecondPage] = useState({
    clubName: '',
    clubAddress: '',
    subject: 'تحليل الحصة ( مذكرة رقم 01 )',
    analysisText: 'تم انجاز الحصة الخاصة بـ: التحضير البدني العام بنسبة ...... %\n\nوذلك بسبب:',
  });

  const [hasAppliedLinkedData, setHasAppliedLinkedData] = useState(false);

  // استخدام hook البطاقات الفنية للإدارة - حسب رقم الحصة
  const { cardData, loading, saveAdminTechnicalCard } = useAdminTechnicalCard(cardNumber);
  const [ageCategoryOptions] = useState<string[]>(STATIC_AGE_CATEGORY_OPTIONS);

  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showRestModal, setShowRestModal] = useState(false);
  const [currentInputRef, setCurrentInputRef] = useState<HTMLInputElement | null>(null);
  const [loadValue, setLoadValue] = useState('');
  const [loadTime, setLoadTime] = useState('');
  const [restLoad, setRestLoad] = useState('');
  const [restTime, setRestTime] = useState('');
  const [lastLoadValue, setLastLoadValue] = useState('');

  // القيم الافتراضية للبطاقة الجديدة
  const defaultHeaderInfo = {
    specialty: 'جودو',
    location: '',
    equipment: 'تاتامي مطاطية / بساط 2x2 متر',
    objectives: '',
    sessionNumber: 90,
    age: 20,
    ageCategory: '',
    gender: 'ذكور'
  };

  const defaultSecondPage = {
    clubName: '',
    clubAddress: '',
    subject: createSubject(cardNumber),
    analysisText: 'تم انجاز الحصة الخاصة بـ: التحضير البدني العام بنسبة ...... %\n\nوذلك بسبب:',
  };

  // تحميل البيانات المحفوظة أو إعادة تعيين للقيم الافتراضية عند تغيير رقم الحصة
  useEffect(() => {
    if (loading) return; // انتظر حتى يتم التحميل
    
    if (cardData && cardData.headerInfo) {
      // توجد بيانات محفوظة لهذه الحصة
      setHeaderInfo({
        specialty: cardData.headerInfo.specialty || defaultHeaderInfo.specialty,
        location: cardData.headerInfo.location || defaultHeaderInfo.location,
        equipment: cardData.headerInfo.equipment || defaultHeaderInfo.equipment,
        objectives: cardData.headerInfo.objectives || defaultHeaderInfo.objectives,
        sessionNumber: cardData.headerInfo.sessionNumber || defaultHeaderInfo.sessionNumber,
        age: cardData.headerInfo.age || defaultHeaderInfo.age,
        ageCategory: cardData.headerInfo.ageCategory || defaultHeaderInfo.ageCategory,
        gender: cardData.headerInfo.gender || defaultHeaderInfo.gender
      });

      if (typeof cardData.trainerEvaluation === 'string') {
        setTrainerEvaluation(cardData.trainerEvaluation);
      } else {
        setTrainerEvaluation('');
      }
      
      if (cardData.secondPage) {
        setSecondPage({
          clubName: cardData.secondPage.clubName || '',
          clubAddress: cardData.secondPage.clubAddress || '',
          subject: cardData.secondPage.subject || createSubject(cardNumber),
          analysisText: cardData.secondPage.analysisText || defaultSecondPage.analysisText,
        });
      } else {
        setSecondPage({ ...defaultSecondPage, subject: createSubject(cardNumber) });
      }

      if (Array.isArray(cardData.tableValues) && containerRef.current) {
        const inputs = containerRef.current.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          'textarea.phase-content-input, textarea.objectives-input, input.content-input, textarea.formations-input, textarea.duration-input, textarea.notes-input, input.content-input'
        );
        cardData.tableValues.forEach((val: string, idx: number) => {
          const el = inputs[idx];
          if (el) {
            el.value = val ?? '';
          }
        });
      }

      refreshTextareas();
    } else {
      // لا توجد بيانات محفوظة - إعادة تعيين للقيم الافتراضية
      setHeaderInfo(defaultHeaderInfo);
      setTrainerEvaluation('');
      setSecondPage({ ...defaultSecondPage, subject: createSubject(cardNumber) });
      
      // إعادة تعيين قيم الجدول للقيم الافتراضية
      if (containerRef.current) {
        const inputs = containerRef.current.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          'textarea.phase-content-input, textarea.objectives-input, input.content-input, textarea.formations-input, textarea.duration-input, textarea.notes-input'
        );
        inputs.forEach((el) => {
          // إعادة تعيين للقيمة الافتراضية من defaultValue أو فارغ
          const defaultVal = el.getAttribute('data-default') || el.defaultValue || '';
          el.value = defaultVal;
        });
      }
      
      refreshTextareas();
    }
  }, [cardData, loading, cardNumber]);

  useEffect(() => {
    setSecondPage(sp => ({
      ...sp,
      clubAddress: headerInfo.location,
    }));
  }, [headerInfo.location]);

  useEffect(() => {
    refreshTextareas();
    return () => cleanupTextareas();
  }, []);

  useEffect(() => {
    refreshTextareas();
  }, [secondPage, headerInfo]);

  useEffect(() => {
    if (!linkedLoadData || !containerRef.current) return;
    setHasAppliedLinkedData(true);
    const unitStr = String(linkedLoadData.unitNumber).padStart(2, '0');
    setCardNumber(unitStr);
    setSecondPage(sp => ({ ...sp, subject: createSubject(unitStr) }));

    const root = containerRef.current;
    const mainPhaseRows = root.querySelectorAll<HTMLTableRowElement>('tr.main-phase');
    mainPhaseRows.forEach(row => {
      const contentCells = row.querySelectorAll<HTMLTableCellElement>('td.content-cell');
      if (contentCells.length < 3) return;
      const intensityInput = contentCells[0].querySelector<HTMLInputElement>('input.content-input');
      const heartRateInput = contentCells[2].querySelector<HTMLInputElement | HTMLTextAreaElement>('input.content-input, textarea.content-input');
      if (intensityInput) intensityInput.value = `${linkedLoadData.intensity}`;
      if (heartRateInput) heartRateInput.value = `${linkedLoadData.heartRate} ن/د`;
    });
    refreshTextareas();
  }, [linkedLoadData]);

  const saveData = async () => {
    try {
      const tableValues: string[] = [];
      if (containerRef.current) {
        const inputs = containerRef.current.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          'textarea.phase-content-input, textarea.objectives-input, input.content-input, textarea.formations-input, textarea.duration-input, textarea.notes-input, input.content-input'
        );
        inputs.forEach((el) => tableValues.push(el.value ?? ''));
      }
      const dataToSave = { headerInfo, trainerEvaluation, secondPage, tableValues };
      await saveAdminTechnicalCard(dataToSave);
      alert(`تم حفظ البطاقة الفنية رقم ${cardNumber} بنجاح - ستظهر لجميع المدربين`);
    } catch (err) {
      alert('حدث خطأ في حفظ البطاقة الفنية');
      console.error('Error saving technical card:', err);
    }
  };

  const updateHeaderInfo = (field: keyof typeof headerInfo, value: any) => {
    setHeaderInfo(prev => ({ ...prev, [field]: value }));
  };

  const openLoadModal = (inputElement: HTMLInputElement) => {
    setCurrentInputRef(inputElement);
    setLoadValue('');
    setLoadTime('');
    setShowLoadModal(true);
  };

  const openRestModal = (inputElement: HTMLInputElement) => {
    setCurrentInputRef(inputElement);
    const cellValue = inputElement.value?.trim();
    if (cellValue) setRestLoad(cellValue);
    else if (lastLoadValue) setRestLoad(lastLoadValue);
    else setRestLoad('');
    setRestTime('');
    setShowRestModal(true);
  };

  const applyLoadCalculation = () => {
    if (currentInputRef && loadValue && loadTime) {
      const load = parseFloat(loadValue);
      const time = parseFloat(loadTime);
      if (!isNaN(load) && !isNaN(time)) {
        const result = load * time;
        currentInputRef.value = result.toString();
        setLastLoadValue(loadValue);
        setShowLoadModal(false);
        setLoadValue('');
        setLoadTime('');
        setCurrentInputRef(null);
        setTimeout(() => calculateRowDuration(currentInputRef), 100);
      }
    }
  };

  const applyRestCalculation = () => {
    if (currentInputRef && restLoad && restTime) {
      const load = parseFloat(restLoad);
      const time = parseFloat(restTime);
      if (!isNaN(load) && !isNaN(time)) {
        // جعل قيمة الراحة مبنية مباشرة على نفس قيمة الحمولة بدون طرح 1
        const rest = load;
        const result = rest * time;
        currentInputRef.value = result.toString();
        setShowRestModal(false);
        setRestLoad('');
        setRestTime('');
        setCurrentInputRef(null);
        setTimeout(() => calculateRowDuration(currentInputRef), 100);
      }
    }
  };

  // دالة مساعدة لتحويل نص المدة إلى دقائق (تدعم د، ث أو رقم عشري)
  const parseDurationToMinutes = (value: string): number => {
    const trimmed = value.trim();
    if (!trimmed) return 0;

    // ثواني: 15ث
    if (trimmed.endsWith('ث')) {
      const num = parseFloat(trimmed.slice(0, -1));
      return isNaN(num) ? 0 : num / 60;
    }

    // دقائق: 1د أو 1 د
    if (trimmed.endsWith('د')) {
      const num = parseFloat(trimmed.slice(0, -1));
      return isNaN(num) ? 0 : num;
    }

    // قيمة رقمية مباشرة تعتبر بالدقائق (تدعم الفواصل)
    const num = parseFloat(trimmed.replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  // دالة مساعدة لتنسيق الدقائق مع تقريب معقول وإزالة الأصفار الزائدة
  const formatMinutes = (value: number): string => {
    const rounded = Number(value.toFixed(2));
    return rounded.toString();
  };

  const calculateRowDuration = (inputElement: HTMLInputElement | null) => {
    if (!inputElement) return;
    const row = inputElement.closest('tr');
    if (!row || !row.classList.contains('main-phase')) return;
    const contentCells = row.querySelectorAll('.content-cell');
    const loadInput = contentCells[1]?.querySelector('input') as HTMLInputElement;
    const restInput = contentCells[3]?.querySelector('input') as HTMLInputElement;
    const loadVal = parseFloat(loadInput?.value || '0');
    const restVal = parseFloat(restInput?.value || '0');
    const rowTotal = loadVal + restVal;
    const durationCell = row.querySelector('.duration-cell textarea') as HTMLTextAreaElement;
    if (durationCell && rowTotal > 0) durationCell.value = `${formatMinutes(rowTotal)}د`;
    calculateTotalDuration();
  };

  const calculateTotalDuration = () => {
    if (!containerRef.current) return;
    const mainPhaseRows = containerRef.current.querySelectorAll('tr.main-phase');
    let totalDurationMinutes = 0;
    mainPhaseRows.forEach(row => {
      const durationCell = row.querySelector('.duration-cell textarea') as HTMLTextAreaElement | null;
      if (!durationCell) return;
      const minutes = parseDurationToMinutes(durationCell.value || '');
      totalDurationMinutes += minutes;
    });
    if (totalDurationMinutes > 0) setHeaderInfo(prev => ({ ...prev, sessionNumber: Number(totalDurationMinutes.toFixed(2)) }));
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
      </Card.Header>

      <Card.Body className="p-2" ref={containerRef}>
        {/* مؤشر التحميل */}
        {loading && (
          <div className="text-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">جاري تحميل البطاقة رقم {cardNumber}...</span>
            </div>
            <p className="mt-2 text-muted">جاري تحميل البطاقة رقم {cardNumber}...</p>
          </div>
        )}
        
        {!loading && (
          <>
        {/* معلومات الرأس */}
        <Row className="mb-3">
          <Col md={6}>
            <div className="header-info" dir="rtl">
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
                    <option key={category} value={category}>{category}</option>
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
            <Button variant="success" onClick={saveData} size="sm" dir="rtl">
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
                  <div className="phase-title" dir="rtl">المرحلة التحضيرية</div>
                </td>
                <td className="phase-content-cell">
                  <Form.Control as="textarea" rows={2} defaultValue="الإستعداد النفسي والانضباط" className="phase-content-input" dir="rtl" />
                </td>
                <td className="objectives-cell">
                  <Form.Control as="textarea" rows={2} defaultValue="- المحافظات&#10;- مراقبة النظافة" className="objectives-input" dir="rtl" />
                </td>
                <td className="content-cell"><Form.Control type="text" defaultValue="" className="content-input" dir="rtl" /></td>
                <td className="content-cell"><Form.Control type="text" className="content-input" dir="rtl" /></td>
                <td className="content-cell"><Form.Control type="text" className="content-input" dir="rtl" /></td>
                <td className="content-cell"><Form.Control type="text" className="content-input" dir="rtl" /></td>
                <td className="formations-cell">
                  <Form.Control as="textarea" rows={2} defaultValue="***************&#10;+" className="formations-input" dir="rtl" />
                </td>
                <td className="duration-cell"><Form.Control as="textarea" rows={2} defaultValue="" className="duration-input" dir="rtl" /></td>
                <td className="notes-cell"><Form.Control as="textarea" rows={2} defaultValue="الهدوء" className="notes-input" dir="rtl" /></td>
              </tr>
              <tr className="prep-phase">
                <td className="phase-content-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="-1- لعبة تسخين: التنين والفارس بإستخدام كومي كاتا&#10;-2- تسخين خاص" className="phase-content-input" dir="rtl" />
                </td>
                <td className="objectives-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="- التنقل على البساط&#10;-1- الإحماء العام: المسك الجيد والتحكم والإفلات على البساط&#10;-2- إحماء المفاصل" className="objectives-input" dir="rtl" />
                </td>
                <td className="content-cell"><Form.Control type="text" defaultValue="" className="content-input" dir="rtl" /></td>
                <td className="content-cell"><Form.Control type="text" className="content-input" dir="rtl" /></td>
                <td className="content-cell"><Form.Control type="text" className="content-input" dir="rtl" /></td>
                <td className="content-cell"><Form.Control type="text" className="content-input" dir="rtl" /></td>
                <td className="formations-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="-1- التنين والفارس بإستخدام كومي كاتا بين طلاب مبتدئين&#10;-2- تسخين مفاصل داخل الدائرة" className="formations-input" dir="rtl" />
                </td>
                <td className="duration-cell"><Form.Control as="textarea" rows={3} defaultValue="العمل بشدة متوسطة&#10;" className="duration-input" dir="rtl" /></td>
                <td className="notes-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="-1- لعبة تسخين: التنين والفارس بإستخدام كومي كاتا&#10;-2- تسخين خاص" className="notes-input" dir="rtl" />
                </td>
              </tr>


              {/* المرحلة الأساسية - ثلاث صفوف */}
              <tr className="main-phase">
                <td rowSpan={3} className="phase-title-cell">
                  <div className="phase-title" dir="rtl">المرحلة الأساسية</div>
                </td>
                <td className="phase-content-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="البدء في أداء التقنية المركبة&#10;ushi mata -osto gari -1" className="phase-content-input" dir="rtl" />
                </td>
                <td className="objectives-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="-1- إتقان المهارة وإيجاد الحل من أجل تنفيذ الإفلات والهجوم بحركة مركبة لتفادي الخروج من منطقة التباري" className="objectives-input" dir="rtl" />
                </td>
                <td className="content-cell"><Form.Control type="text" defaultValue="" className="content-input" dir="rtl" /></td>
                <td className="content-cell" onClick={(e) => { const input = e.currentTarget.querySelector('input'); if (input) openLoadModal(input); }} style={{ cursor: 'pointer', backgroundColor: '#fffacd' }} title="اضغط لحساب الحمولة">
                  <Form.Control type="text" className="content-input load-input" dir="rtl" placeholder="" />
                </td>
                <td className="content-cell"><Form.Control type="text" className="content-input" dir="rtl" /></td>
                <td className="content-cell" onClick={(e) => { const input = e.currentTarget.querySelector('input'); if (input) openRestModal(input); }} style={{ cursor: 'pointer', backgroundColor: '#e0f7fa' }} title="اضغط لحساب الراحة">
                  <Form.Control type="text" className="content-input rest-input" dir="rtl" placeholder="" />
                </td>
                <td className="formations-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="-1- تطبيق حركة بطريقة بالرجلين&#10;-2- حركة في الدورة مع تطبيق الخصم&#10;-3- تطبيق حركة وحركة OSTO GARI&#10;-4- تنفيذ هجمة خفيفة ushi mata وإسقاط الخصم" className="formations-input" dir="rtl" />
                </td>
                <td className="duration-cell"><Form.Control as="textarea" rows={2} defaultValue="العمل بشدة متوسطة&#10;" className="duration-input" dir="rtl" /></td>
                <td className="notes-cell"><Form.Control as="textarea" rows={3} defaultValue="العمل بكرمي&#10;Migi -&#10;Hidari" className="notes-input" dir="rtl" /></td>
              </tr>
              <tr className="main-phase">
                <td className="phase-content-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="أداء تقنية التضحية&#10;tomoe nage" className="phase-content-input" dir="rtl" />
                </td>
                <td className="objectives-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="-2- تنفيذ خطة عدم الخروج من منطقة التباري بتقنية التضحية الخلفية&#10;tomoe nage" className="objectives-input" dir="rtl" />
                </td>
                <td className="content-cell"><Form.Control type="text" defaultValue="" className="content-input" dir="rtl" /></td>
                <td className="content-cell" onClick={(e) => { const input = e.currentTarget.querySelector('input'); if (input) openLoadModal(input); }} style={{ cursor: 'pointer', backgroundColor: '#fffacd' }} title="اضغط لحساب الحمولة">
                  <Form.Control type="text" className="content-input load-input" dir="rtl" placeholder="" />
                </td>
                <td className="content-cell"><Form.Control type="text" className="content-input" dir="rtl" /></td>
                <td className="content-cell" onClick={(e) => { const input = e.currentTarget.querySelector('input'); if (input) openRestModal(input); }} style={{ cursor: 'pointer', backgroundColor: '#e0f7fa' }} title="اضغط لحساب الراحة">
                  <Form.Control type="text" className="content-input rest-input" dir="rtl" placeholder="" />
                </td>
                <td className="formations-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="-1- تنفيذ هجمة خفيفة tomoe nage&#10;مع الخصم أو مع هجمات بعدها" className="formations-input" dir="rtl" />
                </td>
                <td className="duration-cell"><Form.Control as="textarea" rows={2} defaultValue="العمل بشدة متوسطة&#10;" className="duration-input" dir="rtl" /></td>
                <td className="notes-cell"><Form.Control as="textarea" rows={3} defaultValue="البدوء والتوقيف مع الإشارة" className="notes-input" dir="rtl" /></td>
              </tr>
              <tr className="main-phase">
                <td className="phase-content-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="Ne waza" className="phase-content-input" dir="rtl" />
                </td>
                <td className="objectives-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="-Gagarikeiko&#10;-Randori" className="objectives-input" dir="rtl" />
                </td>
                <td className="content-cell"><Form.Control type="text" className="content-input" dir="rtl" /></td>
                <td className="content-cell" onClick={(e) => { const input = e.currentTarget.querySelector('input'); if (input) openLoadModal(input); }} style={{ cursor: 'pointer', backgroundColor: '#fffacd' }} title="اضغط لحساب الحمولة">
                  <Form.Control type="text" className="content-input load-input" dir="rtl" placeholder="" />
                </td>
                <td className="content-cell"><Form.Control type="text" className="content-input" dir="rtl" /></td>
                <td className="content-cell" onClick={(e) => { const input = e.currentTarget.querySelector('input'); if (input) openRestModal(input); }} style={{ cursor: 'pointer', backgroundColor: '#e0f7fa' }} title="اضغط لحساب الراحة">
                  <Form.Control type="text" className="content-input rest-input" dir="rtl" placeholder="" />
                </td>
                <td className="formations-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="في كل الإتجاهات وقلب بهاتهم للتحصيل على تثبيت خفي أو كسر متوازن أرضي" className="formations-input" dir="rtl" />
                </td>
                <td className="duration-cell"><Form.Control as="textarea" rows={2} defaultValue="" className="duration-input" dir="rtl" /></td>
                <td className="notes-cell"><Form.Control as="textarea" rows={3} defaultValue="Ne waza" className="notes-input" dir="rtl" /></td>
              </tr>

              {/* المرحلة النهائية */}
              <tr className="final-phase">
                <td className="phase-title-cell">
                  <div className="phase-title" dir="rtl">المرحلة النهائية</div>
                </td>
                <td className="phase-content-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="Retour au calme&#10;المشي على البساط" className="phase-content-input" dir="rtl" />
                </td>
                <td className="objectives-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="الهدف وضعية تقييمية وتحفيزية" className="objectives-input" dir="rtl" />
                </td>
                <td className="content-cell"><Form.Control type="text" className="content-input" dir="rtl" /></td>
                <td className="content-cell"><Form.Control type="text" className="content-input" dir="rtl" /></td>
                <td className="content-cell"><Form.Control type="text" className="content-input" dir="rtl" /></td>
                <td className="content-cell"><Form.Control type="text" className="content-input" dir="rtl" /></td>
                <td className="formations-cell">
                  <Form.Control as="textarea" rows={3} defaultValue="في كل الإتجاهات تشجيع كل واحد على تقديم عمل أحسن التوجه لفرقة الملابس" className="formations-input" dir="rtl" />
                </td>
                <td className="duration-cell"><Form.Control as="textarea" rows={2} defaultValue="النهاية&#10;" className="duration-input" dir="rtl" /></td>
                <td className="notes-cell"><Form.Control as="textarea" rows={3} defaultValue="Retour au calme المشي على البساط" className="notes-input" dir="rtl" /></td>
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
                  value={secondPage.clubName}
                  readOnly
                  style={{ maxWidth: '260px', display: 'inline-block' }}
                />
              </Col>
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
          .notes-header, .duration-header, .formations-header, .content-header, .objectives-header, .phase-header {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #495057;
          }
          .content-sub-header, .phase-sub-header {
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
          .objectives-input, .formations-input, .notes-input, .phase-content-input {
            font-size: 10px;
            line-height: 1.3;
            resize: none;
            border: none;
            background: transparent;
            width: 100%;
            text-align: center;
          }
          .content-input, .duration-input {
            font-size: 11px;
            border: none;
            background: transparent;
            text-align: center;
            width: 100%;
          }
          .prep-phase { background-color: #f8f9fa; }
          .main-phase { background-color: #e3f2fd; }
          .final-phase { background-color: #f3e5f5; }
          .trainer-evaluation {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #dee2e6;
          }
        `}</style>
          </>
        )}
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
              <Form.Control type="number" value={loadValue} onChange={(e) => setLoadValue(e.target.value)} placeholder="أدخل قيمة الحمولة" autoFocus />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>الوقت (دقيقة)</Form.Label>
              <Form.Control type="number" value={loadTime} onChange={(e) => setLoadTime(e.target.value)} placeholder="أدخل الوقت بالدقائق" />
            </Form.Group>
            {loadValue && loadTime && (
              <div className="alert alert-info" dir="rtl">
                النتيجة: {parseFloat(loadValue) * parseFloat(loadTime)}
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoadModal(false)}>إلغاء</Button>
          <Button variant="primary" onClick={applyLoadCalculation}>موافق</Button>
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
                    value={restLoad}
                    readOnly
                    style={{ backgroundColor: '#d1ecf1', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center', border: '2px solid #0dcaf0' }}
                  />
                  <Form.Text className="text-muted">
                    قيمة الراحة مساوية لقيمة الحمولة: {restLoad}
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>الوقت (دقيقة)</Form.Label>
                  <Form.Control type="number" value={restTime} onChange={(e) => setRestTime(e.target.value)} placeholder="أدخل الوقت بالدقائق" autoFocus />
                </Form.Group>
                {restTime && (
                  <div className="alert alert-success" dir="rtl" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    النتيجة النهائية: {parseFloat(restLoad)} × {restTime} = {parseFloat(restLoad) * parseFloat(restTime)}
                  </div>
                )}
              </>
            ) : (
              <div className="alert alert-warning" dir="rtl">يرجى إدخال قيمة في خانة الحمولة أولاً</div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRestModal(false)}>إلغاء</Button>
          <Button variant="primary" onClick={applyRestCalculation} disabled={!restLoad || !restTime}>موافق</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default AdminTechnicalCard;
