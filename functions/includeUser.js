import { firestoreDB,realtimeDB } from "@/firebase.config"
import { getDoc,doc,setDoc,serverTimestamp } from "firebase/firestore"
import {ref,set,update} from "firebase/database"


export async function includeUser ({user}) {
    const docRef = doc(firestoreDB, 'users', user.id)
    const docSnap = await getDoc(docRef)
    localStorage.setItem('user_id', user.id)
    if (!docSnap.exists()) {
      setDoc(doc(firestoreDB, 'users', user.id), {
        user_name: user.fullName,
        user_email: user.primaryEmailAddress.emailAddress,
        user_id: user.id,
        user_img: user.imageUrl,
        user_createdAt: serverTimestamp()
      })
      set(ref(realtimeDB, `users/${user.id}`), {
        user_id: user.id,
        online: true,
        last_seen: new Date().toString()
      })
    } else {
      const dataRef = ref(realtimeDB, `users/${user.id}`)
      update(dataRef, {
        online: true
      })
    }
  }