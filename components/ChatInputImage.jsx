import { motion } from 'framer-motion'
import { abortImage } from '@/functions/abortImage'
import Image from 'next/image'

function ChatInputImage ({ imageInfo, setImageInfo }) {
  return imageInfo?.url ? (
    <div className='h-[250px] p-2 rounded-lg bg-slate-100'>
      <div className='h-full w-fit relative rounded overflow-hidden'>
        <motion.img
          layout
          src={imageInfo.url}
          className='h-full transition-all'
          alt=''
        />
        <div
          className='absolute right-0 top-0 h-5 w-5 rounded p-1 transition-all hover:bg-cyan-500 hover:invert flex justify-center items-center'
          onClick={() => abortImage(setImageInfo)}
        >
          <Image
            height={15}
            width={15}
            src='https://cdn-icons-png.flaticon.com/512/1828/1828778.png' // close ( x )
            className='h-[80%]'
            alt='cancel'
          />
        </div>
      </div>
      {/* Abort Image*/}
    </div>
  ) : null
}

export default ChatInputImage
