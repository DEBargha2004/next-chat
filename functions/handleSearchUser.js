export const handleSearchUser = async ({ e, user_id, setQuery, excluded }) => {
  setQuery(e.target.value)
  if (!e.target.value) {
    return { data: [] }
  }
  console.log(e.target.value, 'bypassed')
  let searchList = await fetch(
    `/api/searchUser?userId=${user_id}&query=${e.target.value}`,
    {
      method: 'POST',
      body: JSON.stringify({
        excluded: excluded?.map(user => ({ user_id: user.user_id }))
      })
    }
  )

  searchList = await searchList.json()
  console.log(searchList)

  return searchList
}
