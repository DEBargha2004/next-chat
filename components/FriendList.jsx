import Userbox from './Userbox'
import { useContext, useEffect } from 'react'
import { Appstate } from '@/hooks/context'
import {cloneDeep} from 'lodash'

function FriendList () {
  const { friends,messages,setFriends } = useContext(Appstate)


  useEffect(()=>{
    setFriends(prev => {
      prev = cloneDeep(prev)
      prev.forEach(friend => {
        const friend_id = friend.user_id
        const user_friend_Message = messages[friend_id]
        const lastMessage = user_friend_Message ? user_friend_Message[user_friend_Message.length - 1] : null
        friend.lastMessage = lastMessage
      })
      return prev
    })
  },[messages])

  return (
    <div>
      {friends.map((item, index) => (
        <Userbox item={item} key={index} />
      ))}
    </div>
  )
}

export default FriendList
