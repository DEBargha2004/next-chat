import { firestoreDB } from '@/firebase.config'
import {
  query,
  collection,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore'

export const setUpSubCollectionListener = async ({
  conversation_info,
  user,
  setMessages
}) => {
  const mquery = query(
    collection(
      firestoreDB,
      `conversations/${conversation_info.conversation_id}/messages`
    ),
    orderBy('message_createdAt')
  )

  const unsub = onSnapshot(mquery, async snapshots => {
    const messages = []

    await Promise.all(
      snapshots.docs.map(async snapshot => {
        // dealing with subcollection
        // its necessary to add docs
        if (
          !snapshot.data().message_deliver &&
          snapshot.data().receiver_id === user.id
        ) {
          await updateDoc(
            // updating delivery status
            doc(
              firestoreDB,
              `conversations/${conversation_info.conversation_id}/messages/${
                snapshot.data().messageId
              }`
            ),
            {
              message_deliver: true,
              message_deliveredAt: serverTimestamp()
            }
          )
        }
        messages.push(snapshot.data())
      })
    )
    let friend_id = conversation_info.participants.find(
      participant_id => participant_id !== user.id
    )

    setMessages(prev => {
      return {
        ...prev,
        [friend_id]: messages
      }
    })
  })

  return unsub
}
