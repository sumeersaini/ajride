// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: " ",
  authDomain: "ajride-.firebaseapp.com",
  projectId: "ajride-f4f8c",
  storageBucket: "ajride-f4f8c..app",
  messagingSenderId: "",
  appId: "1:1092273295248:web:",
  measurementId: "G-"
};
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

