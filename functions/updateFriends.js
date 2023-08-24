import { UserInfoWithConversations } from './userInfoWithConversations'
import { firestoreDB } from '@/firebase.config'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import _ from 'lodash'
import { updatePresenceStatus } from './updatePresenceStatus'

export async function updateFriends ({
  conversation_info,
  setFriends,
  setPresenceInfo,
  user
}) {
  const groups_info = []


  const participants = conversation_info.participants

  const friend_info = await UserInfoWithConversations({
    // getting the info from database
    participants,
    user
  })

  friend_info.conversation_id = conversation_info.conversation_id
  friend_info.typing = conversation_info.typing
  friend_info.isParticipant = conversation_info.isParticipant

  console.log(friend_info.typing);
  // friends_info.push(friend_info)
  setFriends(prev => [...prev, friend_info])

  let friend_id = participants.find(id => id !== user.id)

  // Set up the listener for presence
  updatePresenceStatus({ setPresenceInfo, id: friend_id })

}
