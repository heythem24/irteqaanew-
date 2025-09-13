import { createRoot } from 'react-dom/client'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './index.css'
import App from './App';
import './scripts/importRealData'; // To make it available in the browser console for data seeding
import { initializeSampleMedicalDataFirestore } from './data/sampleMedicalData';

// إنشاء البيانات الطبية النموذجية عند تشغيل التطبيق لأول مرة باستخدام Firestore
(async () => {
  try {
    await initializeSampleMedicalDataFirestore();
  } catch (error) {
    console.error('Error initializing sample medical data:', error);
  }

  createRoot(document.getElementById('root')!).render(<App />);
})();
