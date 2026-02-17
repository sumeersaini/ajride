// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "testljkn",
  authDomain: "ajride-.firebaseapp.com",
  projectId: "ajride-f4f8c",
  storageBucket: "ajridef8c..app",
  messagingSenderId: "",
  appId: "1:109227348:web:",
  measurementId: "G-"
};
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);


