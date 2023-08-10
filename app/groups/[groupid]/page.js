"use client";

import { useContext, useEffect, useState } from "react";
import { Appstate } from "@/hooks/context";
import ChatBoxHeader from "@/components/ChatBoxHeader";
import MessagesList from "@/components/MessagesList";
import ChatInput from "@/components/ChatInput";
import { motion } from "framer-motion";
import RightSidebar from "@/components/RightSidebar";

function Page({ params }) {
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
  const [rightSidebar, setRightSidebar] = useState(false);

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
    <>
      {showChatPage ? (
        <div className="w-full h-full flex justify-between items-center overflow-hidden">
          <div
            className={`h-full  transition-all duration-500 shrink-0`}
            style={{ width: rightSidebar ? `60%` : `100%` }}
          >
            <ChatBoxHeader
              address={selectedGroup?.img}
              name={selectedGroup?.name}
              participants={selectedGroup?.participants}
              type="group"
              onClick={() => setRightSidebar((prev) => !prev)}
            />
            <MessagesList
              list={messages[selectedGroup?.id]}
              database={selectedGroup?.participants}
            />
            <ChatInput type="group" width={rightSidebar ? `80%` : ``} />
          </div>
          <RightSidebar open={rightSidebar} type="group" />
        </div>
      ) : (
        <div className="w-full h-full flex justify-center items-center text-3xl text-red-500 font-bold">
          {/* User doesnot exist */}
        </div>
      )}
    </>
  );
}

export default Page;
