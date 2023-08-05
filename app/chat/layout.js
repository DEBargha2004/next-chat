'use client'

import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import FriendSearch from '@/components/FriendSearch'
import FriendList from '@/components/FriendList'
import Userbox from '@/components/Userbox'
import { serviceList } from '@/constants/serviceList'
import { useUser } from '@clerk/nextjs'
import { useContext, useEffect } from 'react'
import { Appstate } from '@/hooks/context'

export default function RootLayout ({ children }) {
  const { setSearchedFriend, searchQuery, setSearchQuery } =
    useContext(Appstate)

  const groupElement = serviceList.find(service => service.service === 'groups')
  const { user } = useUser()

  const handleSearchUser = async e => {
    setSearchQuery(e.target.value)
    if (!e.target.value) {
      return
    }
    let searchList = await fetch(
      `/api/searchUser?userId=${user.id}&query=${e.target.value}&con_type=one-one-chat`,
      {
        method: 'GET'
      }
    )

    searchList = await searchList.json()

    setSearchedFriend(searchList)
  }

  useEffect(() => {
    if (!searchQuery) {
      setSearchedFriend && setSearchedFriend([])
    }
  }, [searchQuery])

  return (
    <>
      <Sidebar className={`w-[30%] border-r-[1px] border-slate-400`}>
        <Topbar linkedElement={groupElement} />
        <FriendSearch onChange={handleSearchUser} value={searchQuery} />
        <FriendList UserboxComponent={Userbox} />
      </Sidebar>
      <div className='w-[70%] h-full'>{children}</div>
    </>
  )
}
