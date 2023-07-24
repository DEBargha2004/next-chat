
import { UserButton } from '@clerk/nextjs'
import FriendList from './FriendList'

function Sidebar ({ className }) {
  return (
    <div className={`${className} pl-4`}>
      <div className='my-3'>
        <UserButton />
      </div>
      <div>
        <FriendList />
      </div>
    </div>
  )
}

export default Sidebar
