import { Appstate } from '@/hooks/context'
import { useContext, useState } from 'react'
import Avatar from './Avatar'
import RightSidebarCompWrapper from './RightSidebarCompWrapper'
import { format } from 'date-fns'
import Userbox from './Userbox'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import OwnerBadge from './Badges/OwnerBadge'
import AdminBadge from './Badges/AdminBadge'
import { leaveGroup } from '@/functions/leaveGroup'
import handleSelectUser_For_Conversation from '@/functions/handleSelectUser_For_Conversation'

function RightSidebar ({ open, type, children }) {
  const { selectedGroup, setSelectedChatUser, setSelectedService, setFriends } =
    useContext(Appstate)
  const { user } = useUser()
  const router = useRouter()

  return (
    <div
      className={`h-full overflow-y-scroll transition-all duration-500 bg-white shrink-0`}
      // style={{ width: open ? `35%` : `0` }}
      style={{ width: `40%` }}
    >
      {children}
    </div>
  )
}

export default RightSidebar
