import { getImage } from '@/functions/getImage'
import { useEffect, useState } from 'react'
import Image from 'next/image'

function PostImage ({ address, className }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    getImage(address).then(downloadedUrl => setUrl(downloadedUrl))
  }, [address])
  return (
    <div
      className={`w-full px-1 border-y border-[#00000056] h-[400px] overflow-hidden ${className}`}
    >
      <Image
        height={400}
        width={400}
        layout='responsive'
        src={url}
        className='w-full max-h-full object-contain box-border'
        alt=''
      />
    </div>
  )
}

export default PostImage
