'use client'

import Avatar from './Avatar';
import ChatMessageText from './ChatMessageText'

function ChatMessage ({ message }) {
  return (
    <div className={`w-full flex ${message.sender_id === `a` ? `justify-end` : `justify-start`} p-2`}>
      <div className={`flex ${message.sender_id === `a` ? `flex-row-reverse` : ``}`}>
        <Avatar url={message.serder_img} />
        <ChatMessageText text={message.message} type={message.type} url={message.url} />
      </div>
    </div>
  )
}

export default ChatMessage
