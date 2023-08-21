import { firestoreDB } from '@/firebase.config'
import { doc, updateDoc } from 'firebase/firestore'

export const throttle = (cb, delay) => {
  let shouldWait = false
  let remain
  let result

  const timerfn = (conversation_id, user_id) => {
    if (remain) {
      cb(true, conversation_id, user_id)
      remain = null
      setTimeout(() => timerfn(conversation_id, user_id), delay)
    } else {
      cb(false, conversation_id, user_id)
      shouldWait = false
    }
  }

  return (text, conversation_id, user_id) => {
    if (shouldWait) {
      remain = text
      return
    }

    cb(true, conversation_id, user_id)
    shouldWait = true

    setTimeout(() => timerfn(conversation_id, user_id), delay)
  }
}

export const throttleText = throttle((typing, conversation_id, user_id) => {
  updateDoc(doc(firestoreDB, `conversations/${conversation_id}`), {
    typing: typing ? { typer: user_id } : {}
  })
}, 700)
