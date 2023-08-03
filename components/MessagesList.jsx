'use client'

import React, { useEffect, useRef, useContext, useState } from 'react'
import { Appstate } from '@/hooks/context'
import ChatMessage from './ChatMessage'

function MessagesList ({  }) {
  const messagesListRef = useRef(null)
  const { messages, selectedChatUser } = useContext(Appstate)

  useEffect(() => {
    messagesListRef.current.scrollTo({
      behavior: 'smooth',
      top: messagesListRef.current.scrollHeight
    })
  }, [messages, selectedChatUser])

  // useEffect(() => {
  //   messagesListRef.current.style.height = `${window.innerHeight - 128}px`
  // }, [])

  return (
    <div
      className='overflow-y-scroll -z-10 h-[calc(100%-128px)]'
      // style={{ height: `${0}px` }}
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
