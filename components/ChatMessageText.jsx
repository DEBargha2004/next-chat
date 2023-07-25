import { format } from 'date-fns'
import { useMemo, useRef, useState } from 'react'
import { contentDB } from '../firebase.config'
import { getDownloadURL, ref } from 'firebase/storage'

function ChatMessageText ({ message }) {
  const messageTime = useMemo(() => {
    const time = format(
      new Date(message.message_createdAt?.seconds * 1000 || new Date()),
      'hh:mm a'
    )
    return time
  }, [message])
  return (
    <div
      className={`h-full flex flex-col items-center py-2 rounded-[15px] ${
        message.message_type === 'text' ? `px-4` : `px-2`
      } mx-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white min-w-[100px] max-w-[300px]`}
    >
      <ChatMessageComponent {...{ message }} />
      <div className='w-full text-[10px] flex justify-end'>{messageTime}</div>
    </div>
  )
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
            setErrorMessage('you don\'t have permission to access the file')
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
      {url ? <img src={url} alt='' className='w-[300px] rounded-lg' /> : null}
      {errorMessage ? <div className='w-full bg-slate-100 rounded-lg text-slate-500 p-2 italic'>{errorMessage}</div> : null}
      {message.message_type.text ? (
        <div className='w-full flex justify-start'>
          {message.message_data.text}
        </div>
      ) : null}
    </div>
  )
}
