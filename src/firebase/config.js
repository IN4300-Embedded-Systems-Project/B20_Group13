import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: 'AIzaSyDltxWRoljUdnvQ2aGUkGeLssPvkBhn35g',
    authDomain: 'library-management-syste-11078.firebaseapp.com',
    projectId: 'library-management-syste-11078',
    storageBucket: 'library-management-syste-11078.firebasestorage.app',
    messagingSenderId: '520721879470',
    appId: '1:520721879470:web:ec0ae9680dab184167783f',
    measurementId: 'G-Z53JVHSSG8'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
