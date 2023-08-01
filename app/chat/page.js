'use client'

import { motion } from 'framer-motion'

export default function Home () {
  return (
    <>
      <div className='h-full w-full flex justify-center items-center flex-col'>
        <motion.img
          src='https://cdn-icons-png.flaticon.com/512/5968/5968771.png'
          className='h-[200px]'
          alt=''
          initial={{ scale: 0 }}
          animate={{ scale: 1, transition: '2s' }}
        />
        <h1
          className='mt-10 text-4xl text-slate-700'
          style={{ fontFamily: 'Rubik' }}
        >
          Messenger Clone for Web
        </h1>
      </div>
    </>
  )
}
