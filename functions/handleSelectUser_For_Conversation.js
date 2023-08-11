export const handleSelectUser_For_Conversation = ({
  participant,
  user,
  setFriends,
  router,
  setSelectedService
}) => {
  const linkRef = `/chat/${participant.user_id.replace('user_', '')}`
  if (user?.id === participant.user_id) {
    return
  } else {
    setFriends(prev => {
      const user = prev.find(user => user.user_id === participant.user_id)
      if (user) return prev
      return [...prev, participant]
    })
    router.push(linkRef)
    setSelectedService('/chat')
  }
}
