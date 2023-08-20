import {
  arrayRemove,
  deleteDoc,
  doc,
  increment,
  updateDoc
} from 'firebase/firestore'
import { firestoreDB } from '@/firebase.config'

export const leaveGroup = async ({ id, selectedGroup, router,redirect }) => {
  if (!id) return

  const isOwner = Boolean(selectedGroup?.owner?.user_id === id)
  const isAdmin = selectedGroup?.admin.includes(id)
  const isParticipant = selectedGroup?.participants?.find(
    participant => participant.user_id === id
  )

  // console.log(isParticipant)

  isParticipant &&
    (await updateDoc(
      doc(firestoreDB, `groups/${selectedGroup?.id}/participants/${id}`),
      {
        left: true
      }
    ))

  isParticipant &&
    (await updateDoc(doc(firestoreDB, `groups/${selectedGroup?.id}`), {
      participantsCount: increment(-1)
    }))

  isOwner &&
    (await updateDoc(doc(firestoreDB, `groups/${selectedGroup?.id}`), {
      owner: {}
    }))
  isAdmin &&
    (await updateDoc(doc(firestoreDB, `groups/${selectedGroup?.id}`), {
      admin: arrayRemove(id)
    }))
  await deleteDoc(
    doc(
      firestoreDB,
      `users/${id}/conversations/${selectedGroup?.conversation_id}`
    )
  )

  redirect && router.replace(`/groups`)
  !redirect && location.reload()
}
