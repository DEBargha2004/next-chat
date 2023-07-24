import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDG7NTonf5aIopNXE_DcK9v7voRwUrdK30',
  authDomain: 'next-learn-8148e.firebaseapp.com',
  projectId: 'next-learn-8148e',
  storageBucket: 'next-learn-8148e.appspot.com',
  messagingSenderId: '44671844517',
  appId: '1:44671844517:web:58c14cd69d995aaf23cd4c',
  measurementId: 'G-4CTD6SCN00',
  databaseURL:
    'https://next-learn-8148e-default-rtdb.asia-southeast1.firebasedatabase.app/'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const realtimeDB = getDatabase(app)
const firestoreDB = getFirestore(app)
const contentDB = getStorage(app)

export { realtimeDB, firestoreDB, contentDB }
