import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Firebase configuration
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
const db = getFirestore(firebaseApp);


const studentQuery = query(
    collection(db, `ChiSo/12 Sinh/HocSinh`),
    where("id", "==", "VTX7rdIU8XW6EbNwgwftiA2VtDg2")
);

const unsubscribe = onSnapshot(studentQuery, (querySnapshot) => {
    console.log("Data updated!");
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Document ID: ", doc.id, " => ", data);
        // Handle updated data for each document in the query result
    });
});

// Unsubscribe when you no longer need updates, for example, when the component unmounts
// unsubscribe();
