
import { UserButton } from '@clerk/nextjs'
import FriendList from './FriendList'

function Sidebar ({ className }) {
  return (
    <div className={`${className}`}>
      <div className='my-3 pl-4'>
        <UserButton />
      </div>
      <div>
        <FriendList />
      </div>
    </div>
  )
}

export default Sidebar
