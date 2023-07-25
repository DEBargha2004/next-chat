'use client'

import { useContext, useEffect, useMemo, useRef } from 'react'
import { Appstate } from '@/hooks/context'
import ChatBoxHeader from './ChatBoxHeader'
import MessagesList from './MessagesList'
import ChatInput from './ChatInput'

function Chatbox ({ className }) {
  const { selectedChatUser,messages } = useContext(Appstate)

  // const messages = [
  //   {
  //     sender_id: 'b',
  //     receiver_id: 'a',
  //     type: 'text',
  //     message:
  //       'hodhew dewdho 3e8u908 8ru 94ru398r 9r8r98 r38r 8r i3e 238 e9823uer39 2938re 983ur9 9238reu32 9r u29r 8',
  //     serder_img:
  //       'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80'
  //   },
  //   {
  //     sender_id: 'a',
  //     receiver_id: 'b',
  //     type: 'text',
  //     message: 'hodhew dewdho',
  //     serder_img:
  //       'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80'
  //   },
  //   {
  //     sender_id: 'b',
  //     receiver_id: 'a',
  //     type: 'text',
  //     message: 'hodhew dewdho',
  //     serder_img:
  //       'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80'
  //   },
  //   {
  //     sender_id: 'a',
  //     receiver_id: 'b',
  //     type: 'text',
  //     message: 'hodhew dewdho',
  //     serder_img:
  //       'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80'
  //   },
  //   {
  //     sender_id: 'a',
  //     receiver_id: 'b',
  //     type: 'text',
  //     message: 'hodhew dewdho',
  //     serder_img:
  //       'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80'
  //   },
  //   {
  //     sender_id: 'a',
  //     receiver_id: 'b',
  //     type: 'text',
  //     message: 'hodhew dewdho',
  //     serder_img:
  //       'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80'
  //   },
  //   {
  //     sender_id: 'b',
  //     receiver_id: 'a',
  //     type: 'text',
  //     message: 'hodhew dewdho',
  //     serder_img:
  //       'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80'
  //   },
  //   {
  //     sender_id: 'a',
  //     receiver_id: 'b',
  //     type: 'text',
  //     message: 'hodhew dewdho',
  //     serder_img:
  //       'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80'
  //   },
  //   {
  //     sender_id: 'a',
  //     receiver_id: 'b',
  //     type: 'text',
  //     message: 'hodhew dewdho',
  //     serder_img:
  //       'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80'
  //   },
  //   {
  //     sender_id: 'a',
  //     receiver_id: 'b',
  //     type: 'image',
  //     url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80',
  //     serder_img:
  //       'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80'
  //   }
  // ]

  const conversation = useMemo(()=>{
    return messages[selectedChatUser.current_User_Id]
  },[selectedChatUser])

  return (
    <div className={`${className} w-full border-l-2 border-slate-500`}>
      {selectedChatUser.current_User_Name ? (
        <>
          <ChatBoxHeader />
          <MessagesList list={conversation} />
          <ChatInput />
        </>
      ) : (
        <div className='h-full w-full flex justify-center items-center'>
          Select a User to start conversation
        </div>
      )}
    </div>
  )
}

export default Chatbox
