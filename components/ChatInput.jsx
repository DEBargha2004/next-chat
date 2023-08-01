import { useState, useContext, useRef, useEffect } from 'react'
import { v4, v5 } from 'uuid'
import { Appstate } from '@/hooks/context'
import { useUser } from '@clerk/nextjs'
import { firestoreDB, contentDB } from '../firebase.config'
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
import { motion } from 'framer-motion'
import { ref, uploadBytes } from 'firebase/storage'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { cloneDeep } from 'lodash'

function ChatInput () {
  const { user } = useUser()
  const { selectedChatUser } = useContext(Appstate)
  const userInputRef = useRef(null)
  const [userInput, setUserInput] = useState('')
  const [imageInfo, setImageInfo] = useState({ url: null, info: null })
  const [emojiButtonStatus, setEmojiButtonStatus] = useState({
    clicked: false,
    hover: false
  })

  const handleFileChange = e => {
    console.log(e.target.files[0])
    const fileReader = new FileReader()
    fileReader.onloadend = () => {
      setImageInfo({ url: fileReader.result, info: e.target.files[0] })
      e.target.value = null
    }
    fileReader.readAsDataURL(e.target.files[0])
    userInputRef.current.focus()
  }

  function generateUinqueid (id1, id2) {
    const sortedids = [id1, id2].sort().join('-')

    const unique_id = v5(sortedids, v5.DNS)
    return unique_id
  }

  const shareMessage = async ({
    conversation_id,
    conversation_info,
    message
  }) => {
    const con_Ref = doc(firestoreDB, `conversations/${conversation_id}`)

    const docInfo = await getDoc(con_Ref)
    const message_collection_path = `conversations/${conversation_id}/messages`

    const messageId = v4()

    message = {
      ...message,
      messageId
    }

    // console.log(message_collection_path)

    if (docInfo.exists()) {
      await setDoc(
        doc(firestoreDB, message_collection_path, messageId),
        message
      )
    } else {
      await setDoc(
        doc(firestoreDB, `conversations/${conversation_id}`),
        conversation_info
      )

      await setDoc(
        doc(firestoreDB, message_collection_path, messageId),
        message
      )
    }

    setUserInput('')
    abortImage()
  }

  const handleMessageSubmit = async e => {
    const imageName = v4()
    e.preventDefault()

    if (!(imageInfo.url || userInput)) {
      return
    }

    const sender_id = user.id
    const receiver_id = selectedChatUser.current_User_Id
    const message_data = {
      text: userInput,
      image: imageInfo.info ? imageName : null
    }
    const conversation_id = generateUinqueid(sender_id, receiver_id)
    const message_type = {
      text: userInput ? true : false,
      image: imageInfo.info ? true : false
    }
    const message_createdAt = serverTimestamp()
    const message_read = false
    const message_readAt = null
    const message_deliver = false
    const message_deliveredAt = null

    const conversation_info = {
      conversation_id,
      u1_id: sender_id,
      u2_id: receiver_id
    }

    const message = {
      conversation_id,
      sender_id,
      receiver_id,
      message_type,
      message_data,
      message_createdAt,
      message_read,
      message_readAt,
      message_deliver,
      message_deliveredAt
    }

    const contentRef = ref(contentDB, imageName)

    imageInfo.info && (await uploadBytes(contentRef, imageInfo.info))
    ;(userInput || imageInfo.info) &&
      (await shareMessage({ conversation_id, conversation_info, message }))
  }

  const abortImage = () => {
    setImageInfo({ info: null, url: null })
  }


  return (
    <div className='min-h-[64px] flex items-center justify-between px-5 relative'>
      {imageInfo?.url ? (
        <div className='absolute h-[250px] bottom-[64px]'>
          <motion.img
            layout
            src={imageInfo.url}
            className='h-full transition-all'
            alt=''
          />
          <div
            className='absolute right-0 top-0 h-5 w-5 transition-all hover:bg-cyan-500 hover:filter hover:invert flex justify-center items-center'
            onClick={abortImage}
          >
            <img
              src='https://cdn-icons-png.flaticon.com/512/1828/1828778.png'
              className='h-[80%]'
              alt=''
            />
          </div>
        </div>
      ) : null}
      <form
        className='flex w-full justify-between items-center'
        onSubmit={handleMessageSubmit}
      >
        <input
          type='file'
          hidden
          name=''
          id='imageInput'
          onChange={handleFileChange}
          accept='image/*'
        />
        <label htmlFor='imageInput'>
          <div className='p-1 hover:bg-slate-200 transition-all rounded-md'>
            <img
              src='https://cdn-icons-png.flaticon.com/512/10054/10054290.png'
              className='h-8 cursor-pointer'
              alt=''
            />
          </div>
        </label>
        <div
          className={`p-1 hover:bg-slate-200 ${
            emojiButtonStatus.clicked ? `bg-slate-200` : ``
          } transition-all rounded-md relative`}
          onMouseEnter={() =>
            setEmojiButtonStatus(prev => ({ ...prev, hover: true }))
          }
          onMouseLeave={() =>
            setEmojiButtonStatus(prev => ({
              ...prev,
              hover: false
            }))
          }
          onClick={() =>
            setEmojiButtonStatus(prev => ({ ...prev, clicked: !prev.clicked }))
          }
        >
          <img
            src='https://cdn-icons-png.flaticon.com/512/166/166538.png'
            className='h-8 cursor-pointer'
            alt=''
          />
          {emojiButtonStatus.clicked || emojiButtonStatus.hover ? (
            <div className='absolute bottom-8'>
              <Picker
                className=''
                onEmojiSelect={e => {
                  let { native } = e
                  let userInputClone = cloneDeep(userInput)
                  userInputClone += native
                  setUserInput(userInputClone)
                }}
              />
            </div>
          ) : null}
        </div>
        <input
          type='text'
          name=''
          value={userInput}
          ref={userInputRef}
          id=''
          className='h-auto py-3 px-3 w-[85%] outline-none bg-gray-100 rounded-full text-lg text-slate-600'
          onChange={e => setUserInput(e.target.value)}
        />
        <button
          type='submit'
          className='h-8 w-8 flex justify-center items-center'
        >
          <img
            src='https://cdn-icons-png.flaticon.com/512/3682/3682321.png'
            className={`h-full ${!(userInput || imageInfo) ? `grayscale` : ``}`}
            alt=''
          />
        </button>
      </form>
    </div>
  )
}

export default ChatInput
