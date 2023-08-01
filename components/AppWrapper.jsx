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
  orderBy
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

  function addUserWithConversations (u1_id, u2_id) {
    const friend_id = [u1_id, u2_id].find(id => id !== user.id)
    // console.log('addUserWithConversations')

    getDoc(doc(firestoreDB, `users/${friend_id}`))
      .then(data => {
        if (data.exists()) {
          setFriends(prev => {
            return [...prev, data.data()]
          })
        }
      })
      .catch(e => {
        console.error(e)
      })
  }

  useEffect(() => {
    setFriends([])
    // setPresenceInfo([])

    // Create an array to store the references to the Firebase listeners
    const listeners = []

    // Map through conversationsInfo and set up listeners for each friend
    const localPresenceInfo = []

    conversationsInfo.forEach(({ u1_id, u2_id }) => {
      addUserWithConversations(u1_id, u2_id)
      const friend_id = [u1_id, u2_id].find(id => id !== user.id)

      // Set up the listener and store its reference
      const listener = onValue(ref(realtimeDB, `users/${friend_id}`), snap => {
        const presenceClone = cloneDeep(presenceInfo)

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
      })
      listeners.push(listener)
    })

    // console.log(localPresenceInfo)
    // setPresenceInfo(localPresenceInfo)

    // Clean up listeners when the component unmounts
    // console.log(listeners)
    return () => {
      // listeners.forEach(listener => {
      //   if (typeof listener === 'function') {
      //     off(listener)
      //   }
      // })
    }
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

    // listener for listening the status of presence
    // onValue(ref(realtimeDB, `users`), snaps => {
    //   const presence = []
    //   snaps.forEach(snap => {
    //     presence.push(snap.val())
    //   })
    //   setPresenceInfo(presence)
    // })

    // setting the listener for message change in each conversation document
    const setUpSubCollectionListener = (conversation_id, u1_id, u2_id) => {
      const mquery = query(
        collection(firestoreDB, `conversations/${conversation_id}/messages`),
        orderBy('message_createdAt')
      )
      
      const unsub = onSnapshot(mquery, async snapshots => {
        const messages = []
        console.log('empty status', snapshots.size);
        await Promise.all(
          snapshots.docs.map(async snapshot => {                // dealing with subcollection
            if (!snapshot.data().message_deliver && snapshot.data().receiver_id === user.id) {             // its necessary to add docs
              await updateDoc(
                doc(
                  firestoreDB,
                  `conversations/${conversation_id}/messages/${
                    snapshot.data().messageId
                  }`
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
        const friend_id = u1_id === user.id ? u2_id : u1_id
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
      collection(firestoreDB, `conversations`),
      or(where('u1_id', '==', user.id), where('u2_id', '==', user.id))
    )

    const unSubMessages = onSnapshot(cquery, snapshots => {
      const conversations_info_from_firebase = []

      snapshots.forEach(snapshot => {
        conversations_info_from_firebase.push(snapshot.data())
        const { conversation_id, u1_id, u2_id } = snapshot.data()

        const friend_id = [u1_id, u2_id].find(id => id !== user.id)

        const unsub_subcollection = setUpSubCollectionListener(
          conversation_id,
          u1_id,
          u2_id
        )
        unsub_subcollection_list.push(unsub_subcollection)
      })
      setConversationsInfo(conversations_info_from_firebase)
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
