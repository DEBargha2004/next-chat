import messageStatus from '@/functions/messageStaus'
import Image from 'next/image'

const OverviewOfLast = ({ message, unread, lastMessage, essential }) => {
  return (
    <div className='flex items-center justify-between w-full'>
      <div className='flex items-center w-[90%]'>
        {essential ? (
          <span className='text-green-500 font-semibold'>{essential}</span>
        ) : (
          <>
            {message?.message_type?.image ? (
              <Image
                width={16}
                height={16}
                src='https://cdn-icons-png.flaticon.com/512/16/16410.png'
                className='h-4 opacity-60 mr-1'
                alt='image-icon'
              />
            ) : null}
            {message?.message_type?.text ? (
              <p className='line-clamp-1'>{message.message_data.text}</p>
            ) : null}
            <span className='ml-2'>{messageStatus(lastMessage)}</span>
          </>
        )}
      </div>

      {unread?.length ? (
        <div className='w-[18px] h-[18px] bg-green-500 rounded-full text-white text-[10px] flex justify-center items-center'>
          {unread?.length > 99 ? `99+` : unread?.length}
        </div>
      ) : null}
    </div>
  )
}

export default OverviewOfLast
