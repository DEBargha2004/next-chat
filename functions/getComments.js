import { query, collection, orderBy, limit, getDocs,startAfter } from 'firebase/firestore'
import { firestoreDB } from '@/firebase.config'

export const getComments = async (postId, startAfterDate) => {
  if (!postId) return []
  const local_comments = []
  let commentsQuery = query(
    collection(firestoreDB, `posts/${postId}/comments`),
    orderBy('createdAt', 'desc'),
    limit(5)
  )
  if (startAfterDate) {
    commentsQuery = query(
      collection(firestoreDB, `posts/${postId}/comments`),
      orderBy('createdAt', 'desc'),
      limit(5),
      startAfter(startAfterDate)
    )
  }
  const comments = await getDocs(commentsQuery)
  comments.docs.forEach(comment => {
    local_comments.push(comment.data())
  })

  return local_comments
}
