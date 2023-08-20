import { Appstate } from '@/hooks/context'
import Link from 'next/link'
import { useContext, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { sidenavProvider } from './Sidenav'

function ServiceComponent ({ url, to, service }) {
  const { selectedService, setSelectedService } = useContext(Appstate)
  const { unreadUsermessage, unreadGroupmessage } = useContext(sidenavProvider)

  const unread = service => {
    const unreadNumber = (() => {
      if (service === 'chat') {
        return unreadUsermessage > 99 ? `99+` : unreadUsermessage
      } else if (service === 'groups') {
        return unreadGroupmessage > 99 ? `99+` : unreadGroupmessage
      }
    })()

    return (
      <div
        className={`w-[20px] h-[20px] transition-all absolute ${
          unreadNumber ? `scale-1` : `scale-0`
        } -top-3 -right-3 -translate-x-[50%] translate-y-[50%] bg-green-500 rounded-full text-white text-[10px] flex justify-center items-center`}
      >
        {unreadNumber}
      </div>
    )
  }

  useEffect(() => {
    if (window.location.pathname.includes(to)) {
      setSelectedService(to)
    }
  }, [])

  return (
    <Link href={to ? to : ''}>
      <div
        className={`p-2 rounded-md transition-all hover:bg-slate-200 relative flex justify-between items-center ${
          to.includes(selectedService) ? `bg-slate-200` : ``
        }`}
        onClick={() => setSelectedService(to)}
      >
        {to.includes(selectedService) ? (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `28px` }}
            className=' w-1 bg-cyan-500 rounded-lg transition-all duration-75 ease-linear absolute -left-[1px]'
          ></motion.div>
        ) : null}
        {unread(service)}
        <Image
          height={28}
          width={28}
          src={url}
          className='h-7'
          alt={to.replace('/', '')}
        />
      </div>
    </Link>
  )
}

export default ServiceComponent
