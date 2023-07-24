'use client'

import Sidebar from '@/components/Sidebar'
import Chatbox from '@/components/Chatbox'
import { Appstate } from '@/hooks/context'
import { useContext } from 'react'
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { firestoreDB, realtimeDB } from '../firebase.config'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  updateDoc
} from 'firebase/firestore'

import {
  ref,
  set,
  serverTimestamp as RealTimeServerTimestamp,
  onValue,
  update,
  onDisconnect,
  goOffline,
  goOnline
} from 'firebase/database'
import { format } from 'date-fns'

export default function Home () {
  const { isSignedIn, user, isLoaded } = useUser()
  const { setFriends, setPresenceInfo } = useContext(Appstate)
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
      console.log(user.id)
      const dataRef = ref(realtimeDB, `users/${user.id}`)
      update(dataRef, {
        online: true
      })
    }
  }

  useEffect(() => {
    if (isSignedIn && isLoaded && connection) {
      includeUser()
    }
  }, [isLoaded, isSignedIn, connection])

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
    const pquery = query(
      collection(firestoreDB, 'users'),
      where('user_id', '!=', user.id)
    )
    const unsub = onSnapshot(pquery, snapshots => {
      const docs = []
      snapshots.forEach(doc => {
        docs.push(doc.data())
      })
      setFriends(docs)
    })

    onValue(ref(realtimeDB, `users`), snaps => {
      const presence = []
      snaps.forEach(snap => {
        presence.push(snap.val())
      })
      setPresenceInfo(presence)
    })

    return () => {
      unsub()
    }
  }, [isLoaded])

  useEffect(() => {
    // const userPresenceRef = ref(realtimeDB,`users/${user?.id}`)

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
        <Sidebar className={`w-[32%]`} />
        <Chatbox className={`w-[68%]`} />
      </div>
    </div>
  )
}
