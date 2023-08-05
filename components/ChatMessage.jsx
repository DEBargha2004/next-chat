import { useUser } from '@clerk/nextjs'
import Avatar from './Avatar'
import ChatMessageText from './ChatMessageText'
import { useContext, useMemo, useState } from 'react'
import { Appstate } from '@/hooks/context'

function ChatMessage ({ message }) {
  const { friends, selectedChatUser,setReferenceMessage,referenceMessage } = useContext(Appstate)
  const { user, isLoaded } = useUser()
  const [isHovering, setIsHovering] = useState(false)

  const userImageUrl = useMemo(() => {
    if (message.sender_id === user?.id) {
      return user.imageUrl
    } else {
      const friend_info = friends.find(
        friend => friend.user_id === message.sender_id
      )
      return friend_info?.user_img
    }
  }, [selectedChatUser, isLoaded])

  return (
    <div
      className={`w-full flex ${
        message.sender_id === user?.id ? `justify-end` : `justify-start`
      } p-2`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className={`flex items-center ${
          message.sender_id === user?.id ? `flex-row-reverse` : ``
        }`}
      >
        <div className='flex h-full items-start'>
          <Avatar url={userImageUrl} className={`h-8 w-8`} />
        </div>
        <ChatMessageText message={message} />
        {isHovering ? (
          <img
            src='https://cdn-icons-png.flaticon.com/512/3388/3388597.png'
            className='h-6 ml-4 mr-4 p-1 cursor-pointer'
            alt=''
            onClick={()=>setReferenceMessage(message)}
          />
        ) : null}
      </div>
    </div>
  )
}

export default ChatMessage
