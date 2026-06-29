// Khởi tạo Firebase (Firestore + Auth).
// Config đọc từ .env (VITE_FIREBASE_*). Nếu chưa cấu hình → firebaseEnabled=false,
// app tự fallback về localStorage để vẫn chạy được.
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const cfg = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfig = cfg;
export const firebaseEnabled = Boolean(cfg.apiKey && cfg.projectId);

let app = null;
let auth = null;
let db = null;

if (firebaseEnabled) {
  app = initializeApp(cfg);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // eslint-disable-next-line no-console
  console.warn('[firebase] Chưa cấu hình VITE_FIREBASE_* trong .env → dùng localStorage.');
}

export { app, auth, db };
