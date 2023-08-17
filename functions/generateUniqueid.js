import { v5 } from "uuid"


function generateUniqueId (id1, id2) {
  const sortedids = [id1, id2].sort().join('-')

  const unique_id = v5(sortedids, v5.DNS)
  return unique_id
}

export default generateUniqueId
