import { useContext, useMemo } from 'react'
import { Appstate } from '@/hooks/context'
import Avatar from './Avatar'
import { generateTimeStamp } from '../functions/generateTime'

function ChatBoxHeader () {
  const { selectedChatUser, presenceInfo } = useContext(Appstate)

  const user_presence_info = useMemo(() => {
    const current_user = presenceInfo.find(
      user_presence_status =>
        user_presence_status?.user_id === selectedChatUser.current_User_Id
    )
    return {
      last_Seen: generateTimeStamp(current_user?.last_seen || 0),
      online: current_user?.online
    }
  }, [selectedChatUser, presenceInfo])

  return selectedChatUser.current_User_Id ? (
    <div className='w-full flex justify-between px-4 py-2 shadow-md shadow-[#00000017]'>
      <div className='flex justify-between'>
        <Avatar url={selectedChatUser?.current_User_Image} />
        <div className='h-full flex flex-col items-start justify-center ml-4'>
          <p>{selectedChatUser?.current_User_Name}</p>
          <p className={`text-slate-500 text-sm`}>
            {user_presence_info.online
              ? 'online'
              : user_presence_info?.last_Seen}
          </p>
        </div>
      </div>
    </div>
  ) : null
}

export default ChatBoxHeader
