import Link from 'next/link'
import messenger from '../public/messenger.png'
import { useContext } from 'react'
import { Appstate } from '@/hooks/context'

export default function Topbar () {
  const { setSelectedService } = useContext(Appstate)
  return (
    <div className='w-full flex justify-center items-center'>
      <div className='w-[90%] h-8 mt-2 flex items-center justify-between'>
        <Link href={`/`}>
          <img
            src={messenger.src}
            className='w-8 p-1'
            alt=''
            onClick={() => setSelectedService('')}
          />
        </Link>
        <img
          src='https://cdn-icons-png.flaticon.com/512/1769/1769041.png'
          className='w-8 p-1 rounded-md transition-all hover:bg-slate-100'
          alt=''
        />
      </div>
    </div>
  )
}
