import PostCreation from './PostCreation'
import PostDescription from './PostDescription'
import PostImage from './PostImage'

function PostRef ({ postref }) {
  console.log(postref)
  return (
    <>
      {postref ? (
        <div className='w-[calc(100%-24px)] ml-5 p-1 border border-slate-300 rounded-lg my-2'>
          <PostCreation
            createdAt={postref?.createdAt}
            creator={postref?.creator}
            avatarHeight = {40}
            avatarWidth = {40}
          />
          <PostDescription description={postref?.description} />
          {postref.imageAddress ? (
            <PostImage address={postref?.imageAddress} className={`max-h-[500px]`} />
          ) : null}
        </div>
      ) : null}
    </>
  )
}

export default PostRef
