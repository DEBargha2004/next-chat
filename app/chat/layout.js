"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Searchbar from "@/components/Searchbar";
import FriendList from "@/components/FriendList";
import Userbox from "@/components/Userbox";
import { serviceList } from "@/constants/serviceList";
import { useUser } from "@clerk/nextjs";
import { useContext, useEffect } from "react";
import { Appstate } from "@/hooks/context";
import { handleSearchUser } from "@/functions/handleSearchUser";

export default function RootLayout({ children }) {
  const { setSearchedFriend, searchQuery, setSearchQuery } =
    useContext(Appstate);

  const groupElement = serviceList.find(
    (service) => service.service === "groups"
  );
  const { user } = useUser();

  useEffect(() => {
    if (!searchQuery) {
      setSearchedFriend && setSearchedFriend([]);
    }
  }, [searchQuery]);

  return (
    <>
      <Sidebar className={`w-[30%] border-r-[1px] border-slate-400`}>
        <Topbar linkedElement={groupElement} />
        <Searchbar
          onChange={(e) => {
            handleSearchUser({
              e,
              user_id: user?.id,
              setQuery: setSearchQuery,
            }).then((result) => {
              setSearchedFriend(result);
            });
          }}
          value={searchQuery}
          placeholder={`Search for a friend`}
        />
        <FriendList UserboxComponent={Userbox} />
      </Sidebar>
      <div className="w-[70%] h-full">{children}</div>
    </>
  );
}
