import Image from 'next/image'
import { useEffect, useState } from 'react'

function RefMessage ({ refMessageInfo, onClick, className, type }) {
  const [markerColor,setMarkerColor] = useState('')
  useEffect(()=>{
    if(refMessageInfo?.sender_id){
      setMarkerColor(refMessageInfo.marker_color)
    }
  },[refMessageInfo])
  return (
    <div
      className={`${className} ${
        refMessageInfo?.sender_id
          ? `py-1 ${type === `h-fit` ? `` : `h-[50px]`}`
          : `h-0`
      } px-1 rounded-lg relative bg-[#0000001c] overflow-hidden w-full transition-all`}
      onClick={onClick}
    >
      <div
        className='h-full w-2 absolute -left-1 top-0'
        style={{ backgroundColor: refMessageInfo?.marker_color || markerColor }}
      />
      <div className='pl-2'>
        <h1
          className={`text-sm`}
          style={{ color: refMessageInfo?.marker_color }}
        >
          {refMessageInfo?.sender}
        </h1>
        <div className='flex items-center'>
          {refMessageInfo?.message_type?.image ? (
            <Image
              width={13}
              height={13}
              src='https://cdn-icons-png.flaticon.com/512/16/16410.png'
              className='h-[13px] opacity-60 mr-1'
              alt=''
            />
          ) : null}

          <span className='line-clamp-1'>
            {refMessageInfo?.message_data?.text}
          </span>
        </div>
      </div>
    </div>
  )
}

export default RefMessage
