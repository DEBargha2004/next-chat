import { UserInfoWithConversations } from "./userInfoWithConversations"
import { realtimeDB } from "@/firebase.config"
import { onValue,ref } from "firebase/database"
import _ from "lodash"


export async function updateFriendsAndStatus ({
    conversationsInfo,
    setFriends,
    setPresenceInfo,
    user
  }) {

    const localPresenceInfo = []
    const friends_info = []

    for (const conversation_info of conversationsInfo) {
      const participants = conversation_info.participants

      const friend_info = await UserInfoWithConversations({
        participants,
        user
      })
      friends_info.push(friend_info)

      let friend_id = participants.find(id => id !== user.id)

      // Set up the listener and store its reference
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
        console.log(localPresenceInfo, 'before setting')
        setPresenceInfo([...localPresenceInfo])
      })
    }

    setFriends([...friends_info])
  }