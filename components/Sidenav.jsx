import { Appstate } from '@/hooks/context'
import { UserButton } from '@clerk/nextjs'
import { useContext } from 'react'
import ServiceMarker from './ServiceMarker'
import ServiceComponent from './ServiceComponent'
import { serviceList } from '@/constants/serviceList'

function Sidenav ({ className }) {
  const { selectedService } = useContext(Appstate)
  return (
    <div
      className={`${className} flex items-end pb-10 border-r-[1px] border-slate-400`}
    >
      <div className='w-full h-[70%] flex flex-col justify-between items-center'>
        <div className='relative flex flex-col items-center justify-between w-full h-[60%]'>
          {serviceList.map((service, index) => (
            <ServiceComponent
              url={service.url}
              index={index}
              to={service.to}
              key={index}
            />
          ))}
        </div>
        <div className='flex flex-col items-center justify-between h-[20%]'>
          <img
            src='https://cdn-icons-png.flaticon.com/512/2040/2040504.png'
            alt=''
            className='h-7 transition-all hover:rotate-45'
          />
          <UserButton />
        </div>
      </div>
    </div>
  )
}

export default Sidenav
