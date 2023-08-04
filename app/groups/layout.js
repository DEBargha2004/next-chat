'use client'

import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { serviceList } from '@/constants/serviceList'
import { useEffect } from 'react'

export default function RootLayout ({ children }) {
  const chat = serviceList.find(service => service.service === 'chat')

  const toggleModal = () => {
    const dialogBox = document.querySelector('#createGroup')
    if (dialogBox.open){
        dialogBox.close()
    }else {
        dialogBox.showModal()
    }
  }

  useEffect(()=>{
    const dialogBox = document.querySelector('#createGroup')
    document.addEventListener('click',e => {
        console.log(e.target);
    })

    
  },[])

  return (
    <>
      <Sidebar className={`w-[30%] border-r-[1px] border-slate-400`}>
        <Topbar linkedElement={chat} />
        <div className='w-[90%] mx-auto p-1 bg-slate-200 rounded' onClick={toggleModal}>Create New Group</div>
      </Sidebar>
      <div className='w-[70%] h-full'>{children}</div>
      <dialog id='createGroup' className='p-10'>
        This is a dialog
        <button onClick={toggleModal}>Close</button>
      </dialog>
    </>
  )
}
