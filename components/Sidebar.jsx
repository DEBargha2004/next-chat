import { useContext, useEffect, useRef } from 'react'
import { Appstate } from '@/hooks/context'


function Sidebar ({ className,children }) {
  const { setSelectedChatUser, selectedService } = useContext(Appstate)
  const sidebarRef = useRef(null)


  useEffect(()=>{
    sidebarRef.current.style.height = `${window.innerHeight}px`
  },[])
  return (
    <div className={`${className} overflow-y-scroll sidebar`} ref={sidebarRef}>
      {
        children
      }
    </div>
  )
}

export default Sidebar
