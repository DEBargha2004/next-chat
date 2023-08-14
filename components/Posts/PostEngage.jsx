import { firestoreDB } from '@/firebase.config'
import { useUser } from '@clerk/nextjs'
import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import { result } from 'lodash'
import { useEffect, useState } from 'react'

const notLiked = 'https://cdn-icons-png.flaticon.com/512/2107/2107956.png'
const liked = 'https://cdn-icons-png.flaticon.com/512/2107/2107783.png'

function PostEngage ({ post }) {
  const [hasLiked, setHasLiked] = useState(false)
  const { user, isLoaded } = useUser()
  const fetchEngageInfo = async (postId, userId) => {
    const hasUserLiked = await getDoc(
      doc(firestoreDB, `posts/${postId}/likes/${userId}`)
    )
    if (hasUserLiked.exists()) {
      return true
    }
    return false
  }
  const handleLike = () => {
    fetchEngageInfo(post.postId, user.id).then(result => {
      if (result) {
        setHasLiked(false)
        deleteDoc(
          doc(firestoreDB, `posts/${post.postId}/likes/${user.id}`)
        ).then(() => {
          updateDoc(doc(firestoreDB, `posts/${post.postId}`), {
            likesCount: increment(-1)
          })
        })
      } else {
        setHasLiked(true)
        setDoc(doc(firestoreDB, `posts/${post.postId}/likes/${user.id}`), {
          user_id: user.id,
          likedAt: serverTimestamp()
        }).then(() => {
          updateDoc(doc(firestoreDB, `posts/${post.postId}`), {
            likesCount: increment(1)
          })
        })
      }
    })
  }
  useEffect(() => {
    fetchEngageInfo(post.postId, user?.id).then(result => setHasLiked(result))
  }, [isLoaded])
  return (
    <div className='w-full mx-4 flex items-center justify-between my-2'>
      <EngageIcon
        bool={hasLiked}
        url={notLiked}
        label={`Like`}
        conditionalUrl={liked}
        onClick={() => handleLike()}
        conditionalLabel={'Unlike'}
      />
    </div>
  )
}

export default PostEngage

const EngageIcon = ({
  url,
  label,
  bool,
  conditionalUrl,
  onClick,
  conditionalLabel
}) => {
  return (
    <div
      className='flex w-[25%] py-1 px-1 rounded justify-center items-center cursor-pointer hover:bg-slate-100'
      onClick={e => {
        onClick(e)
        e.stopPropagation()
      }}
    >
      <img src={bool ? conditionalUrl : url} className='h-5 mr-1' alt='' />
      <span>{bool ? conditionalLabel : label}</span>
    </div>
  )
}
