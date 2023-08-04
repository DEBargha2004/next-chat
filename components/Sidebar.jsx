import { useContext, useEffect, useRef } from 'react'
import { Appstate } from '@/hooks/context'


function Sidebar ({ className,children }) {
  const { setSelectedChatUser, selectedService } = useContext(Appstate)
  const sidebarRef = useRef(null)

  useEffect(() => {
    setSelectedChatUser(prev => ({
      ...prev,
      current_User_Name: '',
      current_User_Image: '',
      last_Seen: '',
      online: false,
      current_User_Id: null
    }))
  }, [selectedService])

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
