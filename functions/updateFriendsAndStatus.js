import { UserInfoWithConversations } from './userInfoWithConversations'
import { firestoreDB, realtimeDB } from '@/firebase.config'
import { onValue, ref } from 'firebase/database'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import _ from 'lodash'

export async function updateFriendsAndStatus ({
  conversationsInfo,
  setFriends,
  setPresenceInfo,
  user,
  setGroups
}) {
  const localPresenceInfo = []
  const friends_info = []
  const groups_info = []

  for (const conversation_info of conversationsInfo) {
    if (conversation_info.type === 'group') {
      let group_info = await getDoc(
        doc(firestoreDB, `groups/group_${conversation_info.conversation_id}`)
      )
      group_info = group_info.data()
      const local_storage = []
      const participants = await getDocs(
        collection(firestoreDB, `groups/${group_info.id}/participants`)
      )
      participants.docs.forEach(participant => {
        local_storage.push(participant.data())
      })
      group_info.participants = local_storage

      groups_info.push(group_info)

      local_storage.map(participant => {
        const friend_id = participant.user_id
        onValue(ref(realtimeDB, `users/${friend_id}`), snap => {
          const user_presenceInfo = localPresenceInfo.find(
            info => info.user_id === friend_id
          )
          if (!user_presenceInfo) {
            localPresenceInfo.push(snap.val())
          } else {
            const index = _.findIndex(
              localPresenceInfo,
              obj => obj.user_id === friend_id
            )

            localPresenceInfo.splice(index, 1, snap.val())
            // console.log(snap.val());
          }
          // console.log(localPresenceInfo, "before setting");
          setPresenceInfo([...localPresenceInfo])
        })
      })
      continue
    }
    const participants = conversation_info.participants

    const friend_info = await UserInfoWithConversations({
      // getting the info from database
      participants,
      user
    })
    friends_info.push(friend_info)

    let friend_id = participants.find(id => id !== user.id)
    // let friend_ids = participants.filter(participant => )
    console.log(participants)

    // Set up the listener for presence
    onValue(ref(realtimeDB, `users/${friend_id}`), snap => {
      const user_presenceInfo = localPresenceInfo.find(
        info => info.user_id === friend_id
      )
      if (!user_presenceInfo) {
        localPresenceInfo.push(snap.val())
      } else {
        const index = _.findIndex(
          localPresenceInfo,
          obj => obj.user_id === friend_id
        )

        localPresenceInfo.splice(index, 1, snap.val())
        // console.log(snap.val());
      }
      // console.log(localPresenceInfo, "before setting");
      setPresenceInfo([...localPresenceInfo])
    })
  }

  setFriends([...friends_info])
  setGroups([...groups_info])
}
