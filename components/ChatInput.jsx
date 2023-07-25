import { useState, useContext } from 'react'
import { v5 } from 'uuid'
import { Appstate } from '@/hooks/context'
import { useUser } from '@clerk/nextjs'
import { firestoreDB, realtimeDB } from '../firebase.config'
import {
  setDoc,
  doc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDoc,
  getDocs
} from 'firebase/firestore'

function ChatInput () {
  const { user } = useUser()
  const { selectedChatUser } = useContext(Appstate)
  const [userInput, setUserInput] = useState('')
  const handleFileChange = e => {
    const fileReader = new FileReader()
    fileReader.onloadend = () => {
      fileReader.result
    }
    fileReader.readAsDataURL(e.target.files)
  }

  function generateUinqueid (id1, id2) {
    const sortedids = [id1, id2].sort().join('-')

    const unique_id = v5(sortedids, v5.DNS)
    return unique_id
  }

  const handleMessageSubmit = async e => {
    e.preventDefault()

    const sender_id = user.id
    const receiver_id = selectedChatUser.current_User_Id
    const message_data = userInput
    const conversation_id = generateUinqueid(sender_id, receiver_id)
    const message_type = 'text'
    const message_createdAt = serverTimestamp()
    const message_read = false

    const conversation_info = {
      conversation_id,
      u1_id: sender_id,
      u2_id: receiver_id
    }

    const con_Ref = doc(firestoreDB, `conversations/${conversation_id}`)

    const message = {
      conversation_id,
      sender_id,
      receiver_id,
      message_type,
      message_data,
      message_createdAt,
      message_read,
      message_readAt: null
    }

    const docInfo = await getDoc(con_Ref)
    const message_collection_path = `conversations/${conversation_id}/messages`
    console.log(message_collection_path)
    if (docInfo.exists()) {
      await addDoc(collection(firestoreDB, message_collection_path), message)
    } else {
      await setDoc(
        doc(firestoreDB, `conversations/${conversation_id}`),
        conversation_info
      )

      await addDoc(collection(firestoreDB, message_collection_path), message)
    }

    setUserInput('')
  }

  return (
    <div className='min-h-[64px] flex items-center justify-between px-10'>
      <form
        action=''
        className='flex w-[93%] justify-between items-center'
        onSubmit={handleMessageSubmit}
      >
        <input
          type='file'
          hidden
          name=''
          id='imageInput'
          onChange={handleFileChange}
        />
        <label htmlFor='imageInput'>
          <img
            src='https://cdn-icons-png.flaticon.com/512/10054/10054290.png'
            className='h-8 cursor-pointer'
            alt=''
          />
        </label>
        <input
          type='text'
          name=''
          value={userInput}
          id=''
          className='h-auto py-3 px-3 w-[93%] outline-none bg-gray-100 rounded-full text-lg text-slate-600'
          onChange={e => setUserInput(e.target.value)}
        />
      </form>
      <img
        src='https://cdn-icons-png.flaticon.com/512/3682/3682321.png'
        className={`h-8 ${!userInput ? `grayscale` : ``}`}
        alt=''
      />
    </div>
  )
}

export default ChatInput
