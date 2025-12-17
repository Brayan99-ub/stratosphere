
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAd_az9DUGSz9ZIDhNc_fIZMHOtUmw0TB8",
  authDomain: "studio-5747223550-4c384.firebaseapp.com",
  projectId: "studio-5747223550-4c384",
  storageBucket: "studio-5747223550-4c384.appspot.com",
  messagingSenderId: "977608613730",
  appId: "1:977608613730:web:b9dafa97152bb78336163b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, firestore, provider };
