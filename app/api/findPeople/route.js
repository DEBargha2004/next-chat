import { firestoreDB } from '@/firebase.config'
import algoliasearch from 'algoliasearch/lite'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { NextResponse } from 'next/server'
import generateUniqueId from '@/functions/generateUniqueid'

const searchClient = algoliasearch(
  'HN1VZMZZ3E',
  '5df6540e69ba1d14f71b16baf0fb548d'
)

const algoliaIndex = searchClient.initIndex('users')

export async function POST (request) {
  const { searchParams } = request.nextUrl

  const { excluded } = await request.json()

  console.log(excluded)

  const query = searchParams.get('query')
  const userId = searchParams.get('userId')

  if(!query) return NextResponse.json({data : []})
  console.log(query,'found');

  try {
    const searchResults = await algoliaIndex.search(query)

    console.log(searchResults.hits)

    searchResults.hits = searchResults.hits.filter(user => {
      const userExcluded = excluded?.find(
        excludedUser => user.user_id === excludedUser.user_id
      )
      if (userExcluded || userId === user.user_id) return false
      return true
    })

    console.log(searchResults.hits)

    const array = await Promise.all(
      searchResults.hits.map(async (user, index) => {
        const { user_id } = user
        const user_info_firestore = await getDoc(
          doc(firestoreDB, `users/${user_id}`)
        )
        const friendshipId = generateUniqueId(userId, user.user_id)
        const friendshipInfo = await getDoc(
          doc(firestoreDB, `users/${userId}/friends/${friendshipId}`)
        )
        if (user_info_firestore.exists()) {
          const new_combined_data = {
            user_id: user.user_id,
            user_name: user.user_name,
            user_img: user_info_firestore.data().user_img,
            user_email: user.user_email,
            friendshipInfo: friendshipInfo.exists() ? friendshipInfo.data() : {}
          }
          return new_combined_data
        }
      })
    )
    // console.log(array);

    return NextResponse.json({ data: array })
  } catch (error) {
    console.log(error)
    return new Response('error')
  }
}
