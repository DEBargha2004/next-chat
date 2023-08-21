import { Appstate } from '@/hooks/context'
import { UserButton, useUser } from '@clerk/nextjs'
import { createContext, useContext, useMemo } from 'react'
import ServiceComponent from './ServiceComponent'
import { serviceList } from '@/constants/serviceList'

export const sidenavProvider = createContext()

function Sidenav ({ className }) {
  const { selectedService, messages,conversationsInfo } = useContext(Appstate)
  const { user } = useUser()

  const unreadUsermessage = useMemo(() => {
    let count = 0
    const messageKeys = Object.keys(messages)
    messageKeys.forEach(key => {
      if (key.indexOf('user_') !== 0) return
      const messageList = messages[key]
      messageList.forEach(message => {
        if (message.read_by) {
          if (
            message.sender_id !== user?.id &&
            !message.read_by.includes(user?.id)
          ) {
            ++count
          }
        }
      })
    })

    return count
  }, [messages, user, conversationsInfo])

  const unreadGroupmessage = useMemo(() => {
    let count = 0
    const messageKeys = Object.keys(messages)
    messageKeys.forEach(key => {
      if (key.indexOf('group_') !== 0) return
      const messageList = messages[key]
      messageList.forEach(message => {
        if (message.read_by) {
          if (
            message.sender_id !== user?.id &&
            !message.read_by.includes(user?.id)
          ) {
            ++count
          }
        }
      })
    })

    return count
  }, [messages, user, conversationsInfo])

  return (
    <nav
      className={`${className} flex items-end pb-10 border-r-[1px] border-slate-400`}
    >
      <div className='w-full h-[70%] flex flex-col justify-between items-center'>
        <div className='relative flex flex-col items-center justify-between w-full h-[60%]'>
          <sidenavProvider.Provider
            value={{ unreadUsermessage, unreadGroupmessage }}
          >
            {serviceList.map((service, index) => (
              <ServiceComponent
                url={service.url}
                index={index}
                to={service.to}
                key={index}
                service={service.service}
              />
            ))}
          </sidenavProvider.Provider>
        </div>
        <div className='flex flex-col items-center justify-end h-[20%]'>
          {/* <Image
            height={28}
            width={28}
            src='https://cdn-icons-png.flaticon.com/512/2040/2040504.png'
            alt='settings-icon'
            className='h-7 transition-all hover:rotate-45'
          /> */}
          <UserButton />
        </div>
      </div>
    </nav>
  )
}

export default Sidenav
