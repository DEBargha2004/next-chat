function PostAppreciations ({ likesCount, commentsCount, shareCount }) {
  return (
    <div className='w-[90%] flex justify-between mx-auto'>
      <div>{likesCount} likes</div>
      <div className='flex justify-between items-center w-[20%]'>
        <div className="flex w-[40%] items-center justify-around text-slate-400">
          {commentsCount}{' '}
          <img
            src='	https://cdn-icons-png.flaticon.com/512/10407/10407195.png'
            className='h-5'
            alt=''
          />
        </div>
        <div className="flex w-[40%] items-center justify-around text-slate-400">
          {shareCount}{' '}
          <img
            src='https://cdn-icons-png.flaticon.com/512/2550/2550209.png'
            className='h-5'
            alt=''
          />
        </div>
      </div>
    </div>
  )
}

export default PostAppreciations
