import { useUser } from '@clerk/nextjs'
import PostWrapper from './Posts/PostWrapper'
import { useState } from 'react'
import generateUniqueId from '@/functions/generateUniqueid'
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import { firestoreDB } from '@/firebase.config'
import { cloneDeep } from 'lodash'

function SearchedPeople ({ data }) {
  const { user } = useUser()
  const [userData, setUserData] = useState(data)

  const handleAddFriend = async () => {
    const friendshipId = generateUniqueId(user?.id, userData.user_id)
    const friendshipDoc_In_Seeker = await getDoc(
      doc(firestoreDB, `users/${userData?.user_id}/friends/${friendshipId}`)
    )
    const friendshipDoc_In_Acceptor = await getDoc(
      doc(firestoreDB, `users/${user?.id}/friends/${friendshipId}`)
    )
    if (
      !friendshipDoc_In_Acceptor.exists() &&
      !friendshipDoc_In_Seeker.exists()
    ) {
      const friendshipInfo = {
        friendshipId,
        seekerId: user?.id,
        acceptorId: userData?.user_id,
        createdAt: serverTimestamp(),
        acceptedAt: null,
        status: `pending`
      }
      await setDoc(
        doc(firestoreDB, `users/${userData?.user_id}/friends/${friendshipId}`),
        friendshipInfo
      )
      await setDoc(
        doc(firestoreDB, `users/${user?.id}/friends/${friendshipId}`),
        friendshipInfo
      )
      setUserData(prev => {
        prev = cloneDeep(prev)
        prev.friendshipInfo = {
          ...friendshipInfo,
          createdAt: { seconds: Date.now() / 1000 }
        }
        return prev
      })
    }
  }

  const handleAcceptRequest = async () => {
    const friendshipId = userData?.friendshipInfo?.friendshipId
    if (userData?.friendshipInfo.acceptorId === user?.id) {
      await updateDoc(
        doc(firestoreDB, `users/${userData?.user_id}/friends/${friendshipId}`),
        {
          status: `accepted`,
          acceptedAt : serverTimestamp()
        }
      )
      await updateDoc(
        doc(firestoreDB, `users/${user?.id}/friends/${friendshipId}`),
        {
          status: `accepted`,
          acceptedAt: serverTimestamp()
        }
      )
      setUserData(prev => {
        prev = cloneDeep(prev)
        prev.friendshipInfo.status = `accepted`
        prev.acceptedAt = { seconds: Date.now() / 1000 }
        return prev
      })
    }
  }

  const handleRejection = async () => {
    const friendshipId = userData?.friendshipInfo?.friendshipId
    if (userData?.friendshipInfo.acceptorId === user?.id) {
      await deleteDoc(
        doc(firestoreDB, `users/${userData?.user_id}/friends/${friendshipId}`)
      )
      await deleteDoc(
        doc(firestoreDB, `users/${user?.id}/friends/${friendshipId}`)
      )
      setUserData(prev => {
        prev = cloneDeep(prev)
        prev.friendshipInfo = {}
        return prev
      })
    }
  }

  const handleBreakUp = async () => {
    const friendshipId = userData?.friendshipInfo?.friendshipId
    await deleteDoc(
      doc(firestoreDB, `users/${userData?.user_id}/friends/${friendshipId}`)
    )
    await deleteDoc(
      doc(firestoreDB, `users/${user?.id}/friends/${friendshipId}`)
    )
    setUserData(prev => {
      prev = cloneDeep(prev)
      prev.friendshipInfo = {}
      return prev
    })
  }

  const handleCancelRequest = async () => {
    const friendshipId = userData?.friendshipInfo?.friendshipId
    if (userData?.seekerId === user?.id) {
      const friendshipDoc_In_Seeker = await getDoc(
        doc(firestoreDB, `users/${userData?.user_id}/friends/${friendshipId}`)
      )
      const friendshipDoc_In_Acceptor = await getDoc(
        doc(firestoreDB, `users/${user?.id}/friends/${friendshipId}`)
      )

      if (
        friendshipDoc_In_Acceptor.get('status') === `pending` &&
        friendshipDoc_In_Seeker.get('status') === `pending`
      ) {
        await deleteDoc(
          doc(firestoreDB, `users/${userData?.user_id}/friends/${friendshipId}`)
        )
        await deleteDoc(
          doc(firestoreDB, `users/${user?.id}/friends/${friendshipId}`)
        )
        setUserData(prev => {
          prev = cloneDeep(prev)
          prev.friendshipInfo = {}
          return prev
        })
      }
    }
  }

  return (
    <PostWrapper
      className={`p-2 rounded w-fit mx-auto my-3 shadow-lg shadow-[#00000046] hover:scale-105 transition-all`}
    >
      <img src={userData.user_img} className='h-[150px] rounded' />
      <h1>{userData.user_name}</h1>
      <div>
        {userData.friendshipInfo.friendshipId ? (
          userData?.friendshipInfo?.status === `pending` ? (
            userData.friendshipInfo.acceptorId === user?.id ? (
              <div className='flex'>
                <button
                  className='w-full py-1 rounded bg-blue-500 hover:bg-blue-600 transition-all text-white text-sm mx-1'
                  onClick={handleAcceptRequest}
                >
                  Accept
                </button>
                <button
                  className='w-full py-1 rounded bg-red-500 hover:bg-red-600 transition-all text-white text-sm mx-1'
                  onClick={handleRejection}
                >
                  Reject
                </button>
              </div>
            ) : (
              <>
                <button
                  className='w-full py-1 rounded bg-red-500 hover:bg-red-600 transition-all text-white text-sm'
                  onClick={handleCancelRequest}
                >
                  Cancel
                </button>
              </>
            )
          ) : (
            <>
              <button
                className='w-full py-1 rounded bg-red-500 hover:bg-red-600 transition-all text-white text-sm'
                onClick={handleBreakUp}
              >
                BreakUp
              </button>
            </>
          )
        ) : (
          <>
            <button
              className='w-full py-1 rounded bg-blue-500 hover:bg-blue-600 transition-all text-white text-sm'
              onClick={handleAddFriend}
            >
              Add Friend
            </button>
          </>
        )}
      </div>
    </PostWrapper>
  )
}

export default SearchedPeople
