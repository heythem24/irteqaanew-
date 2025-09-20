import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Row, Col, Button, Table } from 'react-bootstrap';
import type { Club } from '../../types';
import { useTechnicalCard } from '../../hooks/useFirestore';
import { UsersService as UserService } from '../../services/firestoreService';
import './TechnicalCard.css';
import './coach-responsive.css';

interface TechnicalCardProps {
  club: Club;
}



const TechnicalCard: React.FC<TechnicalCardProps> = ({ club }) => {
  // Get current user for trainer name
  const currentUser = UserService.getCurrentUser();
  const trainerName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'المدرب' : 'المدرب';

  const [headerInfo, setHeaderInfo] = useState({
    trainer: trainerName,
    specialty: 'جودو',
    location: 'قاعة النادي بالمركز الثقافي البدني عين البيضاء',
    equipment: 'تاتامي مطاطية / بساط 2x2 متر',
    objectives: 'أفكار خطة عدم الخروج من منطقة التدريب عن طريق تنفيذ هجمة مضادة مركبة "ushi mata -osto gari" بتقنية الشخصية tomoe nage',
    sessionNumber: 90,
    age: 20
  });

  // Reference to container to collect inputs without converting all to controlled
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Extra editable sections' state
  const [trainerEvaluation, setTrainerEvaluation] = useState<string>('');
  const [secondPage, setSecondPage] = useState({
    clubName: '',
    coachName: '',
    clubAddress: '',
    ageCategory: '',
    subject: 'تحليل الحصة ( مذكرة رقم 01 )',
    analysisText: 'تم انجاز الحصة الخاصة بـ: التحضير البدني العام بنسبة ...... %\n\nوذلك بسبب:',
  });

  // استخدام Firestore بدلاً من localStorage
  const { cardData, saveTechnicalCard } = useTechnicalCard(club.id);

  // تحميل البيانات المحفوظة مع الحفاظ على اسم المدرب الحالي
  useEffect(() => {
    if (cardData && cardData.headerInfo) {
      setHeaderInfo(prev => ({
        ...cardData.headerInfo,
        trainer: trainerName // الحفاظ على اسم المدرب الحالي
      }));

      // Load extra sections
      if (typeof cardData.trainerEvaluation === 'string') {
        setTrainerEvaluation(cardData.trainerEvaluation);
      }
      if (cardData.secondPage) {
        setSecondPage((sp) => ({
          clubName: cardData.secondPage.clubName || '',
          coachName: cardData.secondPage.coachName || '',
          clubAddress: cardData.secondPage.clubAddress || '',
          ageCategory: cardData.secondPage.ageCategory || '',
          subject: cardData.secondPage.subject || sp.subject,
          analysisText: cardData.secondPage.analysisText || sp.analysisText,
        }));
      }

      // Apply saved table values back into inputs by DOM order
      if (Array.isArray(cardData.tableValues) && containerRef.current) {
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
    }
  }, [cardData, trainerName]);

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

  // طباعة البطاقة الفنية - طباعة الجدول فقط بدون الهيدر والفوتر والقوائم العلوية
  const printTechnicalCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>البطاقة الفنية - ${headerInfo.trainer}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            direction: rtl;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 0 auto;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
          }
          th {
            background-color: #e3f2fd;
            font-weight: bold;
            font-size: 11px;
          }
          .phase-title-cell {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .phase-title {
            writing-mode: vertical-rl;
            text-orientation: mixed;
            transform: rotate(180deg);
            white-space: nowrap;
          }
          h2 { 
            text-align: center; 
            margin-bottom: 20px; 
            color: #1976d2; 
            font-size: 16px;
          }
          @media print {
            body { margin: 0; }
            table { font-size: 10px; }
            th, td { padding: 4px; }
          }
        </style>
      </head>
      <body>
        <h2>البطاقة الفنية - ${headerInfo.trainer}</h2>
        <table>
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
              <th>الحمولة</th>
              <th>الشدة</th>
              <th>التكرار</th>
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
                    const text = cell.textContent?.trim() || '';
                    const className = cell.className || '';
                    return `<td colspan="${colspan}" rowspan="${rowspan}" class="${className}">${text}</td>`;
                  }).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(tableContent);
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
          <h5 className="mb-0" dir="rtl">
            <i className="fas fa-clipboard-list me-2"></i>
            البطاقة الفنية
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
              <div>
                <strong>الأهــــداف:</strong>
                <Form.Control
                  as="textarea"
                  rows={4}
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
                <th className="content-sub-header" dir="rtl">الحمولة</th>
                <th className="content-sub-header" dir="rtl">الشدة</th>
                <th className="content-sub-header" dir="rtl">التكرار</th>
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
                    defaultValue="-1- تطبيق حركة بطريقة بالرجلين&#10;-2- حركة في الدورة مع تطبيق الخصم&#10;-3- تطبيق حركة وحركة OSTO GARI&#10;-4- تنفيذ هجمة خفيفة ushi mata وإسقاط الخصم"
                    className="formations-input"
                    dir="rtl"
                  />
                </td>
                <td className="duration-cell">
                  <Form.Control
                    type="text"
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
                    defaultValue="-1- تنفيذ هجمة خفيفة tomoe nage&#10;مع الخصم أو مع هجمات بعدها"
                    className="formations-input"
                    dir="rtl"
                  />
                </td>
                <td className="duration-cell">
                  <Form.Control
                    type="text"
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
                    defaultValue="في كل الإتجاهات وقلب بهاتهم للتحصيل على تثبيت خفي أو كسر متوازن أرضي"
                    className="formations-input"
                    dir="rtl"
                  />
                </td>
                <td className="duration-cell">
                  <Form.Control
                    type="text"
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
                    type="text"
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
            marginBottom: '20px',
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
                  onChange={(e) => setSecondPage(sp => ({ ...sp, clubName: e.target.value }))}
                  style={{ maxWidth: '260px', display: 'inline-block' }}
                />
              </Col>
              <Col md={6} className="text-right d-flex align-items-center gap-2" style={{ justifyContent: 'flex-end' }}>
                <strong className="ms-2">اسم ولقب المربي الرياضي:</strong>
                <Form.Control
                  type="text"
                  size="sm"
                  value={secondPage.coachName}
                  onChange={(e) => setSecondPage(sp => ({ ...sp, coachName: e.target.value }))}
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
                  onChange={(e) => setSecondPage(sp => ({ ...sp, clubAddress: e.target.value }))}
                  style={{ maxWidth: '260px', display: 'inline-block' }}
                />
              </Col>
              <Col md={6} className="text-right d-flex align-items-center gap-2" style={{ justifyContent: 'flex-end' }}>
                <strong className="ms-2">الفئة العمرية:</strong>
                <Form.Control
                  type="text"
                  size="sm"
                  value={secondPage.ageCategory}
                  onChange={(e) => setSecondPage(sp => ({ ...sp, ageCategory: e.target.value }))}
                  style={{ maxWidth: '200px', display: 'inline-block' }}
                />
                <strong className="ms-2">سنة</strong>
              </Col>
            </Row>
          </div>

          <div className="text-center mb-3">
            <div style={{
              background: 'linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)',
              border: '2px solid #03a9f4',
              borderRadius: '15px',
              padding: '10px',
              display: 'inline-block',
              fontWeight: 'bold'
            }}>
              الموضوع: {secondPage.subject}
            </div>
          </div>

          <div style={{
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
    </Card>
  );
};

export default TechnicalCard;
