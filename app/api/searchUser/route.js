import { firestoreDB } from '@/firebase.config'
import algoliasearch from 'algoliasearch/lite'
import { doc, getDoc } from 'firebase/firestore'
import { NextResponse } from 'next/server'

const searchClient = algoliasearch(
  'HN1VZMZZ3E',
  '5df6540e69ba1d14f71b16baf0fb548d'
)

const algoliaIndex = searchClient.initIndex('users')

export async function GET (request) {
  const { searchParams } = request.nextUrl

  const query = searchParams.get('query')
  const userId = searchParams.get('userId')

  try {
    const searchResults = await algoliaIndex.search(query)

    searchResults.hits = searchResults.hits.filter(user => {
      return user.user_id !== userId
    })

    const array = await Promise.all(
      searchResults.hits.map(async (user, index) => {
        const { user_id } = user
        const user_info_firestore = await getDoc(
          doc(firestoreDB, `users/${user_id}`)
        )
        if (user_info_firestore.exists()) {
          const new_combined_data = { ...user, ...user_info_firestore.data() }
          return new_combined_data
        }
      })
    )


    return NextResponse.json({ data: array })
  } catch (error) {
    console.log(error)
    return new Response('error')
  }
}
