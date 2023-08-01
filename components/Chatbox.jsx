'use client'

import { useContext, useMemo } from 'react'
import { Appstate } from '@/hooks/context'
import ChatBoxHeader from './ChatBoxHeader'
import MessagesList from './MessagesList'
import ChatInput from './ChatInput'
import { motion } from 'framer-motion'

function Chatbox ({ className }) {
  const { selectedChatUser, messages } = useContext(Appstate)

  const conversation = useMemo(() => {
    return messages[selectedChatUser.current_User_Id]
  }, [selectedChatUser])

  return (
    <div className={`${className} w-full border-l-[1px] border-slate-500`}>
      {/* {selectedChatUser.current_User_Name ? (
        <>
          <ChatBoxHeader />
          <MessagesList list={conversation} />
          <ChatInput />
        </>
      ) : (
        
      )} */}
    </div>
  )
}

export default Chatbox
