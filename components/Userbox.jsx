// 'use client'

import { currentUser, useAuth } from '@clerk/nextjs'
import Avatar from './Avatar'
import { useContext, useMemo } from 'react'
import { Appstate } from '@/hooks/context'
import {
  addSeconds,
  format,
  isSameDay,
  isSameHour,
  isSameMinute
} from 'date-fns'

function Userbox ({ item }) {
  const { setSelectedChatUser, selectedChatUser, presenceInfo } =
    useContext(Appstate)

  const generateTimeStamp = date => {
    const currentDate = new Date()
    const inputDate = new Date(date)
    if (isSameDay(currentDate, inputDate)) {
      if (isSameHour(currentDate, inputDate)) {
        if (isSameMinute(currentDate, inputDate)) {
          return `recently`
        }
        return `${
          currentDate.getMinutes() - format(inputDate, `mm`)
        } minutes ago`
      }
      return format(inputDate, 'hh:mm a')
    } else {
      return format(inputDate, 'MMM d hh:mm a')
    }
  }

  const user_presense_info = useMemo(() => {
    return presenceInfo.find(
      userPresence => userPresence.user_id === item.user_id
    )
  }, [presenceInfo])

  const selectUser = () => {
    setSelectedChatUser(prev => {
      const last_seen_time = generateTimeStamp(user_presense_info.last_seen)
      return {
        ...prev,
        current_User_Name: item.user_name,
        current_User_Image: item.user_img,
        online: user_presense_info.online,
        last_Seen: last_seen_time.toString(),
        current_User_Id: item.user_id
      }
    })
  }
  return (
    <div
      className={`flex py-4 hover:bg-gray-200 ${
        selectedChatUser.current_User_Id === item.user_id
          ? `bg-gray-200`
          : `bg-white`
      }`}
      onClick={selectUser}
    >
      <Avatar url={item.user_img} online={user_presense_info?.online} />
      <div className='h-10 ml-4 flex flex-col justify-center'>
        <h1 className='flex items-center font-semibold'>{item.user_name}</h1>
        {/* <p className='text-slate-500 text-[14px]'>{item.lastMessage}</p> */}
      </div>
    </div>
  )
}

export default Userbox
