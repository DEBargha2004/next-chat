import { getDoc,doc } from "firebase/firestore"
import { firestoreDB } from "@/firebase.config"


export async function UserInfoWithConversations ({participants,user}) {
    let friend_id = participants.find(
      participant_id => participant_id !== user.id
    )

    try {
      const data = await getDoc(doc(firestoreDB, `users/${friend_id}`))
      if (data.exists()) {
        return data.data()
      }
    } catch (error) {
      console.error(error)
    }
  }