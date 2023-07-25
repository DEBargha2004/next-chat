import Userbox from './Userbox'
import { useContext } from 'react'
import { Appstate } from '@/hooks/context'

function FriendList () {
  const { friends } = useContext(Appstate)

  return (
    <div>
      {friends.map((item, index) => (
        <Userbox item={item} key={index} />
      ))}
    </div>
  )
}

export default FriendList
