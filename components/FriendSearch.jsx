import { useEffect } from 'react'

export default function FriendSearch ({
  onChange,
  value,
  setSearchedItemsStorage
}) {
  useEffect(() => {
    if (!value) {
      setSearchedItemsStorage && setSearchedItemsStorage([])
    }
  }, [value])

  return (
    <div className='w-full p-2 my-2 px-4 rounded-md box-border'>
      <div className='relative'>
        <input
          type='text'
          className='outline-none border-[1px] border-slate-400 w-full h-10 px-2 text-slate-600 border-b-4 border-b-indigo-500 rounded-md'
          placeholder='search a friend or a group'
          onChange={onChange}
          value={value}
        />
        <img
          src='https://cdn-icons-png.flaticon.com/512/54/54481.png'
          className='h-5 absolute right-2 top-[10px] opacity-60 scale-90'
          alt=''
        />
      </div>
    </div>
  )
}
