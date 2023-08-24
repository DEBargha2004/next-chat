import { getDoc, doc, getDocs, collection } from 'firebase/firestore'
import { firestoreDB } from '@/firebase.config'
import _, { cloneDeep } from 'lodash'

export async function updateGroups ({ conversation_info, setGroups }) {
  let group_info = await getDoc(
    doc(firestoreDB, `groups/group_${conversation_info.conversation_id}`)
  )
  
  group_info = group_info.data()
  const local_storage_participants = []

  const participants = await getDocs(
    collection(firestoreDB, `groups/${group_info.id}/participants`)
  )
  participants.docs?.forEach(participant => {
    local_storage_participants.push(participant.data())
  })
  
  group_info.participants = local_storage_participants
  group_info.isParticipant = conversation_info.isParticipant

  console.log(group_info);

  setGroups(prev => {
    const cache_groups = cloneDeep(prev)
    console.log(prev);
    const index = _.findIndex(
      cache_groups,
      group => group.conversation_id === conversation_info.conversation_id
    )
    if (index === -1) {
      cache_groups.push(group_info)
    } else {
      cache_groups.splice(index, 1, group_info)
    }
    return cache_groups
  })
}
