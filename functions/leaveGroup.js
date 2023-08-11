import { arrayRemove, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { firestoreDB } from '@/firebase.config'


export const leaveGroup = async ({ user, selectedGroup, router }) => {
  const finalDecision = prompt('Enter Confirm to exit')
  if (finalDecision !== `Confirm`) return
  const user_id = user?.id
  const isOwner = Boolean(selectedGroup?.user_id)
  const isAdmin = selectedGroup?.admin.includes(user_id)
  const isParticipant = selectedGroup?.participants?.find(
    participant => participant.user_id === user_id
  )

  isParticipant &&
    (await updateDoc(
      doc(firestoreDB, `groups/${selectedGroup?.id}/participants/${user_id}`),
      {
        left: true
      }
    ))

  isOwner &&
    (await updateDoc(doc(firestoreDB, `groups/${selectedGroup?.id}`), {
      owner: {}
    }))
  isAdmin &&
    (await updateDoc(doc(firestoreDB, `groups/${selectedGroup?.id}`), {
      admin: arrayRemove(user?.id)
    }))
  await deleteDoc(
    doc(
      firestoreDB,
      `users/${user?.id}/conversations/${selectedGroup?.conversation_id}`
    )
  )

  router.replace(`/groups`)
}
