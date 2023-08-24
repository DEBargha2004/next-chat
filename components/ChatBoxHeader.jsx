import { useContext, useMemo } from 'react'
import { Appstate } from '@/hooks/context'
import Avatar from './Avatar'
import { generateTimeStamp } from '../functions/generateTime'
import { useUser } from '@clerk/nextjs'

function ChatBoxHeader ({ address, name, participants, type, onClick }) {
  const { selectedChatUser, presenceInfo, selectedGroup, typingsInfo } =
    useContext(Appstate)
  const { user } = useUser()

  const user_presence_info = useMemo(() => {
    const current_user = presenceInfo.find(
      user_presence_status =>
        user_presence_status?.user_id === selectedChatUser.user_id
    )
    return {
      last_Seen: generateTimeStamp(current_user?.last_seen || 0),
      online: current_user?.online
    }
  }, [selectedChatUser, presenceInfo])

  const ifId_exist = useMemo(() => {
    if (type === 'group') {
      return selectedGroup?.id
    } else if (type === 'one-one') {
      return selectedChatUser.user_id
    }
  }, [selectedChatUser, selectedGroup])

  const essential = useMemo(() => {
    let typerId
    let typingStatus
    if (type !== 'group') {
      typerId = typingsInfo[selectedChatUser?.conversation_id]?.typer
    } else {
      typerId = typingsInfo[selectedGroup?.conversation_id]?.typer
    }
    if (!typerId) return false
    if (typerId === user?.id) {
      return false
    } else {
      if (type === 'group') {
        const typerInfo = participants.find(
          participant => participant.user_id === typerId
        )
        typingStatus = `${
          typerInfo.user_name || typerInfo.user_email
        } is typing...`
      } else {
        typingStatus = `typing..`
      }
    }

    return typingStatus
  }, [typingsInfo, selectedChatUser, type, selectedGroup])

  return ifId_exist ? (
    <div className='w-full flex justify-between px-4 py-2 shadow-md shadow-[#00000017] truncate'>
      <div className='flex justify-between'>
        <Avatar
          url={selectedChatUser?.user_img}
          address={address}
          className={`shrink-0`}
        />
        <div
          className='h-full flex flex-col items-start justify-center ml-4 cursor-pointer'
          onClick={onClick}
        >
          <p>
            {name ||
              selectedChatUser?.user_name ||
              selectedChatUser?.user_email}
          </p>
          <p className={`text-slate-500 text-sm`}>
            {type !== 'group' ? (
              essential ? (
                <span className='text-green-500 font-semibold text-xs'>{`typing...`}</span>
              ) : user_presence_info.online ? (
                user_presence_info.online === 'away' ? (
                  '😴'
                ) : (
                  'online'
                )
              ) : (
                user_presence_info?.last_Seen
              )
            ) : null}
          </p>
          <div className='w-[400px] overflow-hidden'>
            {type === 'group' ? (
              <div className='flex items-center'>
                {essential
                  ? <span className='text-green-500 font-semibold text-xs'>{essential}</span>
                  : participants?.map(participant => (
                      <p
                        key={participant.user_id}
                        className={`text-xs shrink-0 ${
                          participant.isParticipant && `w-[60px]`
                        } truncate text-slate-600`}
                      >
                        {participant.isParticipant &&
                          (participant.user_name || participant.user_email)}
                        {}
                      </p>
                    ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  ) : null
}

export default ChatBoxHeader
