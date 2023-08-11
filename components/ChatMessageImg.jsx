import Image from "next/image"

function ChatMessageImg({url}) {

  return (
    <Image height={40} width={40}  src={url} className="h-10" alt="" />
  )
}

export default ChatMessageImg