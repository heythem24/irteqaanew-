import React, { useState } from 'react';
import { Card, Dropdown, Table, Button, ButtonGroup } from 'react-bootstrap';
import { TechnicalDirectorService } from '../../services/technicalDirectorService';

interface PeriodisationAnnuelleProps {
  clubId: string;
}

const PeriodisationAnnuelle: React.FC<PeriodisationAnnuelleProps> = ({ clubId }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('Septembre');
  const [editableData, setEditableData] = useState<any>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // بيانات الأشهر (10 أشهر فقط من سبتمبر إلى جوان)
  const months = [
    { name: 'Septembre' },
    { name: 'Octobre' },
    { name: 'Novembre' },
    { name: 'Décembre' },
    { name: 'Janvier' },
    { name: 'Février' },
    { name: 'Mars' },
    { name: 'Avril' },
    { name: 'Mai' },
    { name: 'Juin' }
  ];

  // بيانات الأشهر
  const monthsData = {
    'Septembre': {
      mesocycle: 'Méso-cycle 1',
      preparation: 'Préparation physique générale',
      microcycles: [
        { id: '01', title: 'Vitesse Gestuel+\nAdresse+\nSouplesse' },
        { id: '02', title: 'Vitesse Gestuel+\nAdresse+\nSouplesse' },
        { id: '03', title: 'Vitesse Gestuel+\nAdresse+\nSouplesse' },
        { id: '04', title: 'Vitesse Gestuel+\nAdresse+\nSouplesse' }
      ],
      sessions: {
        dates: [3, 6, 7, 10, 13, 14, 17, 20, 21, 24, 27, 28],
        days: ['Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa']
      },
      activities: {
        'Vitesse Gestuel': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // أصفر لكل الحصص
        'Adresse': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // أصفر لكل الحصص
        'Souplesse': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // بنفسجي لكل الحصص
        'Jeux': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] // أسود لكل الحصص
      }
    },
    'Octobre': {
      mesocycle: 'Méso-cycle 2',
      preparation: 'Préparation physique Spécifique',
      preparation2: 'Apprentissage des Chutes',
      microcycles: [
        { id: '01', title: 'Souplesse+' },
        { id: '02', title: 'Vitesse Gestuel+\nAdresse' },
        { id: '03', title: 'Vitesse Gestuel+\nSouplesse+' },
        { id: '04', title: 'Adresse+\nSouplesse+' }
      ],
      sessions: {
        dates: [1, 4, 5, 8, 11, 12, 15, 18, 19, 22, 25, 26, 29],
        days: ['Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma']
      },
      activities: {
        'Vitesse Gestuel': [0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0], // أصفر في مواضع محددة
        'Adresse': [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0], // رمادي في مواضع محددة
        'Souplesse': [1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1], // بنفسجي في مواضع محددة
        'Jeux': [1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0] // أسود في المواضع: 1, 4, 5, 15, 18, 22, 26
      }
    },
    'Novembre': {
      mesocycle: 'Méso-cycle 3',
      preparation: 'Apprentissage des :',
      preparation2: 'Chutes\ntechnique Nage Waza ( O-Soto-Gare )\ntechnique Ne Waza ( Hon-Gesa-Gatame )',
      microcycles: [
        { id: '01', title: 'T. Réaction+\nAdresse+\nSouplesse+\nO-Soto-Gare' },
        { id: '02', title: 'Vitesse Gestuel+\nAdresse+\nHon-Gesa-Gatame' },
        { id: '03', title: 'T. Réaction+\nVitesse Gestuel+\nSouplesse+\nO-Soto-Gare' },
        { id: '04', title: 'Adresse+\nSouplesse+\nHon-Gesa-Gatame' }
      ],
      sessions: {
        dates: [1, 2, 5, 8, 9, 12, 15, 16, 19, 22, 23, 26, 29, 30],
        days: ['Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa']
      },
      activities: {
        'T. De Réaction': [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0], // أحمر في مواضع محددة
        'Vitesse Gestuel': [0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0], // أصفر في مواضع محددة
        'Adresse': [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], // رمادي في مواضع محددة
        'Souplesse': [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0], // بنفسجي في مواضع محددة
        'Nage Waza': [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0], // أخضر في مواضع محددة
        'Ne Waza': [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0], // أزرق في مواضع محددة
        'Jeux': [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0] // أسود في مواضع محددة
      }
    },
    'Décembre': {
      mesocycle: 'Méso-cycle 4',
      preparation: 'Apprentissage des :',
      preparation2: 'Chutes\ntechnique Nage Waza ( O-Soto-Gare )\ntechnique Ne Waza ( Hon-Gesa-Gatame )',
      microcycles: [
        { id: '01', title: 'Adresse+\nSouplesse+\nO-Soto-Gare' },
        { id: '02', title: 'Vitesse Gestuel+\nAdresse+\nHon-Gesa-Gatame' },
        { id: '03', title: 'T. Réaction+\nVitesse Gestuel+\nSouplesse+\nO-Soto-Gare' },
        { id: '04', title: 'T. Réaction+\nAdresse+\nSouplesse+\nHon-Gesa-Gatame' }
      ],
      sessions: {
        dates: [3, 6, 7, 10, 13, 14, 17, 20, 21, 24, 27, 28, 31],
        days: ['Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma']
      },
      activities: {
        'T. De Réaction': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], // أحمر في النصف الثاني
        'Vitesse Gestuel': [0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0], // أصفر في مواضع محددة
        'Adresse': [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0], // رمادي في مواضع محددة
        'Souplesse': [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1], // بنفسجي في مواضع محددة
        'Nage Waza': [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0], // أخضر في مواضع محددة
        'Ne Waza': [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1], // أزرق في مواضع محددة
        'Jeux': [1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1] // أسود في مواضع محددة
      }
    },
    'Janvier': {
      mesocycle: 'Méso-cycle 5',
      preparation: 'Apprentissage des :',
      preparation2: 'Chutes\ntechnique Nage Waza ( Ippon-Seoi-nage )\ntechnique Ne Waza ( Hon-Gesa-Gatame )',
      microcycles: [
        { id: '01', title: 'Vitesse Gestuel +\nSouplesse +\nIppon-Seoi-nage\nHon-Gesa-Gatame' },
        { id: '02', title: 'T. Réaction +\nAdresse +\nIppon-Seoi-nage\nHon-Gesa-Gatam' },
        { id: '03', title: 'Vitesse Gestuel +\nSouplesse +\nIppon-Seoi-nage\nHon-Gesa-Gatam' },
        { id: '04', title: 'T. Réaction +\nAdresse +\nIppon-Seoi-nage\nHon-Gesa-Gatam' }
      ],
      sessions: {
        dates: [3, 4, 7, 10, 11, 14, 17, 18, 21, 24, 25, 28, 31],
        days: ['Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve']
      },
      activities: {
        'T. De Réaction': [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1], // أحمر في مواضع محددة
        'Vitesse Gestuel': [0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0], // أصفر في مواضع محددة
        'Adresse': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // رمادي (فارغ)
        'Souplesse': [1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0], // بنفسجي في مواضع محددة
        'Nage Waza': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], // أخضر في موضع واحد
        'Ne Waza': [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], // أزرق في مواضع محددة
        'Jeux': [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1] // أسود في مواضع محددة
      }
    },
    'Février': {
      mesocycle: 'Méso-cycle 6',
      preparation: 'Apprentissage des :',
      preparation2: 'Chutes\ntechnique Nage Waza ( O-Goshi )\ntechnique Ne Waza ( Kami-Shiho-Gatame )',
      microcycles: [
        { id: '01', title: 'Vitesse Gestuel +\nAdresse +\nSouplesse +\nO-Goshi' },
        { id: '02', title: 'Adresse +\nSouplesse +\nKami-Shiho-Gatame' },
        { id: '03', title: 'T. De Réaction +\nVitesse Gestuel +\nAdresse +\nO-Goshi' },
        { id: '04', title: 'Vitesse Gestuel +\nSouplesse +\nKami-Shiho-Gatame' }
      ],
      sessions: {
        dates: [1, 4, 7, 8, 11, 14, 15, 18, 21, 22, 25, 28],
        days: ['Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve']
      },
      activities: {
        'T. De Réaction': [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], // أحمر في موضع واحد
        'Vitesse Gestuel': [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // أصفر في مواضع محددة
        'Adresse': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // فارغ
        'Souplesse': [0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1], // بنفسجي في مواضع محددة
        'Nage Waza': [1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0], // أخضر في مواضع محددة
        'Ne Waza': [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0], // أزرق في مواضع محددة
        'Jeux': [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], // أسود في موضع واحد
        '1° Passage .G': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] // أحمر في النهاية
      }
    },
    'Mars': {
      mesocycle: 'Méso-cycle 7',
      preparation: 'Apprentissage des :',
      preparation2: 'Chutes\ntechnique Nage Waza ( De-Ashi-Barai )\ntechnique Ne Waza ( Ushiro-Gesa-Gatame )',
      microcycles: [
        { id: '01', title: 'Adresse +\nSouplesse +\nDe-Ashi-Barai\nUshiro-Gesa-Gatame' },
        { id: '02', title: 'Vitesse Gestuel +\nAdresse +\nDe-Ashi-Barai\nUshiro-Gesa-Gatame' },
        { id: '03', title: 'Vitesse Gestuel +\nSouplesse +\nDe-Ashi-Barai\nUshiro-Gesa-Gatame' },
        { id: '04', title: 'T. De Réaction +\nSouplesse +\nDe-Ashi-Barai\nUshiro-Gesa-Gatame' }
      ],
      sessions: {
        dates: [1, 4, 7, 8, 11, 14, 15, 18, 21, 22, 25, 28, 29],
        days: ['Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa']
      },
      activities: {
        'T. De Réaction': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0], // أحمر في مواضع محددة
        'Vitesse Gestuel': [0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0], // أصفر في مواضع محددة
        'Adresse': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // فارغ
        'Souplesse': [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1], // بنفسجي في مواضع محددة
        'Nage Waza': [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], // أخضر في موضع واحد
        'Ne Waza': [1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1], // أزرق في مواضع محددة
        'Jeux': [0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1] // أسود في مواضع محددة
      }
    },
    'Avril': {
      mesocycle: 'Méso-cycle 8',
      preparation: 'T. Compétitive + Révision des Chutes',
      preparation2: 'technique Nage Waza ( Hiza-Guruma )\ntechnique Ne Waza ( Tate-Shio-Gatame )',
      microcycles: [
        { id: '01', title: 'T. De Réaction +\nVitesse Gestuel +\nAdresse +\nHiza-Guruma' },
        { id: '02', title: 'T. De Réaction +\nVitesse Gestuel +\nSouplesse +\nTate-Shio-Gatame+\nT. Compétitive' },
        { id: '03', title: 'T. De Réaction +\nSouplesse +\nHiza-Guruma+\nT. Compétitive' },
        { id: '04', title: 'Vitesse Gestuel +\nAdresse +\nTate-Shio-Gatame+\nT. Compétitive' }
      ],
      sessions: {
        dates: [1, 4, 5, 8, 11, 12, 15, 18, 19, 22, 25, 26, 29],
        days: ['Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma']
      },
      activities: {
        'T. De Réaction': [0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0], // أحمر في مواضع محددة
        'Vitesse Gestuel': [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], // أصفر في مواضع محددة
        'Adresse': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // فارغ
        'Souplesse': [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0], // بنفسجي في مواضع محددة
        'Nage Waza': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // فارغ
        'Ne Waza': [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0], // أزرق في مواضع محددة
        'Jeux': [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1], // أسود في مواضع محددة
        'T. compétitive': [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0], // برتقالي في مواضع محددة
        'Compétition': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // فارغ
      }
    },
    'Mai': {
      mesocycle: 'Méso-cycle 9',
      preparation: 'Révision des Chutes',
      preparation2: 'technique Nage Waza ( Uki-Goshi + O-Goshi )',
      microcycles: [
        { id: '01', title: 'Repos Actif +\nSouplesse' },
        { id: '02', title: 'T. De Réaction +\nAdresse +\nSouplesse +\nUki-Goshi' },
        { id: '03', title: 'T. De Réaction +\nVitesse Gestuel +\nSouplesse +' },
        { id: '04', title: 'Vitesse Gestuel +\nAdresse +\nO-Goshi' }
      ],
      sessions: {
        dates: [2, 3, 6, 9, 10, 13, 16, 17, 20, 23, 24, 27, 30, 31],
        days: ['Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa']
      },
      activities: {
        'T. De Réaction': [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0], // أحمر في مواضع محددة
        'Vitesse Gestuel': [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0], // أصفر في مواضع محددة
        'Adresse': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // فارغ
        'Souplesse': [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0], // بنفسجي في مواضع محددة
        'Nage Waza': [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1], // أخضر في مواضع محددة
        'Ne Waza': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // فارغ
        'Jeux': [1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1] // أسود في مواضع محددة
      }
    },
    'Juin': {
      mesocycle: 'Méso-cycle 10',
      preparation: 'Révision des Chutes',
      preparation2: 'Révision technique de 6ème Kyu ( Nage Waza et Ne- waza )',
      microcycles: [
        { id: '01', title: 'T. De Réaction +\nAdresse +\nSouplesse +\nRévision Nage Waza' },
        { id: '02', title: 'T. De Réaction +\nAdresse +\nRévision Ne - Waza' },
        { id: '03', title: 'Vitesse Gestuel +\nSouplesse +\nRévision Nage Waza' },
        { id: '04', title: 'Adresse +\nSouplesse +\nRévision Ne - Waza' }
      ],
      sessions: {
        dates: [3, 6, 7, 10, 13, 14, 17, 20, 21, 24, 27, 28],
        days: ['Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa', 'Ma', 'Ve', 'Sa']
      },
      activities: {
        'T. De Réaction': [1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0], // أحمر في مواضع محددة
        'Vitesse Gestuel': [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], // أصفر في مواضع محددة
        'Adresse': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // فارغ
        'Souplesse': [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0], // بنفسجي في مواضع محددة
        'Nage Waza': [1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0], // أخضر في مواضع محددة
        'Ne Waza': [0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1], // أزرق في مواضع محددة
        'Jeux': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // أسود في جميع المواضع
        '2ème Passage.G': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] // أحمر في النهاية
      }
    }
  };

  // تهيئة البيانات القابلة للتعديل مع تحميل بيانات محفوظة من قاعدة البيانات
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      // ابدأ بالبيانات الافتراضية للشهر
      const monthData = monthsData[selectedMonth as keyof typeof monthsData] || monthsData['Septembre'];
      if (mounted) setEditableData(JSON.parse(JSON.stringify(monthData))); // نسخة عميقة

      // حاول تحميل بيانات محفوظة لهذا النادي وهذا الشهر
      try {
        const saved = await TechnicalDirectorService.getPeriodisation(clubId, selectedMonth);
        if (mounted && saved) {
          setEditableData(saved);
        }
      } catch (e) {
        console.warn('Failed to load saved periodisation, using defaults', e);
      }
    })();
    return () => { mounted = false; };
  }, [selectedMonth, clubId]);

  const currentMonthData = editableData || monthsData[selectedMonth as keyof typeof monthsData] || monthsData['Septembre'];

  // دالة لتبديل حالة النشاط
  const toggleActivity = (activityName: string, sessionIndex: number) => {
    if (!editableData) return;

    const newData = { ...editableData };
    const currentValue = newData.activities[activityName][sessionIndex];
    newData.activities[activityName][sessionIndex] = currentValue === 1 ? 0 : 1;

    setEditableData(newData);
  };

  // دالة لحفظ التغييرات
  const saveChanges = async () => {
    if (!editableData) return;
    setSaving(true);
    try {
      await TechnicalDirectorService.savePeriodisation(clubId, selectedMonth, editableData);
      alert('تم حفظ التغييرات بنجاح!');
    } catch (e) {
      console.error('Save periodisation failed', e);
      alert('حدث خطأ أثناء الحفظ. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  // دالة لإعادة تعيين البيانات
  const resetData = () => {
    const originalData = monthsData[selectedMonth as keyof typeof monthsData];
    setEditableData(JSON.parse(JSON.stringify(originalData)));
  };

  return (
    <div className="periodisation-responsive">
      <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <i className="fas fa-calendar-alt me-2"></i>
            Périodisation Annuelle
          </h4>
          
          <Dropdown>
            <Dropdown.Toggle variant="light" id="month-dropdown">
              <i className="fas fa-calendar me-2"></i>
              {selectedMonth}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {months.map((month) => (
                <Dropdown.Item
                  key={month.name}
                  active={selectedMonth === month.name}
                  onClick={() => setSelectedMonth(month.name)}
                >
                  {month.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {/* عنوان الشهر والأزرار */}
        <div className="text-center py-3 month-header" style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
          <h3 className="mb-3 text-danger fw-bold">{selectedMonth}</h3>

          {/* أزرار التحكم */}
          <ButtonGroup>
            <Button
              variant="success"
              size="sm"
              onClick={saveChanges}
              disabled={saving}
            >
              <i className="fas fa-save me-1"></i>
              {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
            </Button>
            <Button
              variant="warning"
              size="sm"
              onClick={resetData}
            >
              <i className="fas fa-undo me-1"></i>
              إعادة تعيين
            </Button>
          </ButtonGroup>

          <div className="mt-2">
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              انقر على أي خانة لتفعيلها أو إلغاء تفعيلها
            </small>
          </div>
        </div>

        {/* الجدول */}
        <div className="table-responsive">
          <Table bordered className="mb-0 periodisation-table" style={{ fontSize: '0.9rem' }}>
            <thead>
              <tr>
                {/* العمود الأول */}
                <th 
                  rowSpan={2} 
                  style={{ 
                    backgroundColor: '#8B4513', 
                    color: 'white', 
                    verticalAlign: 'middle',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    wordBreak: 'normal',
                    overflow: 'visible'
                  }}
                >
                  {currentMonthData.mesocycle}
                </th>

                {/* عنوان الإعداد الكامل */}
                <th
                  colSpan={
                    selectedMonth === 'Octobre' ? 13 :
                    selectedMonth === 'Novembre' ? 14 :
                    selectedMonth === 'Décembre' ? 13 :
                    selectedMonth === 'Janvier' ? 13 :
                    selectedMonth === 'Février' ? 12 :
                    selectedMonth === 'Mars' ? 13 :
                    selectedMonth === 'Avril' ? 13 :
                    selectedMonth === 'Mai' ? 14 :
                    selectedMonth === 'Juin' ? 12 : 12
                  }
                  style={{
                    backgroundColor: '#8B4513',
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {/* عرض النص الكامل */}
                  {currentMonthData.preparation}
                  {(currentMonthData as any).preparation2 && (
                    <>
                      {' '}
                      {(currentMonthData as any).preparation2}
                    </>
                  )}
                </th>
              </tr>

              <tr>
                {/* أعمدة الدورات الصغيرة */}
                {currentMonthData.microcycles.map((microcycle: any, index: number) => {
                  // في أكتوبر: الأول 4 أعمدة، الباقي 3 أعمدة لكل واحد
                  // في نوفمبر: الأول 4 أعمدة، الثاني 3 أعمدة، الثالث 4 أعمدة، الرابع 4 أعمدة
                  // في ديسمبر: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 3 أعمدة، الرابع 4 أعمدة
                  // في جانفي: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 3 أعمدة، الرابع 4 أعمدة
                  // في فيفري: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 3 أعمدة، الرابع 3 أعمدة
                  // في مارس: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 4 أعمدة، الرابع 3 أعمدة
                  // في أفريل: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 3 أعمدة، الرابع 4 أعمدة
                  // في ماي: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 4 أعمدة، الرابع 4 أعمدة
                  // في جوان: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 3 أعمدة، الرابع 3 أعمدة
                  let colSpan = 3; // القيمة الافتراضية
                  if (selectedMonth === 'Octobre' && index === 0) {
                    colSpan = 4;
                  } else if (selectedMonth === 'Novembre') {
                    if (index === 2 || index === 3) {
                      colSpan = 4;
                    } else {
                      colSpan = 3;
                    }
                  } else if (selectedMonth === 'Décembre') {
                    if (index === 3) {
                      colSpan = 4;
                    } else {
                      colSpan = 3;
                    }
                  } else if (selectedMonth === 'Janvier') {
                    if (index === 3) {
                      colSpan = 4;
                    } else {
                      colSpan = 3;
                    }
                  } else if (selectedMonth === 'Février') {
                    colSpan = 3; // جميع الأعمدة 3
                  } else if (selectedMonth === 'Mars') {
                    if (index === 2) {
                      colSpan = 4;
                    } else {
                      colSpan = 3;
                    }
                  } else if (selectedMonth === 'Avril') {
                    if (index === 3) {
                      colSpan = 4;
                    } else {
                      colSpan = 3;
                    }
                  } else if (selectedMonth === 'Mai') {
                    if (index === 2 || index === 3) {
                      colSpan = 4;
                    } else {
                      colSpan = 3;
                    }
                  } else if (selectedMonth === 'Juin') {
                    colSpan = 3; // جميع الأعمدة 3
                  }

                  return (
                    <th
                      key={microcycle.id}
                      colSpan={colSpan}
                      style={{
                        backgroundColor: '#d3d3d3',
                        textAlign: 'center',
                        padding: '10px',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        {microcycle.id}
                      </div>
                      <div style={{ fontSize: '0.8rem' }}>
                        {microcycle.title}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* صف Microcycles */}
              <tr>
                <td style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold', textAlign: 'center' }}>
                  Microcycles
                </td>
                {currentMonthData.microcycles.map((microcycle: any, index: number) => {
                  // في أكتوبر: الأول 4 أعمدة، الباقي 3 أعمدة لكل واحد
                  // في نوفمبر: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 4 أعمدة، الرابع 4 أعمدة
                  // في ديسمبر: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 3 أعمدة، الرابع 4 أعمدة
                  // في جانفي: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 3 أعمدة، الرابع 4 أعمدة
                  // في فيفري: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 3 أعمدة، الرابع 3 أعمدة
                  // في مارس: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 4 أعمدة، الرابع 3 أعمدة
                  // في أفريل: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 3 أعمدة، الرابع 4 أعمدة
                  // في ماي: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 4 أعمدة، الرابع 4 أعمدة
                  // في جوان: الأول 3 أعمدة، الثاني 3 أعمدة، الثالث 3 أعمدة، الرابع 3 أعمدة
                  let colSpan = 3; // القيمة الافتراضية
                  if (selectedMonth === 'Octobre' && index === 0) {
                    colSpan = 4;
                  } else if (selectedMonth === 'Novembre') {
                    if (index === 2 || index === 3) {
                      colSpan = 4;
                    } else {
                      colSpan = 3;
                    }
                  } else if (selectedMonth === 'Décembre') {
                    if (index === 3) {
                      colSpan = 4;
                    } else {
                      colSpan = 3;
                    }
                  } else if (selectedMonth === 'Janvier') {
                    if (index === 3) {
                      colSpan = 4;
                    } else {
                      colSpan = 3;
                    }
                  } else if (selectedMonth === 'Février') {
                    colSpan = 3; // جميع الأعمدة 3
                  } else if (selectedMonth === 'Mars') {
                    if (index === 2) {
                      colSpan = 4;
                    } else {
                      colSpan = 3;
                    }
                  } else if (selectedMonth === 'Avril') {
                    if (index === 3) {
                      colSpan = 4;
                    } else {
                      colSpan = 3;
                    }
                  } else if (selectedMonth === 'Mai') {
                    if (index === 2 || index === 3) {
                      colSpan = 4;
                    } else {
                      colSpan = 3;
                    }
                  } else if (selectedMonth === 'Juin') {
                    colSpan = 3; // جميع الأعمدة 3
                  }

                  return (
                    <td
                      key={`micro-${microcycle.id}`}
                      colSpan={colSpan}
                      style={{
                        backgroundColor: '#f0f0f0',
                        textAlign: 'center',
                        padding: '10px',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      <div style={{ fontSize: '0.8rem' }}>
                        {microcycle.title}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* صف الحصص - أعمدة منفصلة للحصص */}
              <tr>
                <td className="session-header" style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold', textAlign: 'center' }}>
                  <div>Séances</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>Qualité</div>
                </td>
                {/* أعمدة منفصلة للحصص */}
                {currentMonthData.sessions.dates.map((date: number, index: number) => (
                  <td
                    key={`session-${index}`}
                    className="session-cell"
                    style={{
                      textAlign: 'center',
                      padding: '8px',
                      minWidth: '50px',
                      backgroundColor: '#fff'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {date.toString().padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {currentMonthData.sessions.days[index]}
                    </div>
                  </td>
                ))}
              </tr>

              {/* صفوف الأنشطة */}
              {Object.entries(currentMonthData.activities).map(([activityName, activityData]) => (
                <tr key={activityName}>
                  <td style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap', wordBreak: 'normal', overflow: 'visible' }}>
                    {activityName}
                  </td>
                  {(activityData as number[]).map((isActive: number, index: number) => {
                    let backgroundColor = '#fff';
                    if (isActive === 1) {
                      switch (activityName) {
                        case 'T. De Réaction':
                          backgroundColor = '#FF0000'; // أحمر
                          break;
                        case 'Vitesse Gestuel':
                          backgroundColor = '#FFD700'; // أصفر
                          break;
                        case 'Adresse':
                          backgroundColor = selectedMonth === 'Octobre' || selectedMonth === 'Novembre' ? '#C0C0C0' : '#FFD700'; // رمادي لأكتوبر/نوفمبر، أصفر لغيرهما
                          break;
                        case 'Souplesse':
                          backgroundColor = '#9932CC'; // بنفسجي
                          break;
                        case 'Nage Waza':
                          backgroundColor = '#32CD32'; // أخضر
                          break;
                        case 'Ne Waza':
                          backgroundColor = '#00BFFF'; // أزرق
                          break;
                        case 'Jeux':
                          backgroundColor = '#000'; // أسود
                          break;
                        case '1° Passage .G':
                          backgroundColor = '#FF0000'; // أحمر
                          break;
                        case 'T. compétitive':
                          backgroundColor = '#FFA500'; // برتقالي
                          break;
                        case 'Compétition':
                          backgroundColor = '#FFA500'; // برتقالي
                          break;
                        case '2ème Passage.G':
                          backgroundColor = '#FF0000'; // أحمر
                          break;
                      }
                    }

                    return (
                      <td
                        key={`${activityName}-${index}`}
                        onClick={() => toggleActivity(activityName, index)}
                        style={{
                          backgroundColor,
                          height: '30px',
                          minWidth: '50px',
                          cursor: 'pointer',
                          border: '1px solid #dee2e6',
                          position: 'relative',
                          userSelect: 'none'
                        }}
                        title={`النقر لتبديل ${activityName} في الجلسة ${index + 1}`}
                      >
                        {isActive === 1 && (
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: activityName === 'Jeux' ? 'white' : 'black',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            ✓
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
    {/* Scoped responsive styles */}
    <style>
      {`
        /* Keep first column on a single line (no wrapping) */
        .periodisation-responsive .periodisation-table th:first-child,
        .periodisation-responsive .periodisation-table td:first-child {
          white-space: nowrap !important;
          word-break: normal !important;
          overflow-wrap: normal !important;
          text-overflow: clip !important;
          overflow: visible !important;
          width: 220px !important; /* give the first column enough width on desktop */
          max-width: none !important;
        }

        @media (max-width: 576px) {
          .periodisation-responsive .periodisation-table {
            table-layout: fixed;
          }
          /* Tighter layout for sessions cells on small screens */
          .periodisation-responsive .session-cell {
            padding: 2px !important;
            min-width: 32px !important;
          }
          .periodisation-responsive .session-cell > div:first-child { /* date */
            font-size: 0.65rem !important;
            line-height: 1.05 !important;
          }
          .periodisation-responsive .session-cell > div:last-child { /* day */
            font-size: 0.55rem !important;
            line-height: 1 !important;
            color: #666 !important;
          }
          .periodisation-responsive .session-header {
            font-size: 0.75rem !important;
          }
          .periodisation-responsive .periodisation-table th:not(:first-child),
          .periodisation-responsive .periodisation-table td:not(:first-child) {
            padding: 4px !important;
            font-size: 0.7rem !important;
            word-break: break-word;
            white-space: normal !important;
            min-width: 36px !important;
          }
          /* Narrower first column width on mobile while keeping single line */
          .periodisation-responsive .periodisation-table th:first-child,
          .periodisation-responsive .periodisation-table td:first-child {
            width: 150px !important;
          }
          .periodisation-responsive .month-header h3 {
            font-size: 1rem;
          }
        }
      `}
    </style>
    </div>
  );
};

export default PeriodisationAnnuelle;
