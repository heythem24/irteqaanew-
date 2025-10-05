import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { formatDate } from '../../utils/date';
import { Card } from 'react-bootstrap';
import type { DailyWellness, InjuryRecord, MedicalAppointment, Treatment } from '../../types/medical';
import { InjuryStatus } from '../../types/medical';

// دالة ترجمة أنواع العلاج إلى العربية
const getTreatmentTypeInArabic = (treatmentType: string): string => {
  const translations: Record<string, string> = {
    'rehabilitation': 'إعادة تأهيل',
    'physiotherapy': 'علاج طبيعي',
    'medication': 'علاج دوائي',
    'surgery': 'جراحة',
    'rest': 'راحة',
    'ice_therapy': 'علاج بالثلج',
    'heat_therapy': 'علاج بالحرارة',
    'massage': 'تدليك علاجي',
    'exercise_therapy': 'علاج بالتمارين'
  };
  return translations[treatmentType.toLowerCase()] || treatmentType;
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface MedicalChartsProps {
  type: 'injuries' | 'appointments' | 'treatments' | 'wellness';
  data: DailyWellness[] | InjuryRecord[] | MedicalAppointment[] | Treatment[];
}

const MedicalCharts: React.FC<MedicalChartsProps> = ({ type, data }) => {
  const getChartData = () => {
    switch (type) {
      case 'injuries':
        const injuries = data as InjuryRecord[];
        const injuryStatusData = {
          labels: ['نشطة', 'قيد الشفاء', 'مكتملة'],
  datasets: [{
    label: 'الإصابات حسب الحالة',
    data: [
      injuries.filter(i => i.status === InjuryStatus.ACTIVE).length,
      injuries.filter(i => i.status === InjuryStatus.RECOVERING).length,
      injuries.filter(i => i.status === InjuryStatus.RECOVERED).length
    ],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 205, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)'
            ],
            borderWidth: 1
          }]
        };
        return injuryStatusData;

      case 'appointments':
        const appointments = data as MedicalAppointment[];
        const appointmentStatusData = {
          labels: ['مجدول', 'مكتمل', 'ملغي'],
          datasets: [{
            label: 'المواعيد حسب الحالة',
            data: [
              appointments.filter(a => a.status === 'scheduled').length,
              appointments.filter(a => a.status === 'completed').length,
              appointments.filter(a => a.status === 'cancelled').length
            ],
            backgroundColor: [
              'rgba(40, 167, 69, 0.8)', // أخضر واضح بدلاً من الأزرق الفاتح
              'rgba(23, 162, 184, 0.8)', // أزرق متوسط
              'rgba(220, 53, 69, 0.8)'   // أحمر
            ],
            borderColor: [
              'rgb(40, 167, 69)',
              'rgb(23, 162, 184)',
              'rgb(220, 53, 69)'
            ],
            borderWidth: 1
          }]
        };
        return appointmentStatusData;

      case 'treatments':
        const treatments = data as Treatment[];
        const treatmentTypes = treatments.reduce((acc, treatment) => {
          const arabicType = getTreatmentTypeInArabic(treatment.treatmentType);
          acc[arabicType] = (acc[arabicType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const treatmentChartData = {
          labels: Object.keys(treatmentTypes),
          datasets: [{
            label: 'أنواع العلاج',
            data: Object.values(treatmentTypes),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 205, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)',
              'rgb(255, 159, 64)'
            ],
            borderWidth: 1
          }]
        };
        return treatmentChartData;

      case 'wellness':
        const wellness = data as DailyWellness[];
        const sortedWellness = wellness.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const wellnessChartData = {
          labels: sortedWellness.map(w => formatDate(w.date)),
          datasets: [{
            label: 'مؤشر الصحة',
            data: sortedWellness.map(w => w.wellnessScore),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.1
          }]
        };
        return wellnessChartData;

      default:
        return null;
    }
  };

  const chartData = getChartData();
  if (!chartData) return null;

  const getChartOptions = () => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: type === 'injuries' ? 'توزيع حالات الإصابات' :
              type === 'appointments' ? 'توزيع حالات المواعيد' :
              type === 'treatments' ? 'توزيع أنواع العلاج' :
              'تدرج مؤشر الصحة'
      }
    },
    scales: type === 'wellness' ? {
      y: {
        beginAtZero: true,
        max: 5
      }
    } : undefined
  });

  const renderChart = () => {
    if (type === 'wellness') {
      return <Line data={chartData} options={getChartOptions()} />;
    } else {
      return <Pie data={chartData} options={getChartOptions()} />;
    }
  };

  return (
    <Card className="mt-3">
      <Card.Body>
        <div style={{ height: '300px' }}>
          {renderChart()}
        </div>
      </Card.Body>
    </Card>
  );
};

export default MedicalCharts;
