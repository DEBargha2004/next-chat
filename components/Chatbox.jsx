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
      {selectedChatUser.current_User_Name ? (
        <>
          <ChatBoxHeader />
          <MessagesList list={conversation} />
          <ChatInput />
        </>
      ) : (
        <div className='h-full w-full flex justify-center items-center flex-col'>
          <motion.img
            src='https://cdn-icons-png.flaticon.com/512/5968/5968771.png'
            className='h-[200px]'
            alt=''
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: '2s' }}
          />
          <h1
            className='mt-10 text-4xl text-slate-700'
            style={{ fontFamily: 'Rubik' }}
          >
            Messenger Clone for Web
          </h1>
        </div>
      )}
    </div>
  )
}

export default Chatbox
