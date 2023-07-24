import { useContext } from 'react'
import { Appstate } from '@/hooks/context'
import Avatar from './Avatar'

function ChatBoxHeader () {
  const { selectedChatUser } = useContext(Appstate)
  return (
    <div className='w-full flex justify-between px-4 py-2 shadow-md shadow-[#00000017]'>
      <div className='flex justify-between'>
        <Avatar url={selectedChatUser.current_User_Image} />
        <div className='h-full flex flex-col items-start justify-center ml-4'>
          <p>{selectedChatUser.current_User_Name}</p>
          <p className={``}>{selectedChatUser.online ? 'online' : selectedChatUser.last_Seen}</p>
        </div>
      </div>
    </div>
  )
}

export default ChatBoxHeader
