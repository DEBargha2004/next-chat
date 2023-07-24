'use client'

import { createContext, useState } from 'react'

export const Appstate = createContext()

export function GlobalAppStateProvider ({ children }) {
  const [selectedChatUser, setSelectedChatUser] = useState({
    current_User_Name: '',
    current_User_Image: '',
    last_Seen: '',
    online: false
  })

  const [friends, setFriends] = useState([])
  const [presenceInfo, setPresenceInfo] = useState([])
  return (
    <Appstate.Provider
      value={{
        selectedChatUser,
        setSelectedChatUser,
        friends,
        setFriends,
        presenceInfo,
        setPresenceInfo
      }}
    >
      {children}
    </Appstate.Provider>
  )
}
