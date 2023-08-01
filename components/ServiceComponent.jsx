import { Appstate } from '@/hooks/context'
import Link from 'next/link'
import { useContext, useEffect } from 'react'
import { motion } from 'framer-motion'

function ServiceComponent ({ url, index, to }) {
  const { selectedService, setSelectedService } = useContext(Appstate)

  useEffect(() => {
    if (window.location.pathname.includes(to)) {
      setSelectedService(to)
    }
  }, [])

  return (
    <Link href={to ? to : ''}>
      <div
        className='p-2 rounded-md transition-all hover:bg-slate-200 relative flex justify-between items-center'
        onClick={() => setSelectedService(to)}
      >
        {selectedService === to ? (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `28px` }}
            className=' w-1 bg-cyan-500 rounded-lg transition-all duration-75 ease-linear'
          ></motion.div>
        ) : null}
        <img src={url} className='pl-2 h-7' alt='' />
      </div>
    </Link>
  )
}

export default ServiceComponent
