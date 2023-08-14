import { generateTimeStamp } from '@/functions/generateTime'
import Avatar from '../Avatar'

function PostCreation ({ creator, createdAt }) {
  return (
    <div className={`w-full flex items-center justify-start m-2`}>
      <Avatar url={creator.user_img} />
      <div className='flex flex-col items-start justify-between ml-2'>
        <h1 className='font-semibold'>{creator.user_name}</h1>
        <p className='text-xs text-slate-500'>{generateTimeStamp(createdAt?.seconds * 1000)}</p>
      </div>
    </div>
  )
}

export default PostCreation
