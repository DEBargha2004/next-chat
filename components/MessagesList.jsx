import React, { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'

function MessagesList ({ list }) {
  const messagesListRef = useRef(null)

  useEffect(()=>{
    messagesListRef.current.scrollTo({
      behavior : 'smooth',
      top : messagesListRef.current.scrollHeight
    })
  },[list])
  return (
    <div
      className='overflow-y-scroll'
      style={{ height: `${window.innerHeight - 128}px` }}
      ref={messagesListRef}
      id='messageList'
    >
      {list.map((message, index) => {
        return <ChatMessage type={message.type} message={message} url={list.url} />
      })}
    </div>
  )
}

export default MessagesList
