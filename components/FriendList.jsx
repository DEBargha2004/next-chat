import Userbox from './Userbox'
import { useContext, useEffect, useMemo } from 'react'
import { Appstate } from '@/hooks/context'
import { cloneDeep } from 'lodash'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { firestoreDB } from '@/firebase.config'

function FriendList () {
  const { friends, messages, setFriends, searchedFriend,searchQuery } = useContext(Appstate)

  const generate_hybrid = ({ friendList, searchList }) => {
    const hybridArray = searchList.map(user => {
      const user_id_search = user.user_id
      const user_friendList = friendList.find(
        friend => friend.user_id === user_id_search 
      )
      if (user_friendList) {
        return user_friendList
      } else {
        return user
      }
    })

    return hybridArray
  }
  //Adding lastMessage to every friend object
  useEffect(() => {
    // console.log('at useEffect Friendlist')
    setFriends(prev => {
      prev = cloneDeep(prev)
      try {
        prev.forEach(friend => {
          const friend_id = friend.user_id
          const user_friend_Message = messages[friend_id]
          const lastMessage = user_friend_Message
            ? user_friend_Message[user_friend_Message.length - 1]
            : null
          friend.lastMessage = lastMessage
        })
      } catch (error) {
        // console.log(error, 'in friendlist')
      }
      return prev
    })
  }, [messages])

  const sorted_friends = useMemo(() => {
    if (searchedFriend.length || searchQuery) {
      const hybridArray = generate_hybrid({
        friendList: friends,
        searchList: searchedFriend.data
      })

      return _.orderBy(hybridArray, 'user_name', 'asc')
    }

    let friends_withNoCoversation = []
    let friends_withConversation = []

    friends_withNoCoversation = friends.filter(friend => !friend.lastMessage)
    friends_withConversation = friends.filter(
      friend => friend.lastMessage
    )

    friends_withConversation.sort((u1, u2) => {
      return (
        u2?.lastMessage?.message_createdAt?.seconds -
        u1?.lastMessage?.message_createdAt?.seconds
      )
    })

    friends_withNoCoversation = _.orderBy(
      friends_withNoCoversation,
      'user_name',
      'asc'
    )

    return [...friends_withConversation, ...friends_withNoCoversation]
  }, [friends, messages, searchedFriend])

  return (
    <div>
      {sorted_friends?.map((item, index) => {
        const link_ref = item?.user_id?.replace('user_', '')
        return (
          <Link href={`/chat/${link_ref}`} key={link_ref}>
            <Userbox item={item} />
          </Link>
        )
      })}
    </div>
  )
}

export default FriendList
