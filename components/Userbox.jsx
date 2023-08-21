// 'use client'

import Avatar from './Avatar'
import { useContext, useMemo, useState } from 'react'
import { Appstate } from '@/hooks/context'
import { useUser } from '@clerk/nextjs'
import messeage_CreatedAt from '@/functions/timeStamp_userbox'
import _, { cloneDeep } from 'lodash'
import messageStatus from '@/functions/messageStaus'
import { leaveGroup } from '@/functions/leaveGroup'
import { useRouter } from 'next/navigation'
import { arrayRemove, arrayUnion, doc, updateDoc,getDoc } from 'firebase/firestore'
import { firestoreDB } from '@/firebase.config'
import { Image } from 'next/image'
import { ParticipantsOverlay } from './ParticipantsOverlay'
import OverviewOfLast from './OverviewOfLast'


function Userbox ({
  item,
  include,
  onClick,
  selected,
  disableHoverEffect,
  OverlayComponent,
  address,
  badges,
  id,
  enableMoreInfo,
  essential
}) {
  const { user } = useUser()
  const { presenceInfo, messages, selectedGroup } = useContext(Appstate)
  const [showMoreInfo, setShowMoreInfo] = useState(false)

  //getting the online status
  const user_presense_info = useMemo(() => {
    return presenceInfo.find(
      userPresence => userPresence?.user_id === item?.user_id
    )
  }, [presenceInfo,item])

  const unreadMessages = useMemo(() => {
    const message_info = messages[id]
    const unread_message_info = message_info?.filter(
      message =>
        !message.read_by?.includes(user?.id) && message.sender_id !== user?.id
    )

    return unread_message_info
  }, [messages[id],id,user])

  const lastMessage = useMemo(() => {
    const messages_info = messages[id]
    const last_message_info = _.maxBy(messages_info, item =>
      _.get(item, 'message_createdAt.seconds')
    )
    // console.log(messages_info,last_message_info);
    return { ...last_message_info }
  }, [messages[id]])

  return (
    <div
      className={`relative flex items-center py-4 pl-4 ${
        disableHoverEffect ? `` : `hover:bg-gray-200`
      } `}
      onClick={onClick}
    >
      {selected ? <OverlayComponent /> : null}
      {enableMoreInfo ? (
        <ParticipantsOverlay
          onClick={e => setShowMoreInfo(prev => !prev)}
          showMoreInfo={showMoreInfo}
          user={item}
          setShowMoreInfo={setShowMoreInfo}
        />
      ) : null}
      <Avatar
        url={item.user_img}
        online={user_presense_info?.online}
        address={address}
        id={id}
      />
      <div className='h-10 ml-4 flex flex-col justify-center w-[75%]'>
        <div className='flex justify-between items-center'>
          <h1 className='flex items-center font-semibold'>
            {item.name || item.user_name || item.user_email}
          </h1>
          {/*based on condition*/}
          <div className='flex items-center justify-end w-[42%]'>
            {badges?.owner}
            {badges?.admin}
            <p className='text-sm'>
              {lastMessage && include?.lastMessageTime
                ? messeage_CreatedAt(
                    lastMessage.message_createdAt?.seconds * 1000 || null
                  )
                : null}
            </p>
          </div>
        </div>
        {/*based on condition*/}
        <div className='text-slate-500 text-[14px]'>
          {include?.lastMessage ? (
            <OverviewOfLast
              message={lastMessage}
              unread={unreadMessages}
              lastMessage={lastMessage}
              essential = {essential}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}


export default Userbox
