import Userbox from './Userbox'
import { useContext, useEffect, useMemo } from 'react'
import { Appstate } from '@/hooks/context'
import { cloneDeep } from 'lodash'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { generate_hybrid } from '@/functions/generate_hybrid'
import { selectUser } from '@/functions/selectUser'
import { useUser } from '@clerk/nextjs'

function FriendList ({ UserboxComponent }) {
  const {
    friends,
    messages,
    setFriends,
    searchedFriend,
    searchQuery,
    setSelectedChatUser,
    selectedChatUser,
    typingsInfo
  } = useContext(Appstate)
  const { user } = useUser()

  //Adding lastMessage to every friend object
  useEffect(() => {
    // console.log('at useEffect Friendlist')
    setFriends(prev => {
      prev = cloneDeep(prev)
      try {
        prev?.forEach(friend => {
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
      console.log(prev)
      return [...prev]
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
    friends_withConversation = friends.filter(friend => friend.lastMessage)

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

  const OverlayComponent = () => {
    return (
      <div className='w-full h-full bg-slate-200 absolute top-0 left-0 -z-10'></div>
    )
  }

  return (
    <div>
      {sorted_friends?.map((item, index) => {
        const link_ref = item?.user_id?.replace('user_', '')
        return (
          <Link href={`/chat/${link_ref}`} key={link_ref}>
            <UserboxComponent
              item={item}
              include={{ lastMessage: true, lastMessageTime: true }}
              onClick={() => setSelectedChatUser(item)}
              selected={selectedChatUser.user_id === item.user_id}
              OverlayComponent={OverlayComponent}
              id={item.user_id}
              essential={
                typingsInfo[item.conversation_id]?.typer
                  ? typingsInfo[item.conversation_id]?.typer !== user?.id
                    ? `typing...`
                    : ``
                  : ``
              }
            />
          </Link>
        )
      })}
    </div>
  )
}

export default FriendList
