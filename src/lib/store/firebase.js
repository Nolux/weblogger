import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDVeqOL9z_ZSF7naKB8_lneUoejfnPtqxY",

  authDomain: "weblogger-c298a.firebaseapp.com",

  projectId: "weblogger-c298a",

  storageBucket: "weblogger-c298a.appspot.com",

  messagingSenderId: "486342816006",

  appId: "1:486342816006:web:2da7b4a04d423d51602e87",

  measurementId: "G-K6MQ3FR45X",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app);

//connectFunctionsEmulator(functions, "localhost", 5001);

export const auth = getAuth();

export const GoogleProvider = new GoogleAuthProvider();
