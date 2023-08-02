import { Appstate } from '@/hooks/context'
import { useUser } from '@clerk/nextjs'
import { useContext, useEffect, useState } from 'react'

export default function FriendSearch () {
  const { setSearchedFriend, searchedFriend, searchQuery, setSearchQuery } =
    useContext(Appstate)

  const { user } = useUser()

  const handleSearchUser = async e => {
    setSearchQuery(e.target.value)
    if (!e.target.value) {
      return
    }
    let searchList = await fetch(
      `/api/searchUser?userId=${user.id}&query=${e.target.value}`,
      {
        method: 'GET'
      }
    )

    searchList = await searchList.json()

    setSearchedFriend(searchList)
  }

  useEffect(() => {
    if (!searchQuery) {
      setSearchedFriend([])
    }
  }, [searchQuery])

  return (
    <div className='w-full p-2 my-2 px-4 rounded-md box-border'>
      <div className='relative'>
        <input
          type='text'
          className='outline-none border-[1px] border-slate-400 w-full h-10 px-2 text-slate-600 border-b-4 border-b-indigo-500 rounded-md'
          placeholder='search a friend or a group'
          onChange={handleSearchUser}
          value={searchQuery}
        />
        <img
          src='https://cdn-icons-png.flaticon.com/512/54/54481.png'
          className='h-5 absolute right-2 top-[10px] opacity-60 scale-90'
          alt=''
        />
      </div>
    </div>
  )
}
