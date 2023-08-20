import { generateTimeStamp } from '@/functions/generateTime'
import Avatar from '../Avatar'

function PostCreation ({ creator, createdAt, avatarHeight, avatarWidth }) {
  return (
    <div className={`w-full flex items-center justify-start m-2`}>
      <Avatar
        url={creator?.user_img}
        h={avatarHeight}
        w={avatarWidth}
      />
      <div className='flex flex-col items-start justify-between ml-2'>
        <h1 className='font-semibold'>{creator?.user_name || creator?.user_email}</h1>
        <p className='text-xs text-slate-500'>
          {generateTimeStamp(createdAt?.seconds * 1000)}
        </p>
      </div>
    </div>
  )
}

export default PostCreation
