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

  function addUserWithConversations (u1, u2) {
    console.log(u1,u2);
    const {participant_id : friend_id} = [u1, u2].find(u => u.participant_id !== user.id)
    // console.log('addUserWithConversations')
    // console.log(u1_id, u2_id)
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

    conversationsInfo.forEach(({ participants }) => {
      console.log(participants)
      addUserWithConversations(...participants)
      const { participant_id : friend_id } = [...participants].find(id => id !== user.id)

      console.log(participants)

      // Set up the listener and store its reference
      const listener = onValue(ref(realtimeDB, `users/${friend_id}`), snap => {
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
      const participants = []

      const participants_firebase = await getDocs(
        query(
          collection(
            firestoreDB,
            `conversations/${conversation_info.conversation_id}/participants`
          )
        )
      )
      participants_firebase.docs.forEach(doc => {
        participants.push(doc.data())
      })
      const con_info = conversations_info.find(
        con => con.conversation_id === conversation_info.conversation_id
      )
      con_info.participants = participants // setting participants to each conversation

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
        const {participant_id : friend_id} = participants.find(
          participant => participant.participant_id !== user.id
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
      console.log(snapshots.docs)
      for (const snapshot of snapshots.docs) {
        conversations_info_list.push(snapshot.data())
        const conversation_info = snapshot.data()

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
