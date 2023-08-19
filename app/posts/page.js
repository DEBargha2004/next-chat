'use client'

import { firestoreDB } from '@/firebase.config'
import { Appstate } from '@/hooks/context'
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where
} from 'firebase/firestore'
import { useContext, useEffect, useRef } from 'react'
import Post from '@/components/Post'

function Page () {
  const { posts, setPosts, lastPost, closeFriends, setCloseFriends } =
    useContext(Appstate)
  const postSectionRef = useRef(null)
  const fetching = useRef(false)

  async function getPosts (startAfterDate) {
    // console.log(startAfterDate)
    let postsQuery = query(
      collection(firestoreDB, `posts`),
      where('creator.user_id', 'in', closeFriends),
      orderBy('createdAt', 'desc'),
      limit(6)
    )
    if (startAfterDate) {
      // console.log('startAfterDate is', startAfterDate)
      postsQuery = query(
        collection(firestoreDB, `posts`),
        where('creator.user_id', 'in', closeFriends),
        orderBy('createdAt', 'desc'),
        limit(6),
        startAfter(startAfterDate)
      )
    }
    const local_storage = []
    const posts_firestore = await getDocs(postsQuery)
    for (const doc of posts_firestore.docs) {
      const post = doc.data()
      local_storage.push(post)
    }
    fetching.current = false
    return local_storage
  }

  const handleScroll = e => {
    const scrollBottom =
      e.target.scrollHeight - e.target.scrollTop - window.innerHeight
    // console.log(scrollBottom)
    if (scrollBottom <= 100) {
      if (!fetching.current) {
        fetching.current = true
        getPosts(posts.at(-1)?.createdAt).then(result => {
          lastPost.current = result.at(-1)
          setPosts(prev => [...prev, ...result])
        })
      }
    }
  }

  useEffect(() => {
    if (!closeFriends.length) return
    !lastPost.current &&
      getPosts().then(result => {
        setPosts(prev => {
          lastPost.current = result.at(-1)
          // console.log(result)
          // console.log(lastPost.current)
          return [...prev, ...result]
        })
      })
  }, [closeFriends])
  return (
    <div
      className='w-[calc(100%-80px)] h-full flex items-start justify-around overflow-auto pt-[100px]'
      ref={postSectionRef}
      onScroll={handleScroll}
      id='postSection'
    >
      {/* <PostLeftBar /> */}
      <div className='w-[35%]'>
        {posts.map((post, index) => {
          return <Post post={post} key={post.postId} />
        })}
      </div>
    </div>
  )
}

export default Page
