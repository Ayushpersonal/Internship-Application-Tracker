// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app = null;
let analytics = null;
let auth = null;
let googleProvider = null;
let db = null;

// Initialize Firebase only if the API key is provided
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined" && firebaseConfig.apiKey !== "";

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope("https://www.googleapis.com/auth/gmail.readonly");
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase failed to initialize:", error);
  }
} else {
  console.warn("Firebase API key is missing. Running CareerFly in Sandbox Mock Mode.");
}

export { app, analytics, auth, googleProvider, db };

