import React from 'react'
import Image from 'next/image'

const OwnerBadge = () => {
    return (
      <Image
        height={16}
        width={16}
        src='https://cdn-icons-png.flaticon.com/512/1828/1828884.png'
        className='h-4 mr-1'
      />
    )
  }

export default OwnerBadge