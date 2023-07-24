function ChatMessageText ({ text, type, url }) {
  return (
    <div className={`h-full flex items-center py-2 ${type === 'text' ? `px-4 rounded-[30px]` : `px-2 rounded-[15px]`} mx-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white max-w-[350px]`}>
      <ChatMessageComponent {...{ type, text, url }} />
    </div>
  )
}

export default ChatMessageText

function ChatMessageComponent ({ text, type, url }) {
  switch (type) {
    case 'image':
      return (
        <div>
          <img src={url} alt='' className='w-[300px] rounded-lg' />
        </div>
      )
      break
    case 'text':
      return <div>{text}</div>
      break
    default:
      break
  }
}
