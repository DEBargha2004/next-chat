import PostWrapper from './Posts/PostWrapper'
import PostCreation from './Posts/PostCreation'
import PostDescription from './Posts/PostDescription'
import PostImage from './Posts/PostImage'
import PostAppreciations from './Posts/PostAppreciations'
import PostEngage from './Posts/PostEngage'
import CommentsSection from './Posts/CommentsSection'
import { createContext, useState } from 'react'
import PostRef from './Posts/PostRef'

export const LocalContext = createContext()

function Post ({ post }) {
  const [commentBox, setCommentBox] = useState({
    state: false,
    comments: [],
    postId: post.postId,
    fetched: false,
    commentsCount: post.commentsCount,
    lastCommentDate: null
  })

  return (
    <LocalContext.Provider value={{ commentBox, setCommentBox }}>
      <div className='relative'>
        <PostWrapper
          className={`w-full my-3 z-10 duration-300 ${
            commentBox.state ? `-translate-x-1/2` : ``
          }`}
        >
          <PostCreation createdAt={post.createdAt} creator={post.creator} />
          <PostDescription description={post.postDescription} />
          {post.postImageAddress ? (
            <PostImage address={post.postImageAddress} className={`max-h-[500px]`} />
          ) : null}
          <PostRef postref={post.postref} />
          <PostAppreciations
            commentsCount={commentBox.commentsCount}
            likesCount={post.likesCount}
            shareCount={post.shareCount}
          />
          <PostEngage post={post} />
        </PostWrapper>
        <CommentsSection
          classname={`duration-300 absolute top-1/2 -translate-y-[50%] left-0 h-[95%] w-full ${
            commentBox.state ? `translate-x-1/2` : ``
          }`}
        />
      </div>
    </LocalContext.Provider>
  )
}

export default Post
