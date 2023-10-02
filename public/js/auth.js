import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    connectAuthEmulator,
    AuthErrorCodes
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

import {
    getFirestore, doc, setDoc, getDoc, getDocs, addDoc, collection, where, query, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDr7eVxyookedQsOZJ6VTgSqfFnPrdy1U4",
    authDomain: "mindfulmedicalbrand.firebaseapp.com",
    projectId: "mindfulmedicalbrand",
    storageBucket: "mindfulmedicalbrand.appspot.com",
    messagingSenderId: "195403509317",
    appId: "1:195403509317:web:ebb9ead1519203e5337d2c",
    measurementId: "G-E96DML6G24"
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// console.log(docSnap.data());
// const docRef = doc(db, "12A", "2smC3EKTPewBe6dxbuQN");
// const docSnap = await getDoc(docRef);
// console.log(docSnap.data());
//firebase signup

let studentClass = "";
let studentID = "";

const signupForm = document.querySelector('#sign-up');
const logoutForm = document.querySelector('#log-out');
// console.log(signupForm);
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //get user info
    const signupEmail = signupForm['signup-email'].value;
    const signupPassword = signupForm['signup-password'].value;
    const signupName = signupForm['signup-name'].value;
    const signupClass = signupForm['signup-class'].value;
    createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
        .then((userCredential) => {
            const user = userCredential.user;
            // console.log(user.uid);
            const dataColRef = doc(db, "DuLieu", user.uid);
            const data1 = {
                email: signupEmail,
                password: signupPassword,
                name: signupName,
                class: signupClass,
                id: user.uid
            }
            setDoc(dataColRef, data1);
            const data2 = {
                BMI: "",
                SPO2: "",
                id: user.uid,
            }
            const numColRef = doc(db, "ChiSo/" + signupClass + "/HocSinh", user.uid);
            setDoc(numColRef, data2);
        })
        .catch((error) => {
            alert(error);
        });
})
//firebase login
const loginForm = document.querySelector('#log-in');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //get user info
    const loginEmail = loginForm['login-email'].value;
    const loginPassword = loginForm['login-password'].value;
    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
        .then((userCredential) => {
            const user = userCredential.user;
        })
        .catch((error) => {
            alert("Loi dang nhap");
        });

})

logoutForm.addEventListener('submit', () => {
    signOut(auth);
})
const divLogout = document.querySelector('#logout-form');
const divLogin = document.querySelector('#login-form');
const divSignup = document.querySelector('#signup-form');
// console.log(divLogout.style);
const showLoginForm = () => {
    divLogin.style.display = 'block';
    divSignup.style.display = 'block';
    divLogout.style.display = 'none';
}
const showLogoutForm = () => {
    divLogin.style.display = 'none';
    divSignup.style.display = 'none';
    divLogout.style.display = 'block';
}
const monitorAuthState = async () => {
    onAuthStateChanged(auth, user => {
        // console.log(user);
        if (user) {
            const q = query(collection(db, "DuLieu"), where("id", "==", user.uid));
            onSnapshot(q, (snapshot) => {
                let userData = [];
                snapshot.docs.forEach((doc) => {
                    userData.push({ ...doc.data(), id: doc.id });
                })
                // console.log(userData[0].class);
                studentClass = userData[0].class;
                studentID = userData[0].id;
                console.log(studentClass, studentID)
            })
            // const studentQuery = query(collection(db, "ChiSo/" + studentClass + "/HocSinh"), where("id", "==", user.uid));
            // onSnapshot(q, (snapshot) => {
            //     let userData = [];
            //     snapshot.docs.forEach((doc) => {
            //         userData.push({ ...doc.data(), id: doc.id });
            //     })
            //     console.log(userData);
            // })
            showLogoutForm();
        }
        else {
            showLoginForm();
        }
    })
}
monitorAuthState();