export const selectUser = ({ setSelectedChatUser, item }) => {
  // console.log(item);
  setSelectedChatUser(prev => {
    return {
      ...prev,
      user_name: item.user_name,
      user_img: item.user_img,
      user_id: item.user_id
    }
  })
}
