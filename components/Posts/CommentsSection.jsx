import { Appstate } from '@/hooks/context'
import { useContext, useEffect, useRef, useState } from 'react'
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
import { LocalContext } from '../Post'
import { getComments } from '@/functions/getComments'

function CommentsSection ({ classname }) {
  const { selectedComment, posts, setPosts } = useContext(Appstate)
  const {
    commentBox,
    setCommentBox,
    height,
    setHeight,
    postBoxHeight,
    setPostBoxHeight
  } = useContext(LocalContext)

  const commenSectionRef = useRef(null)

  const { user } = useUser()
  const [comment_Val, setComment_Val] = useState('')
  const [showExpand, setShowExpand] = useState(false)

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
      doc(firestoreDB, `posts/${commentBox.postId}/comments/${commentId}`),
      comment
    )
    updateDoc(doc(firestoreDB, `posts/${commentBox.postId}`), {
      commentsCount: increment(1)
    })
    // setPosts(prev => {
    //   prev = cloneDeep(prev)
    //   const post = prev.find(post => post.postId === selectedComment?.postId)
    //   post.comments.splice(0, 0, comment)
    //   post.commentsCount = post.commentsCount + 1
    //   return prev
    // })
    setCommentBox(prev => {
      prev = cloneDeep(prev)
      prev.comments.unshift(comment)
      prev.commentsCount += 1
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

  const loadMoreComments = () => {
    getComments(commentBox.postId, commentBox.lastCommentDate).then(result => {
      setCommentBox(prev => {
        prev = cloneDeep(prev)
        prev.comments.push(...result)
        prev.lastCommentDate = result.at(-1)?.createdAt
        return prev
      })
    })
  }

  const changeScrollOfParent = (deltaY,Y) => {
    const startTime = performance.now()
    const scrollDuration = 300
    const totalScroll = deltaY
    function easeOutQuad(t) {
      return t * (2 - t);
    }

    const postParent = document.getElementById('postSection')
    
    function scrollToDistance() {
      const currentTime = performance.now();
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(1, elapsedTime / scrollDuration);
      const easedProgress = easeOutQuad(progress);
    
      // Calculate the distance to scroll based on the eased progress
      const distanceToScroll = totalScroll * easedProgress;
    
      // Scroll the document to the calculated distance
      postParent.scrollTo(0, distanceToScroll);
    
      if (progress < 1) {
        requestAnimationFrame(scrollToDistance);
      }
    }
    scrollToDistance()
  }

  useEffect(() => {
    // document.querySelector('div').
    const height = commenSectionRef.current.offsetHeight
    if (height < 400) {
      setShowExpand(true)
    }
  }, [])

  return (
    <div
      className={`h-[95%] max-h-[600px] w-full bg-white transition-all rounded-xl shadow-lg shadow-[#0000005e] ${classname}`}
      ref={commenSectionRef}
      style={{ height: height.value }}
    >
      <form
        onSubmit={handleSubmitComment}
        className='flex items-start justify-around px-2 bg-white mt-2'
      >
        <Avatar url={user?.imageUrl} className={`w-8 h-8`} />
        <textarea
          value={comment_Val}
          className=' p-1 resize-none outline-none border border-slate-200 h-8 rounded-lg'
          onChange={handleTypeComment}
        />
        <button
          className='px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600'
          type='submit'
        >
          Submit
        </button>
        {showExpand ? (
          height.expanded ? (
            <button
              className='px-2 py-1 bg-violet-500 hover:bg-violet-600 rounded text-white'
              onClick={() => {
                // const postParent = document.getElementById('postSection')
                // const newY =
                //   (400 - postBoxHeight) / 2 + 20
                //   changeScrollOfParent(newY)
                setHeight(prev => ({ ...prev, value: '', expanded: false }))
              }}
            >
              Collapse
            </button>
          ) : (
            <button
              className='px-2 py-1 bg-violet-500 hover:bg-violet-600 rounded text-white'
              onClick={() => {
                // const postParent = document.getElementById('postSection')
                // const newY =
                //    (400 - postBoxHeight) / 2 + 20
                // changeScrollOfParent(newY)
                setHeight(prev => ({
                  ...prev,
                  value: '400px',
                  expanded: true
                }))
              }}
            >
              Expand
            </button>
          )
        ) : null}
      </form>
      <section className='h-[calc(100%-48px)] pt-2 overflow-y-auto'>
        {commentBox.comments?.map(comment => (
          <div
            className='flex items-start justify-start mb-4 ml-2'
            key={comment.commentId}
          >
            <Avatar
              url={comment.creator?.user_img}
              className={`h-8 w-8 mr-2`}
            />
            <div className='px-2 rounded bg-stone-200'>
              <h1 className='text-slate-600 text-sm'>
                {comment.creator.user_name}
              </h1>
              <p>{comment.comment}</p>
            </div>
          </div>
        ))}
        {commentBox.comments.length < commentBox.commentsCount ? (
          <button
            className='px-2 py-1 bg-indigo-500 hover:bg-indigo-600 rounded text-white ml-3'
            onClick={loadMoreComments}
          >
            Load more
          </button>
        ) : null}
      </section>
    </div>
  )
}

export default CommentsSection
