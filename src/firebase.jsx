import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAjGN8HKtfkTkttKHHgl1IU8G048Hiyvpw",
  authDomain: "my-project-6c692.firebaseapp.com",
  projectId: "my-project-6c692",
  storageBucket: "my-project-6c692.firebase.com",
  messagingSenderId: "269153028187",
  appId: "1:269153028187:web:a1b135dc915d2cfbd9577e",
  measurementId: "G-3CJ8L2MKD4",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
