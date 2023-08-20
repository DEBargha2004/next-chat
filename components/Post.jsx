import PostWrapper from './Posts/PostWrapper'
import PostCreation from './Posts/PostCreation'
import PostDescription from './Posts/PostDescription'
import PostImage from './Posts/PostImage'
import PostAppreciations from './Posts/PostAppreciations'
import PostEngage from './Posts/PostEngage'
import CommentsSection from './Posts/CommentsSection'
import { createContext, useEffect, useRef, useState } from 'react'
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
  const [height, setHeight] = useState({ value: '', expanded: false })
  const postBoxRef = useRef(null)
  const [postBoxHeight, setPostBoxHeight] = useState(0)

  useEffect(() => {
    setPostBoxHeight(postBoxRef.current.offsetHeight)
  }, [])
 
  return (
    <LocalContext.Provider
      value={{
        commentBox,
        setCommentBox,
        height,
        setHeight,
        postBoxHeight,
        setPostBoxHeight
      }}
    >
      <div
        className={`relative transition-all my-3 duration-300`}
        style={{
          margin: height.expanded ? `${(400 - postBoxHeight) / 2 + 40}px 0` : ``
        }}
        ref={postBoxRef}
      >
        <PostWrapper
          className={`w-full z-10 duration-300 transition-all  ${
            commentBox.state ? `-translate-x-[51%]` : ``
          }`}
        >
          <PostCreation createdAt={post.createdAt} creator={post.creator} />
          <PostDescription description={post.postDescription} />
          {post.postImageAddress ? (
            <PostImage
              address={post.postImageAddress}
              className={`max-h-[500px]`}
            />
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
          classname={`duration-300 absolute top-1/2 -translate-y-[50%] left-0 h-full ${
            commentBox.state ? `translate-x-[59%]` : ``
          }`}
        />
      </div>
    </LocalContext.Provider>
  )
}

export default Post
