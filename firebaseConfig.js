// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, getqrImageURL } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyB7_FDSt0gUrgpQImVnSYj56GBG_MTs35A",
  authDomain: "vehiqr-spott.firebaseapp.com",
  projectId: "vehiqr-spott",
  storageBucket: "vehiqr-spott.appspot.com",
  messagingSenderId: "760283279034",
  appId: "1:760283279034:web:319c6f7a4c22ca0b299c83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const db = getFirestore(app);



