import deliver_letter_open from '../public/deliver-letter-open.png'
import deliver_letter_close from '../public/deliver-letter-close.png'
import delivering_letter from '../public/delivering-letter.png'

import dark_deliver_letter_open from '../public/dark-deliver-letter-open.png'
import dark_deliver_letter_close from '../public/dark-deliver-letter-close.png'
import dark_delivering_letter from '../public/dark-delivering-letter.png'
import { useUser } from '@clerk/nextjs'

export default function messageStatus (message, color) {
  const showSeenStatus = SeenStatus(message)


  return showSeenStatus ? (
    showSeenStatus.deliver ? (
      showSeenStatus.read ? (
        <img
          src={!color ? dark_deliver_letter_open.src : deliver_letter_open.src}
          className='h-4 w-auto'
          alt=''
        />
      ) : (
        <img
          src={
            !color ? dark_deliver_letter_close.src : deliver_letter_close.src
          }
          className='h-4 w-auto'
          alt=''
        />
      )
    ) : (
      <img
        src={!color ? dark_delivering_letter.src : delivering_letter.src}
        className='h-4 w-auto'
        alt=''
      />
    )
  ) : null
}

function SeenStatus (message) {
  const { user } = useUser()
  if (message?.sender_id === user?.id) {
    return {
      deliver: message.message_deliver,
      read: message.message_read
    }
  } else {
    return false
  }
}
