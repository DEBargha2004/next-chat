'use client'

import { useUser } from '@clerk/nextjs'
import { createContext, useEffect, useMemo, useRef, useState } from 'react'

export const Appstate = createContext()

export function GlobalAppStateProvider ({ children }) {
  const { user } = useUser()

  const [selectedChatUser, setSelectedChatUser] = useState({
    user_name: '',
    user_img: '',
    last_Seen: '',
    online: false,
    user_id: null
  })

  const [selectedGroup, setSelectedGroup] = useState(null)

  const [friends, setFriends] = useState([])
  const [groups, setGroups] = useState([])
  const [searchedFriend, setSearchedFriend] = useState([])
  const [presenceInfo, setPresenceInfo] = useState([])
  const [conversationsInfo, setConversationsInfo] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [referenceMessage, setReferenceMessage] = useState(null)
  const [imageInfo, setImageInfo] = useState({ url: null, info: null })
  const [posts, setPosts] = useState([])
  const [selectedComment, setSelectedComment] = useState(null)
  const lastPost = useRef(null)

  const refMessageInfo = useMemo(() => {
    const sender_id = referenceMessage?.sender_id
    let refInfo = {
      sender_id,
      message_data: referenceMessage?.message_data,
      message_type: referenceMessage?.message_type,
      marker_color: ''
    }
    if (sender_id) {
      if (sender_id === user?.id) {
        refInfo.sender = 'You'
        refInfo.marker_color = '#2eca36'
      } else {
        if (selectedGroup?.id) {
          const participant_info = selectedGroup.participants.find(
            participant => participant.user_id === referenceMessage?.sender_id
          )
          refInfo.sender = participant_info?.user_name
          refInfo.marker_color = '#b768ec'
        } else {
          const friend_info = friends.find(
            friend => friend.user_id === referenceMessage?.sender_id
          )
          refInfo.sender = friend_info?.user_name
          refInfo.marker_color = '#b768ec'
        }
      }
    }

    return refInfo
  }, [referenceMessage])

  useEffect(() => {
    setSelectedChatUser(prev => ({
      ...prev,
      user_name: '',
      user_img: '',
      last_Seen: '',
      online: false,
      user_id: null
    }))
    setSelectedGroup({})
  }, [selectedService])

  useEffect(() => {
    setReferenceMessage(null)
  }, [selectedChatUser?.user_id])


  return (
    <Appstate.Provider
      value={{
        selectedChatUser,
        setSelectedChatUser,
        friends,
        setFriends,
        presenceInfo,
        setPresenceInfo,
        conversationsInfo,
        setConversationsInfo,
        setMessages,
        messages,
        setSelectedService,
        selectedService,
        setSearchedFriend,
        searchedFriend,
        searchQuery,
        setSearchQuery,
        referenceMessage,
        setReferenceMessage,
        refMessageInfo,
        setImageInfo,
        imageInfo,
        groups,
        setGroups,
        setSelectedGroup,
        selectedGroup,
        posts,
        setPosts,
        selectedComment,
        setSelectedComment,
        lastPost
      }}
    >
      {children}
    </Appstate.Provider>
  )


}
