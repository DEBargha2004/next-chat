import React, { useState } from 'react'

function ChatInput () {
  const [userInput, setUserInput] = useState('')
  const handleFileChange = e => {
    const fileReader = new FileReader()
    fileReader.onloadend = () => {
        fileReader.result
    }
    fileReader.readAsDataURL(e.target.files)
  }
  return (
    <div className='min-h-[64px] flex items-center justify-between px-10'>
      <input type='file' hidden name='' id='imageInput' onChange={handleFileChange} />
      <label htmlFor='imageInput'>
        <img
          src='https://cdn-icons-png.flaticon.com/512/10054/10054290.png'
          className='h-8 cursor-pointer'
          alt=''
        />
      </label>
      <input
        type='text'
        name=''
        value={userInput}
        id=''
        className='h-auto py-3 px-3 w-[85%] outline-none bg-gray-100 rounded-full text-lg text-slate-600'
        onChange={e => setUserInput(e.target.value)}
      />
      <img
        src='https://cdn-icons-png.flaticon.com/512/3682/3682321.png'
        className={`h-8 ${!userInput ? `grayscale` : ``}`}
        alt=''
      />
    </div>
  )
}

export default ChatInput
