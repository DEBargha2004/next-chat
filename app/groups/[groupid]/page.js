'use client'

import { useContext, useEffect, useState } from 'react'
import { Appstate } from '@/hooks/context'
import ChatBoxHeader from '@/components/ChatBoxHeader'
import MessagesList from '@/components/MessagesList'
import ChatInput from '@/components/ChatInput'
import { motion } from 'framer-motion'
import RightSidebar from '@/components/RightSidebar'
import AdminBadge from '@/components/Badges/AdminBadge'
import OwnerBadge from '@/components/Badges/OwnerBadge'
import RightSidebarCompWrapper from '@/components/RightSidebarCompWrapper'
import Avatar from '@/components/Avatar'
import format from 'date-fns/format'
import Userbox from '@/components/Userbox'
import { handleSelectUser_For_Conversation } from '@/functions/handleSelectUser_For_Conversation'
import { leaveGroup } from '@/functions/leaveGroup'
import { useUser } from '@clerk/nextjs'

function Page ({ params }) {
  const {
    groups,
    selectedChatUser,
    setSelectedChatUser,
    messages,
    setSelectedGroup,
    selectedGroup
  } = useContext(Appstate)
  const full_id = `group_${params.groupid}`
  const [showChatPage, setShowChatPage] = useState(true)
  const [rightSidebar, setRightSidebar] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    if (selectedGroup?.id !== full_id) {
      const group_tobe_selected = groups.find(group => group.id === full_id)
      if (group_tobe_selected) {
        setSelectedGroup(group_tobe_selected)
        setShowChatPage(true)
      } else {
        setShowChatPage(false)
      }
    }
  }, [groups])

  return (
    <>
      {showChatPage ? (
        <div className='w-full h-full flex justify-between items-center overflow-hidden'>
          <div
            className={`h-full  transition-all duration-500 shrink-0`}
            style={{ width: rightSidebar ? `60%` : `100%` }}
          >
            <ChatBoxHeader
              address={selectedGroup?.img}
              name={selectedGroup?.name}
              participants={selectedGroup?.participants}
              type='group'
              onClick={() => setRightSidebar(prev => !prev)}
            />
            <MessagesList
              list={messages[selectedGroup?.id]}
              database={selectedGroup?.participants}
            />
            <ChatInput type='group' width={rightSidebar ? `80%` : ``} />
          </div>
          <RightSidebar open={rightSidebar} type='group'>
            <RightSidebarCompWrapper>
              <div className='w-full flex flex-col items-center justify-between'>
                <Avatar
                  address={selectedGroup?.img}
                  className={`w-[80px] h-[80px]`}
                />
                <p className='text-xl font-semibold mt-2'>
                  {selectedGroup?.name}
                </p>
                <p className='text-slate-500 text-xs'>
                  Group &#x2022; {selectedGroup?.participantsCount} participants
                </p>
              </div>
            </RightSidebarCompWrapper>
            <RightSidebarCompWrapper>
              <div className='flex flex-col items-start justify-between'>
                <p className='text- mb-2'>{selectedGroup?.description}</p>
                <p className='text-xs text-slate-500 font-medium'>
                  Created by {selectedGroup?.owner?.user_name},{` `}
                  {format(selectedGroup?.createdAt?.seconds || 0, 'dd/MM/yy')}
                </p>
              </div>
            </RightSidebarCompWrapper>
            <RightSidebarCompWrapper disablePadding>
              <div>
                <div className='flex justify-between items-center text-md text-slate-500 p-3'>
                  {selectedGroup?.participantsCount} participants
                </div>
                <div className='pb-4'>
                  {selectedGroup?.participants?.map(participant => {
                    const linkRef = participant.user_id.replace('user_', '')
                    return !participant.left ? (
                      <Userbox
                        key={participant.user_id}
                        item={participant}
                        id={participant.user_id}
                        onClick={() =>
                          participant.user_id === user?.id
                            ? null
                            : handleSelectUser_For_Conversation({
                                participant,
                                router,
                                setFriends,
                                setSelectedService,
                                user
                              })
                        }
                        badges={{
                          owner:
                            selectedGroup?.owner?.user_id ===
                            participant.user_id
                              ? OwnerBadge()
                              : null,
                          admin: selectedGroup?.admin?.includes(
                            participant.user_id
                          )
                            ? AdminBadge()
                            : null
                        }}
                        disableHoverEffect={
                          participant.user_id === user?.id ? true : false
                        }
                      />
                    ) : null
                  })}
                </div>
              </div>
            </RightSidebarCompWrapper>
            <RightSidebarCompWrapper>
              <div className='flex justify-center'>
                <button
                  className='bg-red-500 text-white w-[70%] transition-all py-1 rounded uppercase hover:bg-red-700 '
                  onClick={() => leaveGroup({ user, selectedGroup, router })}
                >
                  Leave
                </button>
              </div>
            </RightSidebarCompWrapper>
          </RightSidebar>
        </div>
      ) : (
        <div className='w-full h-full flex justify-center items-center text-3xl text-red-500 font-bold'>
          {/* User doesnot exist */}
        </div>
      )}
    </>
  )
}

export default Page
