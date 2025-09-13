// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4XaHHlcgiQAgrf3Mb6fE3rkS4GqMN5Sk",
  authDomain: "irteqaanew.firebaseapp.com",
  databaseURL: "https://irteqaanew-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "irteqaanew",
  storageBucket: "irteqaanew.firebasestorage.app",
  messagingSenderId: "505276478083",
  appId: "1:505276478083:web:bff6fa6d0b0fa60a7121b6",
  measurementId: "G-6SDDKGK465"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services (not connected to app yet)
// These are available for you to study and implement later
export const analytics = getAnalytics(app);
// Firestore with long-polling to avoid QUIC/fetch stream issues behind certain proxies
export const db = initializeFirestore(app, {
  // Force long polling to avoid QUIC/HTTP3 issues in some networks
  experimentalForceLongPolling: true,
});           // Firestore Database (NoSQL)
export const auth = getAuth(app);              // Authentication
export const storage = getStorage(app);        // Cloud Storage
export const functions = getFunctions(app);    // Cloud Functions
export const realtimeDb = getDatabase(app);    // Realtime Database

// Export the initialized app
export default app;

// NOTE: Firebase services are now initialized but not yet connected to your app components
// You can study these services and decide what to implement:
// - db: For storing clubs, leagues, staff, athletes data
// - auth: For user authentication and role-based access
// - storage: For uploading images, documents, certificates
// - functions: For server-side logic and data processing
// - realtimeDb: For real-time features like live scoring
// - analytics: For tracking app usage and performance
