'use client'

import PostWrapper from '@/components/Posts/PostWrapper'
import Searchbar from '@/components/Searchbar'
import SearchedPeople from '@/components/SearchedPeople'
import { useUser } from '@clerk/nextjs'
import { useState } from 'react'

function page () {
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const handleSearchChange = async e => {
    setSearchQuery(e.target.value)
    let results = await fetch(
      `/api/findPeople?userId=${user.id}&query=${e.target.value}`,
      {
        method: 'POST',
        body: JSON.stringify({
          excluded: []
        })
      }
    )

    results = await results.json()
    console.log(results);
    setSearchResults(e.target.value ? results.data : [])
  }
  return (
    <main className='w-[calc(100%-80px)] h-full overflow-y-auto'>
      <Searchbar
        onChange={handleSearchChange}
        placeholder={`Search People`}
        value={searchQuery}
      />
      <div className='grid grid-cols-4 w-[80%] mx-auto'>
        {searchResults.map(result => {
          return <SearchedPeople data={result} key={result.user_id} />
        })}
      </div>
    </main>
  )
}

export default page



