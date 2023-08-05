// 'use client'

import Avatar from './Avatar'
import { useContext, useMemo } from 'react'
import { Appstate } from '@/hooks/context'
import { selectUser } from '@/functions/selectUser'
import { useUser } from '@clerk/nextjs'
import messeage_CreatedAt from '@/functions/timeStamp_userbox'
import _, { cloneDeep } from 'lodash'
import { doc, getDoc } from 'firebase/firestore'
import { firestoreDB } from '@/firebase.config'
import messageStatus from '@/functions/messageStaus'

function Userbox ({ item, include,onClick }) {
  const { user } = useUser()
  const { setSelectedChatUser, selectedChatUser, presenceInfo, messages } =
    useContext(Appstate)

  //getting the online status
  const user_presense_info = useMemo(() => {
    return presenceInfo.find(
      userPresence => userPresence?.user_id === item?.user_id
    )
  }, [presenceInfo])

  const unreadMessages = useMemo(() => {
    const message_info = messages[item.user_id]
    const unread_message_info = message_info?.filter(
      message => !message.message_read && message.receiver_id === user.id
    )

    return unread_message_info
  }, [messages[item.user_id]])

  const lastMessage = useMemo(() => {
    const messages_info = messages[item.user_id]
    const last_message_info = _.maxBy(messages_info, item =>
      _.get(item, 'message_createdAt.seconds')
    )
    // console.log(messages_info,last_message_info);
    return { ...last_message_info }
  }, [messages[item.user_id]])

  const OverviewOfLast = ({ message, unread }) => {
    return (
      <div className='flex items-center justify-between w-full'>
        <div className='flex items-center w-[90%]'>
          {message?.message_type?.image ? (
            <img
              src='https://cdn-icons-png.flaticon.com/512/16/16410.png'
              className='h-4 opacity-60 mr-1'
            />
          ) : null}
          {message?.message_type?.text ? (
            <p className='line-clamp-1'>{message.message_data.text}</p>
          ) : null}
          <span className='ml-2'>{messageStatus(lastMessage)}</span>
        </div>

        {unread?.length ? (
          <div className='w-[18px] h-[18px] bg-green-500 rounded-full text-white text-[10px] flex justify-center items-center'>
            {unread?.length > 99 ? `99+` : unread?.length}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={`flex newitems-center py-4 pl-4 hover:bg-gray-200 ${
        selectedChatUser.current_User_Id === item.user_id
          ? `bg-gray-200`
          : `bg-white`
      }`}
      onClick={onClick}
    >
      <Avatar url={item.user_img} online={user_presense_info?.online} />
      <div className='h-10 ml-4 flex flex-col justify-center w-[75%]'>
        <div className='flex justify-between items-center'>
          <h1 className='flex items-center font-semibold'>{item.user_name}</h1>
          <p className='text-sm'>
            {lastMessage && include?.lastMessageTime
              ? messeage_CreatedAt(
                  lastMessage.message_createdAt?.seconds * 1000 || null
                )
              : null}
          </p>
        </div>
        <div className='text-slate-500 text-[14px]'>
          {include?.lastMessage ? (
            <OverviewOfLast message={lastMessage} unread={unreadMessages} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Userbox
