import { getImage } from "@/functions/getImage"
import { useEffect, useState } from "react"


function PostImage({address,className}) {
    const [url,setUrl] = useState('')
    useEffect(()=>{
        getImage(address).then(downloadedUrl => setUrl(downloadedUrl))
    },[address])
  return (
    <div className={`w-full p-1 border-y border-[#00000056] ${className}`}>
        <img src={url} className="w-full" alt="" />
    </div>
  )
}

export default PostImage