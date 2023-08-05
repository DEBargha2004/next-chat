export const handleSearchUser = async ({
  e,
  user_id,
  setSearchResult,
  setQuery
}) => {
  setQuery(e.target.value)
  if (!e.target.value) {
    return
  }
  let searchList = await fetch(
    `/api/searchUser?userId=${user_id}&query=${e.target.value}`,
    {
      method: 'GET'
    }
  )

  searchList = await searchList.json()

  setSearchResult(searchList)
}
