import { onValue, ref } from 'firebase/database'
import { realtimeDB } from '@/firebase.config'
import _, { cloneDeep } from 'lodash'

export function updatePresenceStatus ({ setPresenceInfo, id }) {
  onValue(ref(realtimeDB, `users/${id}`), snap => {
    setPresenceInfo(prev => {
      const localPresenceInfo = cloneDeep(prev)
      const user_presenceInfo = localPresenceInfo.find(
        info => info.user_id === id
      )

      if (!user_presenceInfo) {
        localPresenceInfo.push(snap.val())
      } else {
        const index = _.findIndex(localPresenceInfo, obj => obj.user_id === id)
        localPresenceInfo.splice(index, 1, snap.val())
      }
      return localPresenceInfo
    })
  })
}
