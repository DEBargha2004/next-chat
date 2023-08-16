'use client'

import { firestoreDB } from '@/firebase.config'
import { Appstate } from '@/hooks/context'
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter
} from 'firebase/firestore'
import { useContext, useEffect, useRef } from 'react'
import Post from '@/components/Post'

function page () {
  const { posts, setPosts,lastPost } = useContext(Appstate)
  const postSectionRef = useRef(null)
  const fetching = useRef(false)

  async function getPosts (startAfterDate) {
    console.log(startAfterDate)
    let postsQuery = query(
      collection(firestoreDB, `posts`),
      orderBy('createdAt', 'desc'),
      limit(3)
    )
    if (startAfterDate) {
      postsQuery = query(
        collection(firestoreDB, `posts`),
        orderBy('createdAt', 'desc'),
        limit(3),
        startAfter(startAfterDate)
      )
    }
    const local_storage = []
    const posts_firestore = await getDocs(postsQuery)
    for (const doc of posts_firestore.docs) {
      const post = doc.data()
      local_storage.push(post)
    }
    return local_storage
  }

  const handleScroll = e => {
    const scrollBottom =
      e.target.scrollHeight - e.target.scrollTop - window.innerHeight
    if (scrollBottom < 100) {
      if (!fetching.current) {
        fetching.current = true
        getPosts(posts.at(-1)?.createdAt).then(result => {
          lastPost.current = result.at(-1)
          setPosts(prev => [...prev,...result])
        })
      }
    }
  }

  useEffect(() => {
    !lastPost.current && getPosts().then(result => {
      setPosts(prev => {
        lastPost.current = result.at(-1)
        console.log(result)
        console.log(lastPost.current);
        return [...prev, ...result]
      })
    })
  }, [])
  return (
    <div
      className='w-[calc(100%-80px)] h-full flex items-start justify-around overflow-auto pt-[100px]'
      ref={postSectionRef}
      onScroll={handleScroll}
    >
      {/* <PostLeftBar /> */}
      <div className='w-[35%]'>
        {posts.map((post, index) => {
          return <Post post={post} key={index} />
        })}
      </div>
    </div>
  )
}

export default page
