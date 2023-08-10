import Image from 'next/image'

export default function Searchbar ({ onChange, value, placeholder }) {
  return (
    <div className='w-full p-2 my-2 px-4 rounded-md box-border'>
      <div className='relative'>
        <input
          type='text'
          className='outline-none border-[1px] border-slate-400 w-full h-10 px-2 text-slate-600 border-b-4 border-b-indigo-500 rounded-md'
          placeholder={placeholder}
          onChange={onChange}
          value={value}
          autoFocus
        />
        <Image
          height={20}
          width={20}
          src='https://cdn-icons-png.flaticon.com/512/54/54481.png'
          className='h-5 absolute right-2 top-[10px] opacity-60 scale-90'
          alt=''
        />
      </div>
    </div>
  )
}
