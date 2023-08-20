'use client'

import Searchbar from '@/components/Searchbar'
import SearchedPeople from '@/components/SearchedPeople'
import { Appstate } from '@/hooks/context'
import { useUser } from '@clerk/nextjs'
import { createContext, useContext, useEffect, useState } from 'react'

export const friendsZone = createContext()

function Page () {
  const { user, isLoaded } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const { lastFriend, closeFriendsInFriends, setCloseFriendsInFriends } =
    useContext(Appstate)
  const [fetching, setFetching] = useState(false)

  const handleSearchChange = async e => {
    setSearchQuery(e.target.value)
    let results = await fetch(
      `/api/findPeople?userId=${user?.id}&query=${e.target.value}`,
      {
        method: 'POST',
        body: JSON.stringify({
          excluded: []
        })
      }
    )

    results = await results.json()
    setSearchResults(e.target.value ? results.data : [])
  }

  const handleScroll = e => {
    const scrollBottom =
      e.target.scrollHeight - e.target.scrollTop - window.innerHeight

    if (scrollBottom <= 100) {
      if (!fetching) {
        setFetching(true)
        fetch(
          `/api/findPeople?userId=${user?.id}&createdAt=${lastFriend.current}`
        )
          .then(result => result.json())
          .then(data => {
            const lastData = data?.allFriends?.friends?.at(-1)
            if (lastData.current) {
              lastFriend.current = lastData.current.createdAt
            }
            setCloseFriendsInFriends(data.allFriends.friends)
          })
          .then(() => {
            setFetching(false)
          })
      }
    }
  }

  useEffect(() => {
    if (!isLoaded) return

    !lastFriend.current &&
      fetch(
        `/api/findPeople?userId=${user?.id}&createdAt=${lastFriend.current}`
      )
        .then(result => result.json())
        .then(data => {
          const lastData = data?.allFriends?.friends?.at(-1)
          if (lastData?.current) {
            lastFriend.current = lastData.current.createdAt
          }
          setCloseFriendsInFriends(data.allFriends.friends)
        })
  }, [isLoaded])

  return (
    <friendsZone.Provider value={{ searchResults, setSearchResults }}>
      <main className='w-[calc(100%-80px)] h-full overflow-y-auto flex items-start justify-between px-[50px]'>
        <section className='w-2/5'>
          <Searchbar
            onChange={handleSearchChange}
            placeholder={`Search People`}
            value={searchQuery}
          />
          <div className='flex flex-wrap mx-auto'>
            {searchResults.map(result => {
              return <SearchedPeople data={result} key={result.user_id} />
            })}
          </div>
        </section>
        <div
          className='grid grid-cols-3 w-[50%] overflow-y-auto h-full items-start'
          onScroll={handleScroll}
        >
          {closeFriendsInFriends?.map(result => {
            return <SearchedPeople data={result} key={result.user_id} />
          })}
        </div>
      </main>
    </friendsZone.Provider>
  )
}

export default Page
