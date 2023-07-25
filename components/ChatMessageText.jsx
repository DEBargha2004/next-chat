function ChatMessageText ({ data, type }) {
  return (
    <div className={`h-full flex items-center py-2 ${type === 'text' ? `px-4 rounded-[30px]` : `px-2 rounded-[15px]`} mx-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white max-w-[350px]`}>
      <ChatMessageComponent {...{ type, data }} />
    </div>
  )
}

export default ChatMessageText

function ChatMessageComponent ({ data, type }) {
  switch (type) {
    case 'image':
      return (
        <div>
          <img src={data} alt='' className='w-[300px] rounded-lg' />
        </div>
      )
      break
    case 'text':
      return <div>{data}</div>
      break
    default:
      break
  }
}
