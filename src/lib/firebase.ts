// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0heKAl49bE49y8vadmp4cqa2JinFunUo",
  authDomain: "claudio-madera.firebaseapp.com",
  projectId: "claudio-madera",
  storageBucket: "claudio-madera.appspot.com",
  messagingSenderId: "876259118187",
  appId: "1:876259118187:web:b356dcdbf551ea8941752e",
  measurementId: "G-G74ZRM4JQD"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth, app };
