'use client'

import React, { useEffect, useRef, useContext } from 'react'
import { Appstate } from '@/hooks/context'
import ChatMessage from './ChatMessage'
import RefMessage from './RefMessage'
import ChatInputImage from './ChatInputImage'

function MessagesList ({}) {
  const messagesListRef = useRef(null)
  const {
    messages,
    selectedChatUser,
    refMessageInfo,
    setImageInfo,
    imageInfo,
    setReferenceMessage
  } = useContext(Appstate)

  useEffect(() => {
    messagesListRef.current.scrollTo({
      behavior: 'smooth',
      top: messagesListRef.current.scrollHeight
    })
  }, [messages, selectedChatUser])

  // useEffect(() => {
  //   messagesListRef.current.style.height = `${window.innerHeight - 128}px`
  // }, [])

  useEffect(()=>{
    const messageList = document.getElementById('messageList')
    messageList.scrollTo({
      top : messageList.scrollHeight,
      behavior : 'smooth'
    })
  },[imageInfo,refMessageInfo])

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
      <div className='w-[98%] mx-auto'>
        <RefMessage refMessageInfo={refMessageInfo} onClick={() => setReferenceMessage(null)} />
        <ChatInputImage imageInfo={imageInfo} setImageInfo={setImageInfo} />
      </div>
    </div>
  )
}

export default MessagesList
