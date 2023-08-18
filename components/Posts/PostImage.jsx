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
      className={`w-full p-1 border-y border-[#00000056] h-[400px] ${className}`}
    >
      <Image
        height={400}
        width={600}
        layout='responsive'
        src={url}
        className='w-full h-full object-contain'
        alt=''
      />
    </div>
  )
}

export default PostImage
