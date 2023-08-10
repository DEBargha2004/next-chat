import Link from 'next/link'
import messenger from '../public/messenger.png'
import { useContext } from 'react'
import { Appstate } from '@/hooks/context'
import Image from 'next/image'

export default function Topbar ({ linkedElement: { url, to, service } }) {
  const { setSelectedService } = useContext(Appstate)
  return (
    <nav className='w-full flex justify-center items-center'>
      <div className='w-[90%] h-8 mt-2 flex items-center justify-between'>
        <Link href={`/`}>
          <Image
            width={32}
            height={32}
            src={messenger.src}
            className='w-8 p-1'
            alt=''
            onClick={() => setSelectedService('')}
          />
        </Link>
        <Link href={to}>
          <Image
            width={32}
            height={32}
            src={url}
            className='w-8 p-1 rounded-md transition-all hover:bg-slate-100'
            alt=''
            onClick={() => setSelectedService(service)}
          />
        </Link>
      </div>
    </nav>
  )
}
