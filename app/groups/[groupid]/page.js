"use client";

import { useContext, useEffect, useState } from "react";
import { Appstate } from "@/hooks/context";
import ChatBoxHeader from "@/components/ChatBoxHeader";
import MessagesList from "@/components/MessagesList";
import ChatInput from "@/components/ChatInput";

function page({ params }) {
  const {
    groups,
    selectedChatUser,
    setSelectedChatUser,
    messages,
    setSelectedGroup,
    selectedGroup,
  } = useContext(Appstate);
  const full_id = `group_${params.groupid}`;
  const [showChatPage, setShowChatPage] = useState(true);

  useEffect(() => {
    if (selectedGroup?.id !== full_id) {
      const group_tobe_selected = groups.find((group) => group.id === full_id);
      if (group_tobe_selected) {
        setSelectedGroup(group_tobe_selected);
        setShowChatPage(true);
      } else {
        setShowChatPage(false);
      }
    }
  }, [groups]);

  return (
    <div className="w-full h-full">
      {showChatPage ? (
        <>
          <ChatBoxHeader
            address={selectedGroup?.img}
            name={selectedGroup?.name}
            participants={selectedGroup?.participants}
            type='group'
          />
          <MessagesList list={messages[selectedGroup?.id]}/>
          <ChatInput type='group' />
        </>
      ) : (
        <div className="w-full h-full flex justify-center items-center text-3xl text-red-500 font-bold">
          {/* User doesnot exist */}
        </div>
      )}
    </div>
  );
}

export default page;
