import Userbox from './Userbox'
import { useContext } from 'react'
import { Appstate } from '@/hooks/context'

function FriendList () {
  const { friends } = useContext(Appstate)
  let users = [
    {
      name: 'Deb',
      image:
        'https://images.unsplash.com/photo-1578307362674-b209690512c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80',
      online: false,
      lastMessage: 'This is a last message',
      lastSeenAt: 123
    },
    {
      name: 'Tabu',
      image:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80',
      online: true
    }
  ]
  return (
    <div>
      {friends.map((item, index) => (
        <Userbox item={item} key={index} />
      ))}
    </div>
  )
}

export default FriendList
