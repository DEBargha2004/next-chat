import { Appstate } from '@/hooks/context'
import { UserButton } from '@clerk/nextjs'
import { useContext } from 'react'
import ServiceMarker from './ServiceMarker'
import ServiceComponent from './ServiceComponent'

function Sidenav ({ className }) {
  const { selectedService } = useContext(Appstate)
  return (
    <div
      className={`${className} flex items-end pb-10 border-r-[1px] border-slate-400`}
    >
      <div className='w-full h-[70%] flex flex-col justify-between items-center'>
        <div className='relative flex flex-col items-center justify-between w-full h-[45%]'>
          <ServiceComponent
            url='https://cdn-icons-png.flaticon.com/512/953/953810.png'
            index={0}
            to={'/chat'}
          />
          <ServiceComponent
            url='https://cdn-icons-png.flaticon.com/512/5977/5977971.png'
            index={1}
            to={'/posts'}
          />
          <ServiceComponent
            url='https://cdn-icons-png.flaticon.com/512/1500/1500455.png'
            index={2}
            to={'/friends'}
          />
          <ServiceComponent
            url='https://cdn-icons-png.flaticon.com/512/3161/3161837.png'
            index={3}
            to={'/upload'}
          />
        </div>
        <div className='flex flex-col items-center justify-between h-[20%]'>
          <img
            src='https://cdn-icons-png.flaticon.com/512/2040/2040504.png'
            alt=''
            className='h-7'
          />
          <UserButton />
        </div>
      </div>
    </div>
  )
}

export default Sidenav
