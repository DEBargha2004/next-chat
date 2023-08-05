'use client'

import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { serviceList } from '@/constants/serviceList'
import { useEffect, useState } from 'react'
import Searchbar from '@/components/Searchbar'
import { handleSearchUser } from '@/functions/handleSearchUser'
import { useUser } from '@clerk/nextjs'
import Userbox from '@/components/Userbox'

export default function RootLayout ({ children }) {
  const chat = serviceList.find(service => service.service === 'chat')

  const { user } = useUser()

  const [query, setQuery] = useState('')
  const [users_result, setUsers_result] = useState([])
  const [dialogQuery, setDialogQuery] = useState([])

  const toggleModal = () => {
    const dialogBox = document.querySelector('#createGroup')
    if (dialogBox.open) {
      dialogBox.close()
    } else {
      dialogBox.showModal()
    }
  }

  const createGroup = () => {
    // Do something
  }

  const handle_Dialog_Query_Change = async e => {
    if(!e.target.value){
      setUsers_result([])
    }
    await handleSearchUser({
      e,
      user_id: user.id,
      setQuery: setDialogQuery,
      setSearchResult: setUsers_result
    })
  }

  useEffect(() => {
    const dialogBox = document.querySelector('#createGroup')
    document.addEventListener('click', e => {
      console.log(e.target)
    })
  }, [])

  return (
    <>
      <Sidebar className={`w-[30%] border-r-[1px] border-slate-400`}>
        <Topbar linkedElement={chat} />
        <div
          className='w-[90%] mx-auto p-1 bg-slate-200 rounded mt-3'
          onClick={toggleModal}
        >
          Create New Group
        </div>
        <Searchbar
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Search for a group`}
        />
      </Sidebar>
      <div className='w-[70%] h-full'>{children}</div>
      <dialog
        id='createGroup'
        className='p-5 transition-all w-[40%] rounded-xl shadow-2xl'
      >
        <div className='w-[90%] mx-auto'>
          <Searchbar
            placeholder={`Find Users`}
            value={dialogQuery}
            onChange={handle_Dialog_Query_Change}
          />
          <div
            className={`h-[300px] ${
              users_result.length && `overflow-y-scroll`
            }`}
          >
            {users_result.data?.map((user, index) => (
              <Userbox item={user} key={index} onClick={(user) => handleSelect_Participants(user)} />
            ))}
          </div>
        </div>
        <div className='w-[80%] mx-auto flex items-center justify-between'>
          <button
            onClick={toggleModal}
            className='px-4 py-2 bg-red-500 w-[45%] text-white rounded-lg'
          >
            Cancel
          </button>
          <button
            onClick={createGroup}
            className='px-4 py-2 w-[45%] bg-green-500 text-white rounded-lg'
          >
            Create
          </button>
        </div>
      </dialog>
    </>
  )
}
