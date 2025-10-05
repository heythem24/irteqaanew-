import React from 'react';
import { formatMonthDay } from '../../utils/date';
import type { DailyWellness } from '../../types/medical';

interface Props {
  data: DailyWellness[];
  height?: number;
}

const WellnessChart: React.FC<Props> = ({ data, height = 300 }) => {
  if (data.length === 0) {
    return (
      <div 
        style={{ height }} 
        className="d-flex align-items-center justify-content-center text-muted"
      >
        <div className="text-center">
          <div style={{ fontSize: '3rem' }}>📊</div>
          <p>لا توجد بيانات للعرض</p>
          <small>ابدأ بتسجيل التقييم اليومي لرؤية الرسم البياني</small>
        </div>
      </div>
    );
  }

  // ترتيب البيانات حسب التاريخ (من الأقدم للأحدث للعرض RTL)
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // حساب النقاط للرسم
  const maxValue = 5;
  const minValue = 1;
  const chartWidth = 100; // النسبة المئووية للعرض
  const chartHeight = height - 90; // ترك مساحة أكبر للتسميات والمؤشرات

  // تعديل حساب المواضع للعرض RTL (من اليمين لليسار)
  const getPointPosition = (index: number, value: number) => {
    const x = ((sortedData.length - 1 - index) / Math.max(sortedData.length - 1, 1)) * chartWidth;
    const y = chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
    return { x, y };
  };

  // إنشاء نقاط الخط
  const points = sortedData.map((item, index) => {
    const { x, y } = getPointPosition(index, item.wellnessScore);
    return `${x},${y}`;
  }).join(' ');

  // تم حذف مسار التعبئة لأننا نستخدم الخط فقط

  // ألوان الخطوط حسب القيم
  const getScoreColor = (score: number) => {
    if (score >= 4) return '#1e7e34'; // أخضر داكن أوضح
    if (score >= 3) return '#d39e00'; // أصفر داكن
    return '#c82333'; // أحمر داكن
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4) return 'ممتاز';
    if (score >= 3) return 'جيد';
    return 'ضعيف';
  };

  // حساب متوسط النقاط للون الخط
  const avgScore = sortedData.reduce((sum, item) => sum + item.wellnessScore, 0) / sortedData.length;
  const lineColor = getScoreColor(avgScore);
  const avgLabel = getScoreLabel(avgScore);

  return (
    <div style={{ height, position: 'relative' }}>
      {/* الرسم البياني */}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* خطوط المرجع الأفقية فقط */}
        {[1, 2, 3, 4, 5].map((value) => {
          const y = chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight + 50;
          return (
            <line
              key={value}
              x1="15"
              y1={y}
              x2="95"
              y2={y}
              stroke="#e9ecef"
              strokeWidth="0.15"
              strokeDasharray="0.8,0.8"
            />
          );
        })}

        {/* تم إزالة المنطقة المملوءة للاكتفاء بالخط فقط */}

        {/* خط البيانات الرئيسي - خط فقط بدون تعبئة */}
        <polyline
          points={points.split(' ').map((point) => {
            const [x, y] = point.split(',').map(Number);
            return `${x + 10},${y + 50}`;
          }).join(' ')}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* النقاط - محسنة للخط الجديد */}
        {sortedData.map((item, index) => {
          const { x, y } = getPointPosition(index, item.wellnessScore);
          const pointColor = getScoreColor(item.wellnessScore);
          
          return (
            <g key={index}>
              <circle
                cx={x + 10}
                cy={y + 50}
                r="1.2"
                fill={pointColor}
                stroke="white"
                strokeWidth="0.4"
              />
              
              {/* تسمية النقطة */}
              <text
                x={x + 10}
                y={y + 44}
                fontSize="8"
                fill={pointColor}
                textAnchor="middle"
                fontWeight="bold"
              >
                {item.wellnessScore.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* تسميات التواريخ - RTL من اليمين لليسار */}
      <div 
        style={{ 
          position: 'absolute', 
          bottom: '5px', 
          left: '10%', 
          right: '5%', 
          display: 'flex', 
          justifyContent: 'space-between',
          flexDirection: 'row-reverse', // عكس الاتجاه للـ RTL
          fontSize: '12px',
          color: '#6c757d'
        }}
      >
        {sortedData.map((item, index) => {
          // عرض التواريخ للنقاط الرئيسية فقط
          const showLabel = index === 0 || 
                          index === sortedData.length - 1 || 
                          index % Math.ceil(sortedData.length / 5) === 0;
          
          if (!showLabel) return null;
          
          return (
            <span key={index}>{formatMonthDay(item.date)}</span>
          );
        })}
      </div>

      {/* ملخص الإحصائيات */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '11px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <div className="text-center">
          <div style={{ color: lineColor, fontWeight: 'bold' }}>
            {avgLabel}: {avgScore.toFixed(1)}
          </div>
          <div className="text-muted">
            {sortedData.length} يوم
          </div>
        </div>
      </div>

      {/* أرقام المحور الرأسي - HTML عادي واضح */}
      <div style={{ position: 'absolute', left: '5px', top: '50px', height: `${chartHeight}px` }}>
        {[1, 2, 3, 4, 5].map((value) => {
          const yPercent = ((value - minValue) / (maxValue - minValue)) * 100;
          const yPosition = chartHeight - (yPercent / 100) * chartHeight;
          return (
            <div
              key={value}
              style={{
                position: 'absolute',
                top: `${yPosition - 8}px`,
                fontSize: '14px',
                fontWeight: '600',
                color: '#495057',
                lineHeight: '16px'
              }}
            >
              {value}
            </div>
          );
        })}
      </div>

      {/* مؤشرات الألوان - نقلت إلى الأعلى */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px',
          display: 'flex',
          gap: '8px',
          fontSize: '10px',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '6px 8px',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <div className="d-flex align-items-center">
          <div 
            style={{ 
              width: '12px', 
              height: '3px', 
              backgroundColor: '#1e7e34',
              borderRadius: '1px',
              marginRight: '3px' 
            }}
          />
          <span>ممتاز (4+)</span>
        </div>
        <div className="d-flex align-items-center">
          <div 
            style={{ 
              width: '12px', 
              height: '3px', 
              backgroundColor: '#d39e00',
              borderRadius: '1px', 
              marginRight: '3px' 
            }}
          />
          <span>جيد (3-4)</span>
        </div>
        <div className="d-flex align-items-center">
          <div 
            style={{ 
              width: '12px', 
              height: '3px', 
              backgroundColor: '#c82333',
              borderRadius: '1px', 
              marginRight: '3px' 
            }}
          />
          <span>ضعيف (أقل من 3)</span>
        </div>
      </div>
    </div>
  );
};

export default WellnessChart;
