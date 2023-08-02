'use client'

import { Appstate } from '@/hooks/context'
import { useContext } from 'react'
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { firestoreDB, realtimeDB } from '../firebase.config'
import Sidenav from '@/components/Sidenav'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  updateDoc,
  or,
  orderBy,
  getDocs
} from 'firebase/firestore'

import {
  ref,
  set,
  onValue,
  update,
  onDisconnect,
  goOffline,
  goOnline,
  off
} from 'firebase/database'
import { cloneDeep } from 'lodash'

export default function AppWrapper ({ children }) {
  const { isSignedIn, user, isLoaded } = useUser()

  const {
    setFriends,
    setPresenceInfo,
    setMessages,
    setConversationsInfo,
    conversationsInfo,
    friends,
    presenceInfo
  } = useContext(Appstate)

  const [userid, setUserid] = useState(null)
  const [connection, setConnection] = useState(false)

  async function includeUser () {
    const docRef = doc(firestoreDB, 'users', user.id)
    const docSnap = await getDoc(docRef)
    localStorage.setItem('user_id', user.id)
    setUserid(user.id)
    if (!docSnap.exists()) {
      setDoc(doc(firestoreDB, 'users', user.id), {
        user_name: user.fullName,
        user_email: user.primaryEmailAddress.emailAddress,
        user_id: user.id,
        user_img: user.imageUrl,
        user_createdAt: serverTimestamp()
      })
      set(ref(realtimeDB, `users/${user.id}`), {
        user_id: user.id,
        online: true,
        last_seen: new Date().toString()
      })
    } else {
      const dataRef = ref(realtimeDB, `users/${user.id}`)
      update(dataRef, {
        online: true
      })
    }
  }

  async function addUserWithConversations (participants) {
    let friend_id = participants.find(
      participant_id => participant_id !== user.id
    )

    try {
      const data = await getDoc(doc(firestoreDB, `users/${friend_id}`))
      if (data.exists()) {
        return data.data()
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    async function updateFriendsAndStatus () {
      setFriends([])

      const listeners = []

      const localPresenceInfo = []
      const friends_info = []

      for (const conversation_info of conversationsInfo) {
        const participants = conversation_info.participants

        const friend_info = await addUserWithConversations(participants)
        friends_info.push(friend_info)

        let friend_id = participants.find(id => id !== user.id)

        // Set up the listener and store its reference
        const listener = onValue(
          ref(realtimeDB, `users/${friend_id}`),
          snap => {
            const user_presenceInfo = localPresenceInfo.find(
              info => info.user_id === friend_id
            )
            if (!user_presenceInfo) {
              localPresenceInfo.push(snap.val())
            } else {
              const index = _.findIndex(
                localPresenceInfo,
                obj => obj.user_id === friend_id
              )

              localPresenceInfo.splice(index, 1, snap.val())
              // console.log(snap.val());
            }
            console.log(localPresenceInfo, 'before setting')
            setPresenceInfo([...localPresenceInfo])
          }
        )
        listeners.push(listener)
      }

      setFriends([...friends_info])
    }

    updateFriendsAndStatus()
  }, [conversationsInfo])

  useEffect(() => {
    if (isSignedIn && isLoaded && connection) {
      includeUser()
    }
  }, [isLoaded, isSignedIn, connection])

  //setting connection
  useEffect(() => {
    if (!isSignedIn) {
      goOffline(realtimeDB)
      setConnection(false)
    } else {
      goOnline(realtimeDB)
      setConnection(true)
    }
  }, [isSignedIn])

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    // setting the listener for message change in each conversation document
    const setUpSubCollectionListener = async (
      conversation_info,
      conversations_info
    ) => {
      console.log(conversation_info)
      const mquery = query(
        collection(
          firestoreDB,
          `conversations/${conversation_info.conversation_id}/messages`
        ),
        orderBy('message_createdAt')
      )

      const unsub = onSnapshot(mquery, async snapshots => {
        const messages = []

        await Promise.all(
          snapshots.docs.map(async snapshot => {
            // dealing with subcollection
            // its necessary to add docs
            if (
              !snapshot.data().message_deliver &&
              snapshot.data().receiver_id === user.id
            ) {
              await updateDoc(
                // updating delivery status
                doc(
                  firestoreDB,
                  `conversations/${
                    conversation_info.conversation_id
                  }/messages/${snapshot.data().messageId}`
                ),
                {
                  message_deliver: true,
                  message_deliveredAt: serverTimestamp()
                }
              )
            }
            messages.push(snapshot.data())
          })
        )
        let friend_id = conversation_info.participants.find(
          participant_id => participant_id !== user.id
        )

        setMessages(prev => {
          return {
            ...prev,
            [friend_id]: messages
          }
        })
      })

      return unsub
    }

    setFriends([])
    const unsub_subcollection_list = []
    setPresenceInfo([])

    const cquery = query(
      collection(firestoreDB, `users/${user.id}/conversations`)
    )

    const unSubMessages = onSnapshot(cquery, async snapshots => {
      const conversations_info_list = []
      // console.log(snapshots.docs)
      for (const snapshot of snapshots.docs) {
        const conversation_info = snapshot.data()
        conversations_info_list.push(conversation_info)

        console.log(conversation_info)
        const unsub_subcollection = await setUpSubCollectionListener(
          conversation_info,
          conversations_info_list
        )
        unsub_subcollection_list.push(unsub_subcollection)
      }
      setConversationsInfo(conversations_info_list)
    })

    return () => {
      // unsub()
      unSubMessages()
      unsub_subcollection_list.forEach(unsub => unsub())
    }
  }, [isLoaded])

  // socket connection for managing presence status
  useEffect(() => {
    onDisconnect(
      ref(realtimeDB, `users/${user?.id || localStorage.getItem(`user_id`)}`)
    ).update({
      online: false,
      last_seen: new Date().toString()
    })
  }, [])

  return (
    <div className='h-full'>
      <div className='flex h-full'>
        <Sidenav className={`h-full w-[80px]`} />
        {children}
      </div>
    </div>
  )
}
