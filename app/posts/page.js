'use client'

import PostAppreciations from '@/components/Posts/PostAppreciations'
import PostCreation from '@/components/Posts/PostCreation'
import PostDescription from '@/components/Posts/PostDescription'
import PostEngage from '@/components/Posts/PostEngage'
import PostImage from '@/components/Posts/PostImage'
import PostWrapper from '@/components/Posts/PostWrapper'
import { firestoreDB } from '@/firebase.config'
import { getImage } from '@/functions/getImage'
import { Appstate } from '@/hooks/context'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { useContext, useEffect, useState } from 'react'
import PostRightBar from '@/components/Posts/PostRightBar'
import PostLeftBar from '@/components/Posts/PostLeftBar'

function page () {
  const { posts, setPosts } = useContext(Appstate)

  async function getPosts () {
    setPosts([])
    const postsQuery = query(collection(firestoreDB, `posts`),orderBy('createdAt','desc'))
    const posts_firestore = await getDocs(postsQuery)
    for (const doc of posts_firestore.docs) {
      const post = doc.data()
      setPosts(prev => [...prev, post])
    }
  }

  useEffect(() => {
    getPosts()
  }, [])
  return (
    <div className='w-[calc(100%-80px)] h-full flex items-start justify-around overflow-auto'>
    <PostLeftBar />
      <div className='w-[35%] '>
        {posts.map(post => {
          return (
            <PostWrapper className={`w-full my-3`}>
              <PostCreation createdAt={post.createdAt} creator={post.creator} />
              <PostDescription description={post.postDescription} />
              <PostImage address={post.postImageAddress} className={``} />
              <PostAppreciations
                commentsCount={post.commentsCount}
                likesCount={post.likesCount}
                shareCount={post.shareCount}
              />
              <PostEngage post={post} />
            </PostWrapper>
          )
        })}
      </div>
      <PostRightBar />
    </div>
  )
}

export default page
