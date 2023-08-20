import { useUser } from '@clerk/nextjs'
import PostWrapper from './Posts/PostWrapper'
import { useContext, useState } from 'react'
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
import { friendsZone } from '@/app/friends/page'
import Image from 'next/image'

function SearchedPeople ({ data }) {
  const { user } = useUser()
  const { setCloseFriends, searchResults, setSearchResults } =
    useContext(friendsZone)

  const handleAddFriend = async () => {
    const friendshipId = generateUniqueId(user?.id, data.user_id)
    const friendshipDoc_In_Seeker = await getDoc(
      doc(firestoreDB, `users/${data?.user_id}/friends/${friendshipId}`)
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
        acceptorId: data?.user_id,
        createdAt: serverTimestamp(),
        acceptedAt: null,
        status: `pending`
      }
      await setDoc(
        doc(firestoreDB, `users/${data?.user_id}/friends/${friendshipId}`),
        friendshipInfo
      )
      await setDoc(
        doc(firestoreDB, `users/${user?.id}/friends/${friendshipId}`),
        friendshipInfo
      )

      setCloseFriends(prev => {
        prev = cloneDeep(prev)
        const friend = prev.find(
          friend_prev => friend_prev.user_id === data.user_id
        )
        if (friend) {
          friend.friendshipInfo = {
            ...friendshipInfo,
            createdAt: { seconds: Date.now() / 1000 }
          }
        } else {
          data.friendshipInfo = friendshipInfo
          prev.push(data)
        }
        return prev
      })

      setSearchResults(prev => {
        prev = cloneDeep(prev)
        const friend = prev.find(
          friend_prev => friend_prev.user_id === data.user_id
        )
        friend.friendshipInfo = {
          ...friendshipInfo,
          createdAt: { seconds: Date.now() / 1000 }
        }

        return prev
      })
    }
  }

  const handleAcceptRequest = async () => {
    const friendshipId = data?.friendshipInfo?.friendshipId
    if (data?.friendshipInfo.acceptorId === user?.id) {
      await updateDoc(
        doc(firestoreDB, `users/${data?.user_id}/friends/${friendshipId}`),
        {
          status: `accepted`,
          acceptedAt: serverTimestamp()
        }
      )
      await updateDoc(
        doc(firestoreDB, `users/${user?.id}/friends/${friendshipId}`),
        {
          status: `accepted`,
          acceptedAt: serverTimestamp()
        }
      )

      setCloseFriends(prev => {
        prev = cloneDeep(prev)
        const friend = prev.find(
          friend_prev => friend_prev.user_id === data.user_id
        )
        friend.friendshipInfo.status = `accepted`
        friend.friendshipInfo.acceptedAt = { seconds: Date.now() / 1000 }
        return prev
      })
      setSearchResults(prev => {
        prev = cloneDeep(prev)
        const friend = prev.find(
          friend_prev => friend_prev.user_id === data.user_id
        )
        friend.friendshipInfo.status = `accepted`
        friend.friendshipInfo.acceptedAt = { seconds: Date.now() / 1000 }
        return prev
      })
    }
  }

  const handleRejection = async () => {
    const friendshipId = data?.friendshipInfo?.friendshipId
    if (data?.friendshipInfo.acceptorId === user?.id) {
      await deleteDoc(
        doc(firestoreDB, `users/${data?.user_id}/friends/${friendshipId}`)
      )
      await deleteDoc(
        doc(firestoreDB, `users/${user?.id}/friends/${friendshipId}`)
      )

      setCloseFriends(prev => {
        prev = cloneDeep(prev)
        const friend = prev.find(
          friend_prev => friend_prev.user_id === data.user_id
        )
        friend.friendshipInfo = {}
        return prev
      })
      setSearchResults(prev => {
        prev = cloneDeep(prev)
        const friend = prev.find(
          friend_prev => friend_prev.user_id === data.user_id
        )
        friend.friendshipInfo = {}
        return prev
      })
    }
  }

  const handleBreakUp = async () => {
    const friendshipId = data?.friendshipInfo?.friendshipId
    await deleteDoc(
      doc(firestoreDB, `users/${data?.user_id}/friends/${friendshipId}`)
    )
    await deleteDoc(
      doc(firestoreDB, `users/${user?.id}/friends/${friendshipId}`)
    )

    setCloseFriends(prev => {
      prev = cloneDeep(prev)
      const friend = prev.find(
        friend_prev => friend_prev.user_id === data.user_id
      )
      friend.friendshipInfo = {}
      return prev
    })
    setSearchResults(prev => {
      prev = cloneDeep(prev)
      const friend = prev.find(
        friend_prev => friend_prev.user_id === data.user_id
      )
      friend.friendshipInfo = {}
      return prev
    })
  }

  const handleCancelRequest = async () => {
    const friendshipId = data?.friendshipInfo?.friendshipId
    if (data?.friendshipInfo?.seekerId === user?.id) {
      const friendshipDoc_In_Seeker = await getDoc(
        doc(firestoreDB, `users/${data?.user_id}/friends/${friendshipId}`)
      )
      const friendshipDoc_In_Acceptor = await getDoc(
        doc(firestoreDB, `users/${user?.id}/friends/${friendshipId}`)
      )

      if (
        friendshipDoc_In_Acceptor.get('status') === `pending` &&
        friendshipDoc_In_Seeker.get('status') === `pending`
      ) {
        await deleteDoc(
          doc(firestoreDB, `users/${data?.user_id}/friends/${friendshipId}`)
        )
        await deleteDoc(
          doc(firestoreDB, `users/${user?.id}/friends/${friendshipId}`)
        )

        setCloseFriends(prev => {
          prev = cloneDeep(prev)
          const friend = prev.find(
            friend_prev => friend_prev.user_id === data.user_id
          )
          friend.friendshipInfo = {}
          return prev
        })
        setSearchResults(prev => {
          prev = cloneDeep(prev)
          const friend = prev.find(
            friend_prev => friend_prev.user_id === data.user_id
          )
          friend.friendshipInfo = {}
          return prev
        })
      }
    } else {
      console.log(data, data?.seekerId, user?.id)
    }
  }

  return (
    <PostWrapper
      className={`p-2 rounded w-fit mx-auto my-3 shadow-lg shadow-[#00000046] hover:scale-105 transition-all`}
    >
      <Image src={data.user_img} className='h-[150px] rounded' height={150} width={150} />
      <h1>{data.user_name}</h1>
      <div>
        {data.friendshipInfo.friendshipId ? (
          data?.friendshipInfo?.status === `pending` ? (
            data.friendshipInfo.acceptorId === user?.id ? (
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
