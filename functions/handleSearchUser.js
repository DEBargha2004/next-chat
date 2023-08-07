export const handleSearchUser = async ({ e, user_id, setQuery }) => {
  setQuery(e.target.value);
  if (!e.target.value) {
    return [];
  }
  console.log(e.target.value, "bypassed");
  let searchList = await fetch(
    `/api/searchUser?userId=${user_id}&query=${e.target.value}`,
    {
      method: "GET",
    }
  );
  console.log('fetched');
  searchList = await searchList.json();
  console.log(searchList);

  return searchList;
};
