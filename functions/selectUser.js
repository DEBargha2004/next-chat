export const selectUser = ({ setSelectedChatUser, item }) => {
  // console.log(item);
  setSelectedChatUser(prev => {
    return {
      ...prev,
      current_User_Name: item.user_name,
      current_User_Image: item.user_img,
      current_User_Id: item.user_id
    }
  })
}
