import { useContext, useEffect, useRef } from 'react'
import FriendList from './FriendList'
import { Appstate } from '@/hooks/context'
import FriendSearch from './FriendSearch'
import Topbar from './Topbar'

function Sidebar ({ className }) {
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
      <Topbar />
      <FriendSearch />
      <FriendList />
    </div>
  )
}

export default Sidebar
