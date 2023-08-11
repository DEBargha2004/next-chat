'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import { Appstate } from '@/hooks/context'
import ChatBoxHeader from '@/components/ChatBoxHeader'
import MessagesList from '@/components/MessagesList'
import ChatInput from '@/components/ChatInput'
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
import Searchbar from '@/components/Searchbar'
import { handleSearchUser } from '@/functions/handleSearchUser'
import { cloneDeep } from 'lodash'
import Image from 'next/image'
import tick from '../../../public/tick.png'
import {
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import { firestoreDB } from '@/firebase.config'

function Page ({ params }) {
  const { groups, messages, setSelectedGroup, selectedGroup } =
    useContext(Appstate)

  const full_id = `group_${params.groupid}`
  const [showChatPage, setShowChatPage] = useState(true)
  const [rightSidebar, setRightSidebar] = useState(false)
  const [friendQuery, setFriendQuery] = useState('')
  const [selectedUsersId, setSelectedUsersId] = useState([])
  const [searchedFriend, setSearchedFriend] = useState([])
  const [noResponse, setNoResponse] = useState(false)
  const { user } = useUser()
  const addFriendDialogBoxRef = useRef(null)

  const handleSelectedUsers = userId => {
    if (!selectedUsersId.includes(userId)) {
      setSelectedUsersId(prev => [...prev, userId])
    } else {
      const index = selectedUsersId.indexOf(userId)
      setSelectedUsersId(prev => {
        prev = cloneDeep(prev)
        prev.splice(index, 1)
        return [...prev]
      })
    }
  }

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

  const openAddFriendDialog = () => {
    addFriendDialogBoxRef.current.showModal()
  }

  const closeAddFriendDialog = () => {
    if (noResponse) return
    addFriendDialogBoxRef.current.close()
    setFriendQuery('')
    setSearchedFriend([])
    setSelectedUsersId([])
  }

  const addSelectedFriends = async () => {
    if (!selectedUsersId.length) return
    if (noResponse) return
    setNoResponse(true)
    const conversation_info = {
      conversation_id: selectedGroup?.conversation_id,
      createdAt: selectedGroup?.createdAt,
      type: 'group'
    }
    for (const id of selectedUsersId) {
      await setDoc(
        doc(
          firestoreDB,
          `users/${id}/conversations/${selectedGroup?.conversation_id}`
        ),
        conversation_info
      )
      const userInfo = searchedFriend.find(friend => friend.user_id === id)
      await setDoc(
        doc(firestoreDB, `groups/${selectedGroup?.id}/participants/${id}`),
        {
          ...userInfo
        }
      )
      await updateDoc(doc(firestoreDB, `groups/${selectedGroup?.id}`), {
        participantsCount: increment(1)
      })
    }

    addFriendDialogBoxRef.current.close()
    setNoResponse(false)
  }

  const Overlay = () => {
    return (
      <div className='w-full h-full absolute top-0 left-0 -z-10 bg-green-300'>
        <Image
          src={tick.src}
          width={28}
          height={28}
          className='w-7 z-10 absolute right-4 top-[50%] -translate-y-[50%]'
        />
      </div>
    )
  }

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
            <RightSidebarCompWrapper>
              <button
                className='px-2 py-1 rounded bg-blue-600 text-white'
                onClick={openAddFriendDialog}
              >
                Add participant
              </button>
            </RightSidebarCompWrapper>
          </RightSidebar>
        </div>
      ) : (
        <div className='w-full h-full flex justify-center items-center text-3xl text-red-500 font-bold'>
          {/* User doesnot exist */}
        </div>
      )}

      <dialog ref={addFriendDialogBoxRef}>
        <Searchbar
          placeholder={`Search more`}
          value={friendQuery}
          onChange={e =>
            handleSearchUser({
              e,
              user_id: user?.id,
              excluded: selectedGroup?.participants.filter(
                participant => !participant.left
              ),
              setQuery: setFriendQuery
            }).then(result => {
              setSearchedFriend(result.data)
            })
          }
        />
        {searchedFriend.map(user => (
          <Userbox
            key={user.user_id}
            item={user}
            onClick={() => handleSelectedUsers(user.user_id)}
            selected={selectedUsersId.includes(user.user_id)}
            OverlayComponent={Overlay}
          />
        ))}
        <button
          className={`bg-blue-600 text-white px-2 py-1 rounded
          ${
            noResponse || !selectedUsersId.length
              ? `grayscale cursor-not-allowed`
              : ``
          }`}
          onClick={addSelectedFriends}
        >
          Add
        </button>
        <button
          className={`bg-red-500 text-white px-2 py-1 rounded ${
            noResponse ? `grayscale cursor-not-allowed` : ``
          }`}
          onClick={closeAddFriendDialog}
        >
          Cancel
        </button>
      </dialog>
    </>
  )
}

export default Page
