import { format } from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'
import { contentDB, firestoreDB } from '../firebase.config'
import { getDownloadURL, ref } from 'firebase/storage'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'
import deliver_letter_open from '../public/deliver-letter-open.png'
import deliver_letter_close from '../public/deliver-letter-close.png'
import delivering_letter from '../public/delivering-letter.png'

function ChatMessageText ({ message }) {
  const { user } = useUser()
  const messageTime = useMemo(() => {
    const time = format(
      new Date(message.message_createdAt?.seconds * 1000 || new Date()),
      'hh:mm a'
    )
    return time
  }, [message])

  const showSeenStatus = useMemo(() => {
    if (message.sender_id === user.id) {
      return {
        deliver: message.message_deliver,
        read: message.message_read
      }
    } else {
      return false
    }
  }, [message])

  useEffect(() => {
    if (!message.message_read && user.id === message.receiver_id) {
      updateDoc(
        doc(
          firestoreDB,
          `conversations/${message.conversation_id}/messages/${message.messageId}`
        ),
        {
          message_read: true,
          message_readAt: serverTimestamp()
        }
      )
    }
  }, [])

  return (
    <div
      className={`h-full flex flex-col items-center py-2 rounded-[15px] relative ${
        message.message_type === 'text' ? `px-4` : `px-2`
      } mx-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white min-w-[100px] max-w-[300px]`}
    >
      <ChatMessageComponent {...{ message }} />
      <div
        className={`w-full text-[10px] flex ${
          showSeenStatus ? 'justify-between' : 'justify-end'
        } items-center`}
      >
        {showSeenStatus ? (
          showSeenStatus.deliver ? (
            showSeenStatus.read ? (
              <img
                src={deliver_letter_open.src}
                className='h-4 w-auto'
                alt=''
              />
            ) : (
              <img
                src={deliver_letter_close.src}
                className='h-4 w-auto'
                alt=''
              />
            )
          ) : (
            <img src={delivering_letter.src} className='h-4 w-auto' alt='' />
          )
        ) : null}
        <p>{messageTime}</p>
      </div>
    </div>
  )
}

const handleImageLoad = () => {
  console.log('image loaded')
  const messageList = document.getElementById('messageList')
  messageList.scrollTo({
    behavior: 'smooth',
    top: messageList.scrollHeight
  })
}

export default ChatMessageText

function ChatMessageComponent ({ message }) {
  const [url, setUrl] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const contentRef = ref(contentDB, message.message_data.image)

  if (message.message_type.image) {
    getDownloadURL(contentRef)
      .then(url => {
        setUrl(url)
      })
      .catch(error => {
        switch (error.code) {
          case 'storage/object-not-found':
            setErrorMessage("File doesn't exist")
            break
          case 'storage/unauthorized':
            setErrorMessage("you don't have permission to access the file")
            break
          case 'storage/canceled':
            setErrorMessage('upload cancelled')
            break

          // ...

          case 'storage/unknown':
            setErrorMessage('server error')
            break
        }
      })
  }

  return (
    <div className='flex flex-col items-start w-full'>
      {url ? (
        <Image
          src={url}
          alt=''
          className='w-[300px] rounded-lg h-[300px] object-cover'
          onLoad={handleImageLoad}
          height={300}
          width={300}
        />
      ) : null}
      {errorMessage ? (
        <div className='w-full bg-slate-100 rounded-lg text-slate-500 p-2 italic'>
          {errorMessage}
        </div>
      ) : null}
      {message.message_type.text ? (
        <div className='w-full flex justify-start'>
          {message.message_data.text}
        </div>
      ) : null}
    </div>
  )
}