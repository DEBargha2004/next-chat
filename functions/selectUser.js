export const selectUser = ({ setSelectedChatUser, item }) => {
  // console.log(item);
  setSelectedChatUser(prev => {
    return {
      ...prev,
      user_name: item.user_name,
      user_img: item.user_img,
      user_id: item.user_id,
      user_email: item.user_email,
      conversation_id: item.conversation_id
    }
  })
}
