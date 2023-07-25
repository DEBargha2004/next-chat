// 'use client'

import Avatar from './Avatar'
import { useContext, useMemo } from 'react'
import { Appstate } from '@/hooks/context'
;('date-fns')

function Userbox ({ item }) {
  const { setSelectedChatUser, selectedChatUser, presenceInfo } =
    useContext(Appstate)

  const user_presense_info = useMemo(() => {
    return presenceInfo.find(
      userPresence => userPresence.user_id === item.user_id
    )
  }, [presenceInfo])

  const OverviewOfLast = ({message}) => {
    switch (message?.message_type) {
      case 'text':
        return message.message_data
    
      default:
        break;
    }

  }

  const selectUser = () => {
    setSelectedChatUser(prev => {
      return {
        ...prev,
        current_User_Name: item.user_name,
        current_User_Image: item.user_img,
        current_User_Id: item.user_id
      }
    })
  }
  return (
    <div
      className={`flex py-4 pl-4 hover:bg-gray-200 ${
        selectedChatUser.current_User_Id === item.user_id
          ? `bg-gray-200`
          : `bg-white`
      }`}
      onClick={selectUser}
    >
      <Avatar url={item.user_img} online={user_presense_info?.online} />
      <div className='h-10 ml-4 flex flex-col justify-center'>
        <h1 className='flex items-center font-semibold'>{item.user_name}</h1>
        <p className='text-slate-500 text-[14px]'>
          <OverviewOfLast message={item.lastMessage} />
        </p>
      </div>
    </div>
  )
}

export default Userbox
