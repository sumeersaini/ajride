// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAvJJzINOk4o4UIhFcCVZL9JFD_e79Ymes",
  authDomain: "ajride-f4f8c.firebaseapp.com",
  projectId: "ajride-f4f8c",
  storageBucket: "ajride-f4f8c.firebasestorage.app",
  messagingSenderId: "1092273295248",
  appId: "1:1092273295248:web:6de3ab86a7070cbc752d15",
  measurementId: "G-X8NZC757D3"
};
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
