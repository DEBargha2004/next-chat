export const generate_hybrid = ({ friendList, searchList }) => {
  const hybridArray = searchList.map(user => {
    const user_id_search = user.user_id
    const user_friendList = friendList.find(
      friend => friend.user_id === user_id_search
    )
    if (user_friendList) {
      return user_friendList
    } else {
      return user
    }
  })

  return hybridArray
}
