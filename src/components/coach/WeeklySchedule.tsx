import React, { useState } from 'react';
import { Card, Table, Form, Row, Col, Button } from 'react-bootstrap';
import type { Club } from '../../types';
import { useWeeklySchedule } from '../../hooks/useFirestore';
import './coach-responsive.css';

interface WeeklyScheduleProps {
  club: Club;
}

interface WeeklyScheduleProps {
  club: Club;
}

interface ScheduleSlot {
  day: string;
  period: 'morning' | 'evening';
  timeSlot: string;
  category: string;
}

// الفئات العمرية
const categories = [
  'مصغر',
  'براعم صغار',
  'براعم',
  'أصاغر',
  'صغار',
  'ناشئين',
  'أواسط',
  'أكابر'
];

// الأيام الافتراضية
const defaultDays = ['السبت', 'الاثنين', 'الخميس'];

// جميع أيام الأسبوع للتخصيص اليدوي
const allDays = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

// الأوقات
const morningTimes = ['8:00 - 9:30', '9:30 - 11:00', '11:00 - 12:30'];
const eveningTimes = ['14:00 - 15:30', '15:30 - 17:00', '17:00 - 18:30', '18:30 - 20:00'];

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ club }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<string[]>(defaultDays);
  const [manualDaySelection, setManualDaySelection] = useState<boolean>(false);

  // استخدام Firestore بدلاً من localStorage
  const { schedule, setSchedule, loading, error, saveSchedule: saveScheduleToFirestore } = useWeeklySchedule(club.id);

  // حفظ البرنامج
  const saveSchedule = async () => {
    try {
      await saveScheduleToFirestore(schedule);
      alert('تم حفظ البرنامج الأسبوعي بنجاح');
    } catch (err) {
      alert('حدث خطأ في حفظ البرنامج الأسبوعي');
      console.error('Error saving schedule:', err);
    }
  };

  // الحصول على الوقت المحجوز للفئة المختارة
  const getScheduledTime = (day: string, period: 'morning' | 'evening'): string => {
    const slot = schedule.find(s => s.day === day && s.period === period && s.category === selectedCategory);
    return slot ? slot.timeSlot : '';
  };

  // التحقق من وجود حجز لأي فئة في وقت معين
  const isTimeReserved = (day: string, period: 'morning' | 'evening', timeSlot: string): boolean => {
    return schedule.some(s => s.day === day && s.period === period && s.timeSlot === timeSlot);
  };

  // الحصول على الفئة التي حجزت الوقت
  const getReservedCategory = (day: string, period: 'morning' | 'evening', timeSlot: string): string => {
    const slot = schedule.find(s => s.day === day && s.period === period && s.timeSlot === timeSlot);
    return slot ? slot.category : '';
  };

  // تحديد الوقت
  const setTimeSlot = (day: string, period: 'morning' | 'evening', timeSlot: string) => {
    if (!selectedCategory) {
      alert('يرجى اختيار الفئة أولاً');
      return;
    }

    // التحقق من وجود تضارب مع فئة أخرى
    const conflictSlot = schedule.find(s =>
      s.day === day && s.period === period && s.timeSlot === timeSlot && s.category !== selectedCategory
    );

    if (conflictSlot) {
      alert(`هذا الوقت محجوز للفئة: ${conflictSlot.category}`);
      return;
    }

    // إزالة الحجز السابق للفئة في نفس اليوم والفترة
    setSchedule(prev => prev.filter(s =>
      !(s.day === day && s.period === period && s.category === selectedCategory)
    ));

    // إضافة الحجز الجديد
    if (timeSlot) {
      setSchedule(prev => [...prev, {
        day,
        period,
        timeSlot,
        category: selectedCategory
      }]);
    }
  };

  // طباعة البرنامج الأسبوعي - طباعة الجدول فقط بدون الهيدر والفوتر والقوائم العلوية
  const printWeeklySchedule = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>البرنامج الأسبوعي - ${selectedCategory || 'جميع الفئات'}</title>
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
          h2 { 
            text-align: center; 
            margin-bottom: 20px; 
            color: #1976d2; 
            font-size: 16px;
          }
          .morning-row {
            background-color: #fff3cd;
          }
          .evening-row {
            background-color: #d1ecf1;
          }
          @media print {
            body { margin: 0; }
            table { font-size: 10px; }
            th, td { padding: 4px; }
          }
        </style>
      </head>
      <body>
        <h2>البرنامج الأسبوعي - ${selectedCategory || 'جميع الفئات'}</h2>
        <table>
          <thead>
            <tr>
              <th>الفترة</th>
              ${selectedDays.map(day => `<th>${day}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr class="morning-row">
              <td><strong>صباحاً</strong></td>
              ${selectedDays.map(day => {
                const time = getScheduledTime(day, 'morning');
                const category = schedule.find(s => s.day === day && s.period === 'morning' && s.timeSlot === time)?.category || '';
                return `<td>${time ? `${time}<br/><small>(${category})</small>` : '-'}</td>`;
              }).join('')}
            </tr>
            <tr class="evening-row">
              <td><strong>مساءً</strong></td>
              ${selectedDays.map(day => {
                const time = getScheduledTime(day, 'evening');
                const category = schedule.find(s => s.day === day && s.period === 'evening' && s.timeSlot === time)?.category || '';
                return `<td>${time ? `${time}<br/><small>(${category})</small>` : '-'}</td>`;
              }).join('')}
            </tr>
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

  // تبديل تحديد الأيام
  const toggleDaySelection = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <Card className="shadow-sm weekly-schedule">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0 text-center" dir="rtl">
          <i className="fas fa-calendar-week me-2"></i>
          البرنامج الأسبوعي
        </h5>
      </Card.Header>
      <Card.Body className="p-4">
        {/* الفلاتر */}
        <Row className="mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="text-end d-block fw-bold" dir="rtl">
                الفئة:
              </Form.Label>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-end"
                dir="rtl"
              >
                <option value="">اختر الفئة</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Check
                type="switch"
                id="manual-days"
                label="تخصيص يدوي للأيام"
                checked={manualDaySelection}
                onChange={(e) => setManualDaySelection(e.target.checked)}
                className="text-end"
                dir="rtl"
              />
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end">
            <Button
              variant="success"
              onClick={saveSchedule}
              className="w-100"
              dir="rtl"
            >
              <i className="fas fa-save me-2"></i>
              حفظ البرنامج الأسبوعي
            </Button>
          </Col>
        </Row>

        {/* تحديد الأيام يدوياً */}
        {manualDaySelection && (
          <Row className="mb-4">
            <Col>
              <div className="text-end" dir="rtl">
                <strong>اختر الأيام:</strong>
                <div className="mt-2">
                  {allDays.map(day => (
                    <Form.Check
                      key={day}
                      inline
                      type="checkbox"
                      id={`day-${day}`}
                      label={day}
                      checked={selectedDays.includes(day)}
                      onChange={() => toggleDaySelection(day)}
                      className="me-3"
                    />
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        )}

        {/* معلومات */}
        <div className="text-muted small text-end mb-3" dir="rtl">
          <i className="fas fa-info-circle me-1"></i>
          لا يمكن اختيار نفس الوقت لفئتين مختلفتين
          <br />
          <i className="fas fa-square me-1 text-success"></i>
          الأوقات المتاحة للحجز (أخضر)
          <br />
          <i className="fas fa-square me-1 text-dark"></i>
          الأوقات المحجوزة (أسود)
        </div>

        {/* جدول البرنامج */}
        <div className="table-responsive">
          <Table bordered hover className="text-center coach-table">
            <thead className="table-dark">
              <tr>
                <th className="text-center" dir="rtl"></th>
                {selectedDays.map(day => (
                  <th key={day} className="text-center" dir="rtl">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* الفترة الصباحية */}
              <tr>
                <td className="fw-bold text-center bg-light" dir="rtl">
                  صباحاً
                </td>
                {selectedDays.map(day => (
                  <td key={`${day}-morning`} className="p-2">
                    <Form.Select
                      size="sm"
                      value={getScheduledTime(day, 'morning') || ''}
                      onChange={(e) => setTimeSlot(day, 'morning', e.target.value)}
                      className={`text-center ${getScheduledTime(day, 'morning') ? 'bg-dark text-white' : 'bg-success text-white'}`}
                      dir="rtl"
                    >
                      <option value="">اختر الوقت</option>
                      {morningTimes.map(time => {
                        const isReserved = isTimeReserved(day, 'morning', time);
                        const reservedCategory = getReservedCategory(day, 'morning', time);
                        return (
                          <option
                            key={time}
                            value={time}
                            disabled={isReserved && reservedCategory !== selectedCategory}
                            style={{
                              backgroundColor: isReserved ? '#343a40' : '#198754',
                              color: 'white'
                            }}
                          >
                            {time} {isReserved ? `(${reservedCategory})` : ''}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </td>
                ))}
              </tr>

              {/* الفترة المسائية */}
              <tr>
                <td className="fw-bold text-center bg-light" dir="rtl">
                  مساءً
                </td>
                {selectedDays.map(day => (
                  <td key={`${day}-evening`} className="p-2">
                    <Form.Select
                      size="sm"
                      value={getScheduledTime(day, 'evening') || ''}
                      onChange={(e) => setTimeSlot(day, 'evening', e.target.value)}
                      className={`text-center ${getScheduledTime(day, 'evening') ? 'bg-dark text-white' : 'bg-success text-white'}`}
                      dir="rtl"
                    >
                      <option value="">اختر الوقت</option>
                      {eveningTimes.map(time => {
                        const isReserved = isTimeReserved(day, 'evening', time);
                        const reservedCategory = getReservedCategory(day, 'evening', time);
                        return (
                          <option
                            key={time}
                            value={time}
                            disabled={isReserved && reservedCategory !== selectedCategory}
                            style={{
                              backgroundColor: isReserved ? '#343a40' : '#198754',
                              color: 'white'
                            }}
                          >
                            {time} {isReserved ? `(${reservedCategory})` : ''}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </td>
                ))}
              </tr>
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WeeklySchedule;
