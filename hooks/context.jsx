'use client'

import { useUser } from '@clerk/nextjs'
import { createContext, useEffect, useMemo, useState } from 'react'

export const Appstate = createContext()

export function GlobalAppStateProvider ({ children }) {
  const { user } = useUser()

  const [selectedChatUser, setSelectedChatUser] = useState({
    current_User_Name: '',
    current_User_Image: '',
    last_Seen: '',
    online: false,
    current_User_Id: null
  })

  const [friends, setFriends] = useState([])
  const [searchedFriend, setSearchedFriend] = useState([])
  const [presenceInfo, setPresenceInfo] = useState([])
  const [conversationsInfo, setConversationsInfo] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [referenceMessage, setReferenceMessage] = useState(null)
  const [imageInfo, setImageInfo] = useState({ url: null, info: null })

  const refMessageInfo = useMemo(() => {
    const sender_id = referenceMessage?.sender_id
    let refInfo = {
      sender_id,
      message_data: referenceMessage?.message_data,
      message_type: referenceMessage?.message_type,
      marker_color: '#2eca36'
    }
    if (sender_id === user?.id) {
      refInfo.sender = 'You'
    } else {
      const friend_info = friends.find(
        friend => friend.user_id === referenceMessage?.sender_id
      )
      refInfo.sender = friend_info?.user_name
      refInfo.marker_color = '#b768ec'
    }

    return refInfo
  }, [referenceMessage])

  useEffect(() => {
    setReferenceMessage(null)
  }, [selectedChatUser?.current_User_Id])

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
        imageInfo
      }}
    >
      {children}
    </Appstate.Provider>
  )
}
