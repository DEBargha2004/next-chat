import React, { useEffect, useRef, useContext } from 'react'
import { Appstate } from '@/hooks/context'
import ChatMessage from './ChatMessage'

function MessagesList ({ list }) {
  const messagesListRef = useRef(null)
  const { messages,selectedChatUser } = useContext(Appstate)

  useEffect(() => {
    messagesListRef.current.scrollTo({
      behavior: 'smooth',
      top: messagesListRef.current.scrollHeight
    })
  }, [messages])
  console.log(selectedChatUser);
  return (
    <div
      className='overflow-y-scroll'
      style={{ height: `${window.innerHeight - 128}px` }}
      ref={messagesListRef}
      id='messageList'
    >
      {messages[selectedChatUser.current_User_Id]?.map((message, index) => {
        return <ChatMessage message={message} key={index} />
      })}
    </div>
  )
}

export default MessagesList
