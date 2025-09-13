import type {
  DailyWellness,
  Injury,
  PhysicalExam,
  MedicalAppointment,
  RestPeriod
} from '../types/medical';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

// Sample Medical Data for Testing and Development

export const sampleWellnessData: DailyWellness[] = [
  {
    id: 'wellness-001',
    athleteId: 'athlete-001',
    date: new Date('2024-01-15'),
    wellnessScore: 4.2,
    sleepQuality: 4,
    fatigueLevel: 2,
    muscleSoreness: 3,
    stressLevel: 2,
    mood: 4,
    additionalNotes: 'Feeling good after rest day'
  },
  {
    id: 'wellness-002',
    athleteId: 'athlete-001',
    date: new Date('2024-01-16'),
    wellnessScore: 3.8,
    sleepQuality: 3,
    fatigueLevel: 3,
    muscleSoreness: 4,
    stressLevel: 3,
    mood: 3
  }
];

export const sampleInjuries: Injury[] = [
  {
    id: 'injury-001',
    athleteId: 'athlete-001',
    injuryLocation: 'knee',
    injuryType: 'ACL Sprain',
    severity: 'moderate',
    status: 'recovering',
    painLevel: 5,
    reportDate: new Date('2024-01-10'),
    recoveryDate: new Date('2024-03-15'),
    treatmentNotes: 'Physical therapy and gradual return to training'
  },
  {
    id: 'injury-002',
    athleteId: 'athlete-002',
    injuryLocation: 'shoulder',
    injuryType: 'Rotator Cuff Strain',
    severity: 'mild',
    status: 'recovered',
    painLevel: 2,
    reportDate: new Date('2024-01-05'),
    recoveryDate: new Date('2024-02-01'),
    treatmentNotes: 'Rest and strengthening exercises'
  }
];

export const samplePhysicalExams: PhysicalExam[] = [
  {
    id: 'exam-001',
    athleteId: 'athlete-001',
    date: new Date('2024-01-01'),
    height: 175,
    weight: 70,
    bloodPressure: '120/80',
    heartRate: 65,
    visionTest: '20/20',
    notes: 'Normal physical examination'
  },
  {
    id: 'exam-002',
    athleteId: 'athlete-002',
    date: new Date('2024-01-15'),
    height: 180,
    weight: 75,
    bloodPressure: '118/78',
    heartRate: 68,
    visionTest: '20/25',
    notes: 'Slight vision correction needed'
  }
];

export const sampleAppointments: MedicalAppointment[] = [
  {
    id: 'appointment-001',
    athleteId: 'athlete-001',
    appointmentType: 'checkup',
    date: new Date('2024-01-20'),
    time: '10:00',
    location: 'Sports Medicine Clinic',
    doctorName: 'Dr. Sarah Johnson',
    notes: 'Post-injury follow-up',
    status: 'scheduled'
  },
  {
    id: 'appointment-002',
    athleteId: 'athlete-002',
    appointmentType: 'specialist',
    date: new Date('2024-01-25'),
    time: '14:30',
    location: 'Orthopedic Center',
    doctorName: 'Dr. Michael Chen',
    notes: 'Shoulder evaluation',
    status: 'completed'
  }
];

export const sampleRestPeriods: RestPeriod[] = [
  {
    id: 'rest-001',
    athleteId: 'athlete-001',
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-01-24'),
    restType: 'injury',
    reason: 'Knee injury recovery',
    approvedBy: 'Dr. Sarah Johnson'
  },
  {
    id: 'rest-002',
    athleteId: 'athlete-002',
    startDate: new Date('2024-01-05'),
    endDate: new Date('2024-01-12'),
    restType: 'illness',
    reason: 'Flu symptoms',
    approvedBy: 'Team Doctor'
  }
];

// Helper function to generate mock data
export const generateMockMedicalData = (athleteId: string) => ({
  wellness: sampleWellnessData.filter(w => w.athleteId === athleteId),
  injuries: sampleInjuries.filter(i => i.athleteId === athleteId),
  physicalExams: samplePhysicalExams.filter(e => e.athleteId === athleteId),
  appointments: sampleAppointments.filter(a => a.athleteId === athleteId),
  restPeriods: sampleRestPeriods.filter(r => r.athleteId === athleteId)
});

// Seed localStorage using the service APIs so derived data/alerts are generated
export function initializeSampleMedicalData() {
  try {
    // Avoid duplicating if data already saved in current session run
    const existingWellness = localStorage.getItem('daily_wellness');
    const existingInjuries = localStorage.getItem('injury_records');

    if (!existingWellness) {
      sampleWellnessData.forEach(w => {
        const wellnessStr = JSON.stringify(w);
        localStorage.setItem(`daily_wellness_${w.id}`, wellnessStr);
      });
    }

    if (!existingInjuries) {
      // Coerce to the broader InjuryRecord expected by service methods
      sampleInjuries.forEach(i => {
        const injuryStr = JSON.stringify(i);
        localStorage.setItem(`injury_records_${i.id}`, injuryStr);
      });
    }
  } catch (e) {
    console.error('Failed to initialize sample medical data', e);
  }
}

// Initialize Firebase Firestore with sample data
export async function initializeSampleMedicalDataFirestore() {
  try {
    // تحقق من وجود البيانات في Firestore
    const wellnessQuery = query(collection(db, 'daily_wellness'));
    const wellnessSnapshot = await getDocs(wellnessQuery);

    if (wellnessSnapshot.empty) {
      console.log('Initializing wellness data in Firestore...');
      for (const wellness of sampleWellnessData) {
        await setDoc(doc(db, 'daily_wellness', wellness.id), wellness);
      }
    }

    const injuriesQuery = query(collection(db, 'injury_records'));
    const injuriesSnapshot = await getDocs(injuriesQuery);

    if (injuriesSnapshot.empty) {
      console.log('Initializing injuries data in Firestore...');
      for (const injury of sampleInjuries) {
        await setDoc(doc(db, 'injury_records', injury.id), injury);
      }
    }

    console.log('Sample medical data initialized in Firestore');
  } catch (e) {
    console.error('Failed to initialize sample medical data in Firestore:', e);
  }
}
