import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBxrrTx8UdAfm6kLwFUIjwFVgo7hzZWO2w",
  authDomain: "moneyflow-dp.firebaseapp.com",
  projectId: "moneyflow-dp",
  storageBucket: "moneyflow-dp.firebasestorage.app",
  messagingSenderId: "424532032015",
  appId: "1:424532032015:web:6da17e6df6d6dc0796c17a",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
