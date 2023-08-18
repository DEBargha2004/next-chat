import {
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { firestoreDB } from '@/firebase.config'
import { leaveGroup } from '@/functions/leaveGroup'
import { useContext } from 'react'
import { Appstate } from '@/hooks/context'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { cloneDeep } from 'lodash'
import Image from 'next/image'

const RemoveParticipant = async ({ id, router, selectedGroup, user }) => {
  const docInfo = await getDoc(doc(firestoreDB, `groups/${selectedGroup?.id}`))
  const adminInfo = docInfo.get('admin')
  if (!adminInfo.includes(user?.id)) {
    alert('You are no longer an admin')
    return
  }
  const finalDecision = prompt('type REMOVE to remove participant')
  if (finalDecision === 'REMOVE') {
    if (
      selectedGroup?.owner?.user_id === user.id ||
      selectedGroup?.admin?.includes(user.id)
    ) {
      leaveGroup({ id, router, selectedGroup })
    }
  }
}

export const ParticipantsOverlay = ({
  onClick,
  showMoreInfo,
  user,
  setShowMoreInfo
}) => {
  const { selectedGroup, setSelectedGroup, setGroups } = useContext(Appstate)
  const router = useRouter()
  const { user: loggedUser } = useUser()

  const [isAdmin, setIsAdmin] = useState(
    selectedGroup?.admin?.includes(user.user_id)
  )

  const change_Participant_Status = async () => {
    const docInfo = await getDoc(
      doc(firestoreDB, `groups/${selectedGroup?.id}`)
    )
    const adminInfo = docInfo.get('admin')

    if (!adminInfo.includes(loggedUser?.id)) {
      setIsAdmin(false)
      alert('You are no longer an admin')
      return
    }
    if (!isAdmin) {
      await updateDoc(doc(firestoreDB, `groups/${selectedGroup.id}`), {
        admin: arrayUnion(user.user_id)
      })
      setSelectedGroup(prev => {
        prev = cloneDeep(prev)
        prev.admin.push(user.user_id)
        return prev
      })
      setGroups(prev => {
        prev = cloneDeep(prev)
        const index = prev.findIndex(group => group.id === selectedGroup.id)
        prev[index].admin.push(user.user_id)
        return prev
      })
      setIsAdmin(true)
    } else {
      await updateDoc(doc(firestoreDB, `groups/${selectedGroup.id}`), {
        admin: arrayRemove(user.user_id)
      })
      setSelectedGroup(prev => {
        prev = cloneDeep(prev)
        const index = prev.admin.indexOf(user.user_id)
        prev.admin.splice(index, 1)
        return prev
      })
      setGroups(prev => {
        prev = cloneDeep(prev)
        const group_index = prev.findIndex(
          group => group.id === selectedGroup.id
        )
        const user_index = prev[group_index].admin.indexOf(user.user_id)
        prev[group_index].admin.splice(user_index, 1)
        return prev
      })
      setIsAdmin(false)
    }
    setShowMoreInfo(false)
  }
  return (
    <div className='z-10 right-2 top-[50%] -translate-y-[50%] absolute transition-all'>
      <Image
        src='	https://cdn-icons-png.flaticon.com/512/2311/2311524.png'
        height={32}
        width={32}
        className='h-8 p-2 rounded-full hover:bg-gray-700 hover:invert'
        alt=''
        id='participantsInfo'
        onClick={e => {
          onClick(e)
          e.stopPropagation()
        }}
      />

      {showMoreInfo ? (
        <div
          className={`absolute z-20 right-5 top-5 transition-all bg-white shadow-lg px-2 py-1 rounded-lg`}
          onClick={e => e.stopPropagation()}
        >
          <ul className='cursor-pointer'>
            <li
              className='my-1 hover:bg-slate-100 px-4 py-2'
              onClick={change_Participant_Status}
            >
              {isAdmin ? `Demotion` : `Promotion`}
            </li>
            <li
              className='my-1 hover:bg-slate-100 px-4 py-2'
              onClick={() =>
                RemoveParticipant({
                  id: user.user_id,
                  router,
                  selectedGroup,
                  user: loggedUser
                })
              }
            >{`Remove`}</li>
          </ul>
        </div>
      ) : null}
    </div>
  )
}
