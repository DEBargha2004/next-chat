'use client'

import ChatBoxHeader from '@/components/ChatBoxHeader'
import ChatInput from '@/components/ChatInput'
import MessagesList from '@/components/MessagesList'
import { selectUser } from '@/functions/selectUser'
import { Appstate } from '@/hooks/context'
import { useContext, useEffect, useMemo, useState } from 'react'

export default function page ({ params }) {
  const { friends, selectedChatUser, setSelectedChatUser,messages } =
    useContext(Appstate)
  const full_userid = `user_${params.userid}`
  const [showChatPage, setShowChatPage] = useState(true)

  useEffect(() => {
    if (selectedChatUser.current_User_Id !== full_userid) {
      const user_tobe_selected = friends.find(
        friend => friend.user_id === full_userid
      )
      if (user_tobe_selected) {
        selectUser({ setSelectedChatUser, item: user_tobe_selected })
        setShowChatPage(true)
      } else {
        setShowChatPage(false)
      }
    }
  }, [friends])


  
  return (
    <div className='w-full h-full'>
      {showChatPage ? (
        <>
          <ChatBoxHeader />
          <MessagesList />
          <ChatInput />
        </>
      ) : (
        <div className='w-full h-full flex justify-center items-center text-3xl text-red-500 font-bold'>
          {/* User doesnot exist */}
        </div>
      )}
    </div>
  )
}
