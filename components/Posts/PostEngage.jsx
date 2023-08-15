import { firestoreDB } from '@/firebase.config'
import { Appstate } from '@/hooks/context'
import { useUser } from '@clerk/nextjs'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import { cloneDeep, result } from 'lodash'
import { useContext, useEffect, useState } from 'react'

const notLiked = 'https://cdn-icons-png.flaticon.com/512/2107/2107956.png'
const liked = 'https://cdn-icons-png.flaticon.com/512/2107/2107783.png'
const comment = 'https://cdn-icons-png.flaticon.com/512/3114/3114810.png'
const share = 'https://cdn-icons-png.flaticon.com/512/2958/2958783.png'

function PostEngage ({ post }) {
  const [hasLiked, setHasLiked] = useState(false)
  const { setPosts, setSelectedComment, selectedComment } = useContext(Appstate)
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
  const getComments = async postId => {
    if (!postId) return []
    const local_comments = []
    const commentsQuery = query(
      collection(firestoreDB, `posts/${postId}/comments`),
      orderBy('createdAt', 'desc')
    )
    const comments = await getDocs(commentsQuery)
    comments.docs.forEach(comment => {
      local_comments.push(comment.data())
    })
    console.log(local_comments)
    return local_comments
  }
  const incrementLike = val => {
    setPosts(prev => {
      prev = cloneDeep(prev)
      const selectedPost = prev.find(
        post_prev => post_prev.postId === post.postId
      )
      selectedPost.likesCount = selectedPost.likesCount + val
      return prev
    })
  }
  const handleComment = () => {
    const local_comments = []
    if (!selectedComment) {
      console.log(post)
      if (!post.comments) {
        getComments(post.postId)
          .then(comments => {
            local_comments.push(...comments)
            setPosts(prev => {
              prev = cloneDeep(prev)
              const selectedPost = prev.find(
                post_prev => post_prev.postId === post.postId
              )
              selectedPost.comments = comments
              console.log(prev)
              return prev
            })
          })
          .then(() => {
            setSelectedComment({
              postId: post.postId,
              comments: local_comments
            })
          })
      } else {
        setSelectedComment({ postId: post.postId, comments: post.comments })
      }
    } else {
      setSelectedComment(null)
    }
  }
  const handleLike = () => {
    fetchEngageInfo(post.postId, user.id).then(result => {
      if (result) {
        setHasLiked(false)
        incrementLike(-1)
        deleteDoc(
          doc(firestoreDB, `posts/${post.postId}/likes/${user.id}`)
        ).then(() => {
          updateDoc(doc(firestoreDB, `posts/${post.postId}`), {
            likesCount: increment(-1)
          })
        })
      } else {
        setHasLiked(true)
        incrementLike(1)
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
    <div className='w-full flex items-center justify-around my-2'>
      <EngageIcon
        bool={hasLiked}
        url={notLiked}
        label={`Like`}
        conditionalUrl={liked}
        onClick={() => handleLike()}
        conditionalLabel={'Unlike'}
      />
      <EngageIcon
        url={comment}
        label={`Comment`}
        onClick={() => handleComment()}
      />
      <EngageIcon
        url={share}
        label={`Share`}
        onClick={() => console.log('share')}
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
