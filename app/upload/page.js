'use client'

import { contentDB, firestoreDB } from '@/firebase.config'
import { useUser } from '@clerk/nextjs'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ref, uploadBytes } from 'firebase/storage'
import { useRef, useState } from 'react'
import { v4 } from 'uuid'

function page () {
  const postDescriptionRef = useRef(null)
  const postImageRef = useRef(null)
  const [image, setImage] = useState({ url: '', file: null })
  const [desc, setDesc] = useState('')
  const [uploading,setUploading] = useState(false)
  const { user } = useUser()

  const handlePostDescriptionChange = e => {
    const element = postDescriptionRef.current

    element.style.height = '10px' // Set the minimum height before calculating scrollHeight
    element.style.height = `${element.scrollHeight}px` // Set height based on scrollHeight
    setDesc(e.target.value)
  }
  const handleFileChange = e => {
    const reader = new FileReader()
    reader.onload = () => {
      setImage(prev => ({
        ...prev,
        file: e.target.files[0],
        url: reader.result
      }))
    }
    reader.readAsDataURL(e.target.files[0])
  }
  const handleSubmit = async e => {
    if(uploading) return
    if (!desc && !image.url) return
    setUploading(true)
    const postId = v4()
    const postImageAddress = v4()
    const createdAt = serverTimestamp()
    const postDescription = desc
    const creator = {
      user_id: user?.id,
      user_name: user?.fullName,
      user_email: user?.primaryEmailAddress.emailAddress,
      user_img: user?.imageUrl
    }
    const likesCount = 0
    const commentsCount = 0
    const shareCount = 0
    const post = {
      postId,
      createdAt,
      postDescription,
      postImageAddress,
      creator,
      likesCount,
      commentsCount,
      shareCount
    }

    await uploadBytes(ref(contentDB, postImageAddress), image.file)
    await setDoc(doc(firestoreDB, `posts/${postId}`), post)

    setDesc('')
    setImage(prev => ({ ...prev, file: '', url: '' }))
    setUploading(false)
    postImageRef.current.value = null
  }
  return (
    <div className='h-full flex items-center justify-center w-[calc(100%-80px)] bg-red-100'>
      <div className='w-[40%] h-full bg-red-200 transition-all flex flex-col items-center py-10 px-[50px]'>
        <input
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          ref={postImageRef}
        />
        {image.url ? (
          <img src={image.url} className='w-[85%] h-[350px] object-cover' />
        ) : null}
        <textarea
          className='bg-transparent w-[90%] outline-2 outline-black border-black outline-none rounded-lg h-12 py-3 px-2 overflow-hidden resize-none'
          ref={postDescriptionRef}
          onChange={handlePostDescriptionChange}
          value={desc}
        />
        <button
          className={`px-2 py-1 rounded bg-blue-500 text-white ${uploading ? `grayscale cursor-not-allowed` : ``}`}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default page
