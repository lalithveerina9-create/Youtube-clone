import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBF24lLWj4eFSMW8XTOQLcQ7bhr9l5Z3WQ",
  authDomain: "clone-b7e77.firebaseapp.com",
  projectId: "clone-b7e77",
  storageBucket: "clone-b7e77.firebasestorage.app",
  messagingSenderId: "911389912846",
  appId: "1:911389912846:web:05addff6801502090f315f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

// Force account chooser when possible
provider.setCustomParameters({
  prompt: "select_account",
});

export default app;