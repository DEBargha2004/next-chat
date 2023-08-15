import { Appstate } from '@/hooks/context'
import { useContext, useEffect, useState } from 'react'
import Avatar from '../Avatar'
import { useUser } from '@clerk/nextjs'
import { v4 } from 'uuid'
import {
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import { firestoreDB } from '@/firebase.config'
import { cloneDeep } from 'lodash'

function PostRightBar ({ classname }) {
  const { selectedComment, posts, setPosts } = useContext(Appstate)
  const { user } = useUser()
  const [comment_Val, setComment_Val] = useState('')
  const [userComments, setUserComments] = useState([])
  const handleSubmitComment = e => {
    e.preventDefault()
    if (!comment_Val) return
    const commentId = v4()
    const createdAt = serverTimestamp()
    const creator = { user_name: user.fullName, user_img: user.imageUrl }
    const comment = {
      commentId,
      createdAt,
      comment: comment_Val,
      creator
    }
    setDoc(
      doc(
        firestoreDB,
        `posts/${selectedComment?.postId}/comments/${commentId}`
      ),
      comment
    )
    updateDoc(doc(firestoreDB, `posts/${selectedComment?.postId}`), {
      commentsCount: increment(1)
    })
    setPosts(prev => {
      prev = cloneDeep(prev)
      const post = prev.find(post => post.postId === selectedComment?.postId)
      post.comments.splice(0, 0, comment)
      post.commentsCount = post.commentsCount + 1
      return prev
    })
    setComment_Val('')
  }

  const handleTypeComment = e => {
    setComment_Val(e.target.value)
    const commentBox = e.target

    if (+commentBox.style.height.replace('px', '') > 150) {
      commentBox.style.overflowY = 'scroll'
    } else {
      commentBox.style.overflow = 'hidden'
    }
    commentBox.style.height = `10px`
    commentBox.style.height = `${commentBox.scrollHeight}px`
  }
  useEffect(() => {
    const post = posts.find(post => post.postId === selectedComment?.postId)
    setUserComments(post?.comments)
  }, [selectedComment, posts])
  return (
    <div
      className={`w-[30%] bg-white sticky top-[50px] ${
        selectedComment ? `h-[400px]` : `h-0`
      } transition-all rounded-xl shadow-lg ${classname} overflow-y-auto`}
    >
      <form
        onSubmit={handleSubmitComment}
        className=' flex items-start justify-around p-2 sticky top-0 bg-white z-10'
      >
        <Avatar url={user?.imageUrl} className={`w-8 h-8`} />
        <textarea
          value={comment_Val}
          className=' p-1 resize-none outline-none border border-slate-200 h-12 rounded-lg'
          onChange={handleTypeComment}
        />
        <button
          className='px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600'
          type='submit'
        >
          Submit
        </button>
      </form>
      {userComments?.map(comment => (
        <div className='flex items-start justify-start mb-4 ml-2'>
          <Avatar url={comment.creator?.user_img} className={`h-8 w-8 mr-2`} />
          <div className='px-2 rounded bg-stone-200'>
            <h1 className='text-slate-600 text-sm'>{comment.creator.user_name}</h1>
            <p>{comment.comment}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PostRightBar
