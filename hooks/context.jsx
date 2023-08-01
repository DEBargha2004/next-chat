'use client'

import { useUser } from '@clerk/nextjs'
import { cloneDeep } from 'lodash'
import { createContext, useEffect, useMemo, useState } from 'react'

export const Appstate = createContext()

export function GlobalAppStateProvider ({ children }) {
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
        setSearchQuery
      }}
    >
      {children}
    </Appstate.Provider>
  )
}
