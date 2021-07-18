import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyArN7kA0sPerHf1uarwKwcGU35ZFfSs-5A",
  authDomain: "ruangmu-mobile.firebaseapp.com",
  projectId: "ruangmu-mobile",
  storageBucket: "ruangmu-mobile.appspot.com",
  messagingSenderId: "603894588022",
  appId: "1:603894588022:web:3778d242c41a3380edf557",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export { firebase, auth, provider };
