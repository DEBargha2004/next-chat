function RefMessage ({ refMessageInfo,onClick,className }) {

  
  return refMessageInfo?.sender_id ? (
    <div
      className={`${className} p-1 rounded-lg relative bg-[#0000001c] overflow-hidden w-full`}
      onClick={onClick}
    >
      <div className='h-full w-2 absolute -left-1 top-0' style={{backgroundColor : refMessageInfo.marker_color}} />
      <div className='pl-2'>
        <h1 className={`text-sm`} style={{ color: refMessageInfo.marker_color }}>
          {refMessageInfo?.sender}
        </h1>
        <div className='flex items-center'>
          {refMessageInfo?.message_type.image ? (
            <img
              src='https://cdn-icons-png.flaticon.com/512/16/16410.png'
              className='h-[13px] opacity-60 mr-1'
              alt=''
            />
          ) : null}
          {refMessageInfo?.message_type.text ? (
            <span>{refMessageInfo.message_data.text}</span>
          ) : null}
        </div>
      </div>
    </div>
  ) : null
}

export default RefMessage
