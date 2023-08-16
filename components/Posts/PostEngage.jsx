import { contentDB, firestoreDB } from '@/firebase.config'
import { Appstate } from '@/hooks/context'
import { useUser } from '@clerk/nextjs'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import { v4 } from 'uuid'
import { cloneDeep, result } from 'lodash'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { LocalContext } from '../Post'
import { getComments } from '@/functions/getComments'
import { getImage } from '@/functions/getImage'
import { ref, uploadBytes } from 'firebase/storage'

const notLiked = 'https://cdn-icons-png.flaticon.com/512/2107/2107956.png'
const liked = 'https://cdn-icons-png.flaticon.com/512/2107/2107783.png'
const comment = 'https://cdn-icons-png.flaticon.com/512/3114/3114810.png'
const share = 'https://cdn-icons-png.flaticon.com/512/2958/2958783.png'

function PostEngage ({ post }) {
  const [hasLiked, setHasLiked] = useState(false)
  const [uploading, setUploading] = useState(false)

  const { setPosts, setSelectedComment, selectedComment } = useContext(Appstate)
  const { setCommentBox, commentBox } = useContext(LocalContext)

  const { user, isLoaded } = useUser()

  const [shareInfo, setShareInfo] = useState({ desc: '', file: null, url: '' })
  const [imageUrl,setImageUrl] = useState('')
  const shareDialogRef = useRef(null)

  const fetchEngageInfo = async (postId, userId) => {
    const hasUserLiked = await getDoc(
      doc(firestoreDB, `posts/${postId}/likes/${userId}`)
    )
    if (hasUserLiked.exists()) {
      return true
    }
    return false
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

  useEffect(()=>{
    post?.postImageAddress && getImage(post.postImageAddress).then(result => {
      setImageUrl(result)
    })
  },[])

  const handleComment = () => {
    setCommentBox(prev => ({ ...prev, state: !prev.state }))
    if (!commentBox.fetched) {
      getComments(commentBox.postId, commentBox.lastCommentDate).then(
        result => {
          setCommentBox(prev => ({
            ...prev,
            comments: result,
            fetched: true,
            lastCommentDate: result.at(-1)?.createdAt
          }))
        }
      )
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

  const handleShare = post => {
    shareDialogRef.current.showModal()
    console.log(post);
  }

  const handleSubmitShare = async post => {
    if (uploading) return
    if (!shareInfo.desc && !shareInfo.file) return
    setUploading(true)
    console.log(uploading);
    const postId = v4()
    const postImageAddress = v4()
    const createdAt = serverTimestamp()
    const postDescription = shareInfo.desc
    const creator = {
      user_id: user?.id,
      user_name: user?.fullName,
      user_email: user?.primaryEmailAddress.emailAddress,
      user_img: user?.imageUrl
    }
    const postref = {
      creator: post.creator,
      createdAt: post.createdAt,
      description: post.postDescription,
      imageAddress: post.postImageAddress
    }
    const likesCount = 0
    const commentsCount = 0
    const shareCount = 0
    const postInfo = {
      postId,
      createdAt,
      postDescription,
      postImageAddress,
      creator,
      likesCount,
      commentsCount,
      shareCount,
      postref
    }

    console.log(postInfo,post);

    !shareInfo.file && delete postInfo.postImageAddress
    !shareInfo.desc && delete postInfo.postDescription

    shareInfo.file &&
      (await uploadBytes(ref(contentDB, postImageAddress), shareInfo.file))
    await setDoc(doc(firestoreDB, `posts/${postId}`), postInfo)

    setShareInfo(prev => ({ ...prev, desc: '', file: null, url: '' }))
    setUploading(false)
    shareDialogRef.current.close()
  }

  const handleShareFileChange = e => {
    const reader = new FileReader()
    reader.onload = () => {
      setShareInfo(prev => ({
        ...prev,
        file: e.target.files[0],
        url: reader.result
      }))
    }
    reader.readAsDataURL(e.target.files[0])
  }

  useEffect(() => {
    post && fetchEngageInfo(post.postId, user?.id).then(result => setHasLiked(result))
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
        onClick={() => handleShare(post)}
      />
      <dialog  ref={shareDialogRef}>
        <img src={imageUrl} className='w-[450px]' alt='' />
        <p>{post?.postDescription}</p>
        <input type='file' onChange={handleShareFileChange} accept='image/*' />
        <img src={shareInfo.url} className='w-[450px]' alt='' />
        <textarea
          value={shareInfo.desc}
          onChange={e =>
            setShareInfo(prev => ({ ...prev, desc: e.target.value }))
          }
        ></textarea>
        <button
          className='bg-indigo-500 hover:bg-indigo-600 px-2 py-1 rounded text-white'
          onClick={() => handleSubmitShare(post)}
        >
          RePost
        </button>
        <button
          className='bg-indigo-500 hover:bg-indigo-600 px-2 py-1 rounded text-white'
          onClick={() => shareDialogRef.current.close()}
        >
          Close
        </button>
      </dialog>
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
      className='flex w-[25%] py-1 px-1 rounded justify-center items-center cursor-pointer hover:bg-slate-100 select-none'
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
