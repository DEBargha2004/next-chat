'use client'

import { contentDB, firestoreDB } from '@/firebase.config'
import { Appstate } from '@/hooks/context'
import { useUser } from '@clerk/nextjs'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ref, uploadBytes } from 'firebase/storage'
import { useContext, useRef, useState } from 'react'
import { v4 } from 'uuid'
import Image from 'next/image'

function Page () {
  const postDescriptionRef = useRef(null)
  const postImageRef = useRef(null)
  const [image, setImage] = useState({ url: '', file: null })
  const [desc, setDesc] = useState('')
  const [uploading, setUploading] = useState(false)
  const { user } = useUser()
  const {setPosts} = useContext(Appstate)

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
    if (uploading) return
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

    !image.file && delete post.postImageAddress
    !desc && delete post.postDescription

    image.file &&
      (await uploadBytes(ref(contentDB, postImageAddress), image.file))
    await setDoc(doc(firestoreDB, `posts/${postId}`), post)

    setDesc('')
    setImage(prev => ({ ...prev, file: '', url: '' }))
    setUploading(false)
    postImageRef.current.value = null
    setPosts(prev => {
      if(prev?.length){
        return [post,...prev]
      }else{
        return prev
      }
    })
  }
  return (
    <div className='h-full flex items-center justify-center w-[calc(100%-80px)] overflow-y-auto'>
      <div className='w-[40%] h-full transition-all flex flex-col items-center py-10 px-[50px]'>
      <h1 className='text-2xl text-slate-600'>Whtat's on you mind!!</h1>
        <input
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          ref={postImageRef}
          id='imageInputForPost'
          hidden
        />
        <label htmlFor='imageInputForPost'>
          <Image
            src='https://cdn-icons-png.flaticon.com/512/5175/5175601.png'
            alt=''
            className='h-10 cursor-pointer my-5'
            height={40}
            width={40}
          />
        </label>
        {image.url ? (
          <Image height={350} width={500} layout='reponsive' src={image.url} className='w-[85%] h-[350px] object-contain my-5' />
        ) : null}
        <textarea
          className='bg-transparent w-[90%] outline-2 my-5 shrink-0 outline-black border-black outline-none rounded-lg h-12 py-3 px-2 overflow-hidden resize-none'
          ref={postDescriptionRef}
          onChange={handlePostDescriptionChange}
          value={desc}
        />
        <button
          className={`px-2 py-1 rounded bg-blue-500 text-white ${
            uploading ? `grayscale cursor-not-allowed` : ``
          }`}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default Page
