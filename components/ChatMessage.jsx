import { useUser } from '@clerk/nextjs'
import Avatar from './Avatar'
import ChatMessageText from './ChatMessageText'
import { useContext, useMemo } from 'react'
import { Appstate } from '@/hooks/context'

function ChatMessage ({ message }) {
  const { friends, selectedChatUser } = useContext(Appstate)
  const { user } = useUser()

  const userImageUrl = useMemo(() => {
    if (message.sender_id === user?.id) {
      return user.imageUrl
    } else {
      const friend_info = friends.find(
        friend => friend.user_id === message.sender_id
      )
      return friend_info?.user_img
    }
  }, [selectedChatUser])

  return (
    <div
      className={`w-full flex ${
        message.sender_id === user?.id ? `justify-end` : `justify-start`
      } p-2`}
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
      </div>
    </div>
  )
}

export default ChatMessage
