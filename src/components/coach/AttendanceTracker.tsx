import React, { useState, useMemo, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Badge } from 'react-bootstrap';
import type { Club, User } from '../../types';
import { useAttendance } from '../../hooks/useFirestore';
import { useCoachData } from '../../hooks/useCoachData';
import { UsersService as UserService } from '../../services/firestoreService';
import './AttendanceTracker.css';
import './coach-responsive.css';

interface AttendanceTrackerProps {
  club: Club;
}

interface AttendanceRecord {
  athleteId: string;
  date: string; // YYYY-MM-DD format
  isAbsent: boolean;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ club }) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  
  // استخدام Firestore بدلاً من localStorage
  const { attendanceData, setAttendanceData, saveAttendance } = useAttendance(club.id);
  // Get roster and coach info
  const currentUser = UserService.getCurrentUser();
  const coachId = currentUser?.id || '';
  const { athleteRoster } = useCoachData({ clubId: club.id, coachId, enableRealtime: true });

  // Load athletes for this club from Firestore user system
  const [clubAthletes, setClubAthletes] = useState<User[]>([]);
  useEffect(() => {
    const fetchAthletes = async () => {
      if (!club.id) return;
      try {
        const athletes = await UserService.getAthletesByClub(club.id);
        setClubAthletes(athletes);
      } catch (e) {
        console.error('Failed to fetch club athletes for attendance:', e);
      }
    };
    fetchAthletes();
  }, [club.id]);

  // Only show athletes that are registered/active in roster
  const displayedAthletes = useMemo(() => {
    const active = athleteRoster.filter(r => r.isActive !== false);
    if (active.length === 0) {
      // Fallback: show all club athletes if roster isn't ready/empty so names appear
      return clubAthletes;
    }
    const activeIds = new Set(active.map(r => r.athleteId));
    return clubAthletes.filter(a => activeIds.has(a.id));
  }, [clubAthletes, athleteRoster]);

  // Academic year months (September to June)
  const academicMonths = [
    { value: 8, label: 'سبتمبر', name: 'September' },
    { value: 9, label: 'أكتوبر', name: 'October' },
    { value: 10, label: 'نوفمبر', name: 'November' },
    { value: 11, label: 'ديسمبر', name: 'December' },
    { value: 0, label: 'جانفي', name: 'January' },
    { value: 1, label: 'فيفري', name: 'February' },
    { value: 2, label: 'مارس', name: 'March' },
    { value: 3, label: 'أفريل', name: 'April' },
    { value: 4, label: 'ماي', name: 'May' },
    { value: 5, label: 'جوان', name: 'June' }
  ];

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for a specific date
  const getDayOfWeek = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  // Generate days array for the selected month
  const monthDays = useMemo(() => {
    const daysCount = getDaysInMonth(selectedYear, selectedMonth);
    const days = [];
    
    for (let day = 1; day <= daysCount; day++) {
      days.push({
        day,
        dayOfWeek: getDayOfWeek(selectedYear, selectedMonth, day),
        date: `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      });
    }
    
    return days;
  }, [selectedYear, selectedMonth]);

  // Check if athlete is absent on a specific date
  const isAbsent = (athleteId: string, date: string) => {
    return attendanceData.some(record => 
      record.athleteId === athleteId && 
      record.date === date && 
      record.isAbsent
    );
  };

  // Toggle attendance for an athlete on a specific date
  const toggleAttendance = (athleteId: string, date: string) => {
    setAttendanceData((prev: AttendanceRecord[]) => {
      const existingRecord = prev.find((record: AttendanceRecord) => 
        record.athleteId === athleteId && record.date === date
      );

      if (existingRecord) {
        // Toggle existing record
        return prev.map((record: AttendanceRecord) => 
          record.athleteId === athleteId && record.date === date
            ? { ...record, isAbsent: !record.isAbsent }
            : record
        );
      } else {
        // Add new absence record
        return [...prev, { athleteId, date, isAbsent: true }];
      }
    });
  };

  // Get current month label
  const getCurrentMonthLabel = () => {
    const monthData = academicMonths.find(m => m.value === selectedMonth);
    return monthData ? monthData.label : '';
  };

  // Generate years for selection (current year ± 5)
  const availableYears = [];
  for (let year = currentDate.getFullYear() - 5; year <= currentDate.getFullYear() + 5; year++) {
    availableYears.push(year);
  }

  // Check if a date is today
  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return today.getFullYear() === year &&
           today.getMonth() === month &&
           today.getDate() === day;
  };

  // Check if a date is in the future

  // Get attendance statistics for an athlete in the selected month
  const getAthleteStats = (athleteId: string) => {
    const monthRecords = attendanceData.filter(record =>
      record.athleteId === athleteId &&
      record.date.startsWith(`${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`)
    );

    const absences = monthRecords.filter(record => record.isAbsent).length;
    const totalDays = monthDays.length;
    const attendanceRate = totalDays > 0 ? Math.round(((totalDays - absences) / totalDays) * 100) : 100;

    return { absences, totalDays, attendanceRate };
  };

  // Clear all attendance data for the selected month
  const clearMonthData = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع بيانات الغيابات لهذا الشهر؟')) {
      const monthPrefix = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`;
      setAttendanceData((prev: AttendanceRecord[]) => prev.filter((record: AttendanceRecord) => !record.date.startsWith(monthPrefix)));
    }
  };

  // Mark all athletes as present for a specific day

  // Mark all athletes as absent for a specific day
  const markAllAbsent = (date: string) => {
    setAttendanceData((prev: AttendanceRecord[]) => {
      const newRecords = displayedAthletes.map(athlete => ({ athleteId: athlete.id, date, isAbsent: true }));
      return [...prev.filter(record => record.date !== date), ...newRecords];
    });
  };

  // طباعة قائمة الغيابات - طباعة الجدول فقط بدون الهيدر والفوتر والقوائم العلوية
  const printAttendance = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>قائمة الغيابات - ${getCurrentMonthLabel()} ${selectedYear}</title>
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
            font-size: 10px;
          }
          th, td {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
          }
          th {
            background-color: #e3f2fd;
            font-weight: bold;
            font-size: 9px;
          }
          h2 { 
            text-align: center; 
            margin-bottom: 20px; 
            color: #1976d2; 
            font-size: 16px;
          }
          .absent-cell {
            background-color: #ffebee;
            color: #c62828;
            font-weight: bold;
          }
          @media print {
            body { margin: 0; }
            table { font-size: 8px; }
            th, td { padding: 2px; }
          }
        </style>
      </head>
      <body>
        <h2>قائمة الغيابات - ${getCurrentMonthLabel()} ${selectedYear}</h2>
        <table>
          <thead>
            <tr>
              <th>الرقم</th>
              <th>الاسم واللقب</th>
              ${monthDays.map(day => `<th>${day.day}</th>`).join('')}
              <th>الغيابات</th>
              <th>نسبة الحضور</th>
            </tr>
          </thead>
          <tbody>
            ${displayedAthletes.map((athlete, index) => {
              const stats = getAthleteStats(athlete.id);
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${(athlete.firstNameAr || athlete.firstName || '').trim()} ${(athlete.lastNameAr || athlete.lastName || '').trim()}</td>
                  ${monthDays.map(day => {
                    const absent = isAbsent(athlete.id, day.date);
                    return `<td class="${absent ? 'absent-cell' : ''}">${absent ? 'غ' : ''}</td>`;
                  }).join('')}
                  <td>${stats.absences}</td>
                  <td>${stats.attendanceRate}%</td>
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
      <Card.Header className="bg-info text-white d-flex align-items-center justify-content-between">
        <div></div>
        <h5 className="mb-0 text-center" dir="rtl">
          <i className="fas fa-calendar-check me-2"></i>
          قائمة الغيابات - {club.nameAr}
        </h5>
      </Card.Header>
      <Card.Body className="p-4">
        {/* Filters */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-end d-block" dir="rtl">السنة الدراسية</Form.Label>
              <Form.Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="text-end"
                dir="rtl"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-end d-block" dir="rtl">الشهر</Form.Label>
              <Form.Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="text-end"
                dir="rtl"
              >
                {academicMonths.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Current Selection Info */}
        <div className="mb-3 p-3 bg-light rounded">
          <Row className="align-items-center">
            <Col md={8}>
              <h6 className="mb-0" dir="rtl">
                <i className="fas fa-calendar me-2"></i>
                قائمة الغيابات لشهر {getCurrentMonthLabel()} {selectedYear}
              </h6>
            </Col>
            <Col md={4} className="text-end">
              <Button
                variant="success"
                size="sm"
                onClick={async () => {
                  try {
                    await saveAttendance(attendanceData);
                    alert('تم حفظ بيانات الغيابات بنجاح');
                  } catch (err) {
                    alert('حدث خطأ في حفظ بيانات الغيابات');
                    console.error('Error saving attendance:', err);
                  }
                }}
                className="me-2"
              >
                <i className="fas fa-save me-1"></i>
                حفظ الغيابات
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={clearMonthData}
                className="me-2"
              >
                <i className="fas fa-trash me-1"></i>
                مسح الشهر
              </Button>
              <Button
                variant="info"
                size="sm"
                onClick={printAttendance}
              >
                <i className="fas fa-print me-2"></i>
                طباعة القائمة
              </Button>
            </Col>
          </Row>
        </div>

        {/* Attendance Table */}
        <div className="table-responsive">
          <Table bordered className="text-center attendance-table coach-table">
            <thead className="table-dark">
              <tr>
                <th className="text-center" dir="rtl" style={{ minWidth: '60px' }}>الرقم</th>
                <th className="text-center" dir="rtl" style={{ minWidth: '200px' }}>الاسم واللقب</th>
                {monthDays.map(dayInfo => (
                  <th
                    key={dayInfo.day}
                    className="text-center"
                    style={{
                      minWidth: '40px',
                      fontSize: '12px',
                      backgroundColor: isToday(selectedYear, selectedMonth, dayInfo.day) ? '#e3f2fd' : 'inherit'
                    }}
                  >
                    <div style={{
                      fontWeight: isToday(selectedYear, selectedMonth, dayInfo.day) ? 'bold' : 'normal',
                      color: isToday(selectedYear, selectedMonth, dayInfo.day) ? '#1976d2' : 'inherit'
                    }}>
                      {dayInfo.day}
                    </div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>
                      {dayInfo.dayOfWeek.slice(0, 3)}
                    </div>
                  </th>
                ))}
                <th className="text-center" dir="rtl" style={{ minWidth: '100px' }}>
                  الإحصائيات
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedAthletes.map((athlete, index) => {
                const stats = getAthleteStats(athlete.id);
                return (
                  <tr key={athlete.id}>
                    <td className="align-middle">{index + 1}</td>
                    <td className="text-end align-middle" dir="rtl">
                      {(athlete.firstNameAr || athlete.firstName || '').trim()} {(athlete.lastNameAr || athlete.lastName || '').trim()}
                    </td>
                  {monthDays.map(dayInfo => {
                    const absent = isAbsent(athlete.id, dayInfo.date);
                    return (
                      <td 
                        key={dayInfo.day}
                        className="p-1 align-middle"
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleAttendance(athlete.id, dayInfo.date)}
                      >
                        <div
                          className={`attendance-cell ${absent ? 'absent' : 'present'}`}
                          style={{
                            width: '30px',
                            height: '30px',
                            margin: '0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            backgroundColor: absent ? '#dc3545' : '#f8f9fa',
                            border: '1px solid #dee2e6',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          title={`${absent ? 'غائب' : 'حاضر'} - اضغط للتغيير`}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {absent && (
                            <i className="fas fa-times text-white" style={{ fontSize: '12px' }}></i>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="align-middle text-center">
                    <div style={{ fontSize: '12px' }}>
                      <div className="mb-1">
                        <Badge bg="danger" style={{ fontSize: '10px' }}>
                          {stats.absences} غياب
                        </Badge>
                      </div>
                      <div>
                        <Badge
                          bg={stats.attendanceRate >= 80 ? 'success' : stats.attendanceRate >= 60 ? 'warning' : 'danger'}
                          style={{ fontSize: '10px' }}
                        >
                          {stats.attendanceRate}%
                        </Badge>
                      </div>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {/* Legend */}
        <div className="mt-3 d-flex justify-content-center gap-4">
          <div className="d-flex align-items-center">
            <div 
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                marginLeft: '8px'
              }}
            ></div>
            <span>حاضر</span>
          </div>
          <div className="d-flex align-items-center">
            <div 
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#dc3545',
                borderRadius: '4px',
                marginLeft: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="fas fa-times text-white" style={{ fontSize: '10px' }}></i>
            </div>
            <span>غائب</span>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 bg-light rounded">
          <Row className="text-center">
            <Col md={3}>
              <h6 className="text-primary">إجمالي الرياضيين</h6>
              <h4 className="text-primary">{displayedAthletes.length}</h4>
            </Col>
            <Col md={3}>
              <h6 className="text-success">أيام الشهر</h6>
              <h4 className="text-success">{monthDays.length}</h4>
            </Col>
            <Col md={3}>
              <h6 className="text-warning">إجمالي الغيابات</h6>
              <h4 className="text-warning">
                {attendanceData.filter(record => 
                  record.isAbsent && 
                  record.date.startsWith(`${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`)
                ).length}
              </h4>
            </Col>
            <Col md={3}>
              <h6 className="text-info">معدل الحضور</h6>
              <h4 className="text-info">
                {displayedAthletes.length > 0 && monthDays.length > 0 ? (
                  Math.round(
                    ((displayedAthletes.length * monthDays.length - 
                      attendanceData.filter(record => 
                        record.isAbsent && 
                        record.date.startsWith(`${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`)
                      ).length
                    ) / (displayedAthletes.length * monthDays.length)) * 100
                  )
                ) : 100}%
              </h4>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AttendanceTracker;
