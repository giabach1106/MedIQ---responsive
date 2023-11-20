import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

import {
    getFirestore, doc, setDoc, getDoc, getDocs, addDoc, collection, where, query, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { dataToSend } from "../js/chiso.js";
console.log(dataToSend + "1123");
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

var studentClass = "";
let studentID = "";
var dataBMI, dataSPO2;


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
            //add loader
            if(loginEmail == "adminams@gmail.com"){
                var adminSite = "/admin.html";
                window.location.href = adminSite;
            }
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
};
let isAdmin = false;
const delay = ms => new Promise(res => setTimeout(res, ms));
const monitorAuthState = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log(user.uid);
            if (user.uid == "dLfsxJfhDdSn3wtxL5swH6o4om42") {
                isAdmin = true;
                // window.location.href = "/admin";
            }
            else {
                isAdmin = false;
            }
            const q = query(collection(db, "DuLieu"), where("id", "==", user.uid));
            const snapshot = await getDocs(q);
            let userData = [];
            snapshot.forEach((doc) => {
                userData.push({ ...doc.data(), id: doc.id });
            });
            studentClass = userData[0].class;
            studentID = userData[0].id;
            const studentQuery = query(collection(db, "ChiSo/" + studentClass + "/HocSinh"), where("id", "==", studentID));
            console.log(studentQuery);
            const unsubscribe = onSnapshot(studentQuery, (querySnapshot) => {
                // console.log("Data updated!");
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    dataBMI = data.BMI;
                    dataSPO2 = data.SPO2;
                    // console.log(dataBMI, dataSPO2);
                    // Handle updated data for each document in the query result
                });
            });
            showLogoutForm();
        } else {
            showLoginForm();
        }
    });
};

monitorAuthState();
await delay(2000);
// console.log(dataBMI, dataSPO2);
await delay(2000);
export { dataBMI, dataSPO2 };

