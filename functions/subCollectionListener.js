import { firestoreDB } from '@/firebase.config'
import { info } from 'autoprefixer'
import {
  query,
  collection,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
  where,
  getDocs
} from 'firebase/firestore'

export const setUpSubCollectionListener = async ({
  conversation_info,
  user,
  setMessages,
  setGroups
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
          !snapshot.data().delivered_to?.includes(user?.id) &&
          snapshot.data().sender_id !== user.id
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
              message_deliveredAt: serverTimestamp(),
              delivered_to: arrayUnion(user.id)
            }
          )
        }
        messages.push(snapshot.data())
      })
    )
    let group_id
    if (conversation_info.type === 'group') {
      group_id = `group_${conversation_info.conversation_id}`
    }

    let friend_id = conversation_info.participants?.find(
      participant_id => participant_id !== user.id
    )

    setMessages(prev => {
      return {
        ...prev,
        [group_id || friend_id]: messages
      }
    })
  })

  return unsub
}
