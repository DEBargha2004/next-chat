import { getImage } from '@/functions/getImage'
import { Appstate } from '@/hooks/context'
import { useContext, useEffect, useMemo, useState } from 'react'
import Avatar from './Avatar'
import RightSidebarCompWrapper from './RightSidebarCompWrapper'
import { format } from 'date-fns'
import Userbox from './Userbox'
import Link from 'next/link'
import { selectUser } from '@/functions/selectUser'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { arrayRemove, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { firestoreDB } from '@/firebase.config'

function RightSidebar ({ open, type }) {
  const { selectedGroup, setSelectedChatUser, setSelectedService } =
    useContext(Appstate)
  const { user } = useUser()
  const router = useRouter()
  const [groupImgUrl, setGroupImgUrl] = useState('')

  const ownerBadge = () => {
    return (
      <img
        src='https://cdn-icons-png.flaticon.com/512/1828/1828884.png'
        className='h-4'
      />
    )
  }

  const adminBadge = () => {
    return (
      <span className='text-green-700 bg-green-200 px-2 py-1 rounded text-[10px]'>
        Group Admin
      </span>
    )
  }

  const handleSelectUser = participant => {
    const linkRef = `/chat/${participant.user_id.replace('user_', '')}`
    if (user?.id === participant.user_id) {
      return
    } else {
      selectUser({ setSelectedChatUser, item: participant })
      router.push(linkRef)
      setSelectedService('/chat')
    }
  }

  const leaveGroup = async () => {
    const finalDecision = prompt('Enter Confirm to exit')
    if (finalDecision !== `Confirm`) return
    const user_id = user?.id
    const isOwner = Boolean(selectedGroup?.user_id)
    const isAdmin = selectedGroup?.admin.includes(user_id)
    const isParticipant = selectedGroup?.participants?.find(
      participant => participant.user_id === user_id
    )

    isParticipant &&
      (await updateDoc(
        doc(firestoreDB, `groups/${selectedGroup?.id}/participants/${user_id}`),
        {
          left: true
        }
      ))

    isOwner &&
      (await updateDoc(doc(firestoreDB, `groups/${selectedGroup?.id}`), {
        owner: {}
      }))
    isAdmin &&
      (await updateDoc(doc(firestoreDB, `groups/${selectedGroup?.id}`), {
        admin: arrayRemove(user?.id)
      }))
    await deleteDoc(
      doc(
        firestoreDB,
        `users/${user?.id}/conversations/${selectedGroup?.conversation_id}`
      )
    )

    router.replace(`/groups`)
  }

  return (
    <div
      className={`h-full overflow-y-scroll transition-all duration-500 bg-white shrink-0`}
      // style={{ width: open ? `35%` : `0` }}
      style={{ width: `40%` }}
    >
      <RightSidebarCompWrapper>
        <div className='w-full flex flex-col items-center justify-between'>
          <Avatar
            address={selectedGroup?.img}
            className={`w-[80px] h-[80px]`}
          />
          <p className='text-3xl font-semibold my-2 mx-5 text-center'>
            {selectedGroup?.name}
          </p>
          <p className='text-slate-500'>
            Group &#x2022; {selectedGroup?.participantsCount} participants
          </p>
        </div>
      </RightSidebarCompWrapper>
      <RightSidebarCompWrapper>
        <div className='flex flex-col items-start justify-between'>
          <p className='text-lg mb-2'>{selectedGroup?.description}</p>
          <p className='text-sm text-slate-500 font-medium'>
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
                  onClick={() =>
                    participant.user_id === user?.id
                      ? null
                      : handleSelectUser(participant)
                  }
                  badges={{
                    owner:
                      selectedGroup?.owner?.user_id === participant.user_id
                        ? ownerBadge()
                        : null,
                    admin: selectedGroup?.admin?.includes(participant.user_id)
                      ? adminBadge()
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
            onClick={leaveGroup}
          >
            Leave
          </button>
        </div>
      </RightSidebarCompWrapper>
    </div>
  )
}

export default RightSidebar
