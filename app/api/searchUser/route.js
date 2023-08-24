import { firestoreDB } from '@/firebase.config'
import algoliasearch from 'algoliasearch/lite'
import { doc, getDoc } from 'firebase/firestore'
import { NextResponse } from 'next/server'

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY
)

const algoliaIndex = searchClient.initIndex('users')

export async function POST (request) {
  const { searchParams } = request.nextUrl

  const { excluded } = await request.json()


  const query = searchParams.get('query')
  const userId = searchParams.get('userId')

  try {
    const searchResults = await algoliaIndex.search(query)


    searchResults.hits = searchResults.hits.filter(user => {
      const userExcluded = excluded?.find(
        excludedUser => user.user_id === excludedUser.user_id
      )
      if (userExcluded || userId === user.user_id) return false
      return true
    })


    const array = await Promise.all(
      searchResults.hits.map(async (user, index) => {
        const { user_id } = user
        const user_info_firestore = await getDoc(
          doc(firestoreDB, `users/${user_id}`)
        )
        if (user_info_firestore.exists()) {
          const new_combined_data = {
            user_id: user.user_id,
            user_name: user.user_name,
            user_img: user_info_firestore.data().user_img,
            user_email: user.user_email
          } //{ ...user, ...user_info_firestore.data() }
          return new_combined_data
        }
      })
    )
    // console.log(array);

    return NextResponse.json({ data: array })
  } catch (error) {
    // console.log(error)
    return new Response('error')
  }
}
