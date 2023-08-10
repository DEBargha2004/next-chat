import { firestoreDB } from "@/firebase.config"
import { doc, getDoc } from "firebase/firestore"

export async function getUserInfo (user_id) {
  if (!user_id) return
  const userInfo = await getDoc(doc(firestoreDB,`users/${user_id}`))
  if(userInfo.exists()){
    return userInfo.data()
  }
  return {}
}
