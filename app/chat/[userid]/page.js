"use client";

import ChatBoxHeader from "@/components/ChatBoxHeader";
import ChatInput from "@/components/ChatInput";
import MessagesList from "@/components/MessagesList";
import RightSidebar from "@/components/RightSidebar";
import RightSidebarCompWrapper from "@/components/RightSidebarCompWrapper";
import { selectUser } from "@/functions/selectUser";
import { Appstate } from "@/hooks/context";
import { useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Avatar from "@/components/Avatar";
import { useUser } from "@clerk/nextjs";
import { firestoreDB } from "@/firebase.config";
import { getDoc, doc } from "firebase/firestore";

export default function Page({ params }) {
  const {
    friends,
    selectedChatUser,
    setSelectedChatUser,
    messages,
    conversationsInfo,
  } = useContext(Appstate);

  const full_userid = `user_${params.userid}`;
  const { user, isLoaded } = useUser();
  const [isEligible, setIsEligible] = useState(false);

  const [showChatPage, setShowChatPage] = useState(true);
  const [rightSidebar, setRightSidebar] = useState(false);

  useEffect(() => {
    if (selectedChatUser.user_id !== full_userid) {
      const user_tobe_selected = friends.find(
        (friend) => friend.user_id === full_userid
      );
      if (user_tobe_selected) {
        selectUser({ setSelectedChatUser, item: user_tobe_selected });
        setShowChatPage(true);
      } else {
        setShowChatPage(false);
      }
    }
  }, [friends]);

  useEffect(() => {
    if (!isLoaded) return;
    selectedChatUser?.conversation_id &&
      getDoc(
        doc(
          firestoreDB,
          `conversations/${selectedChatUser?.conversation_id}/participants/${user?.id}`
        )
      ).then((data) => {
        const isParticipant = data.get("isParticipant");
        setIsEligible(isParticipant);
      });
  }, [
    conversationsInfo[selectedChatUser?.conversation_id],
    user,
    isLoaded,
    selectedChatUser,
  ]);

  return (
    <div className="w-full h-full">
      {showChatPage ? (
        <div className="w-full h-full flex justify-between items-center overflow-hidden">
          <div
            className={`h-full transition-all duration-500 shrink-0`}
            style={{ width: rightSidebar ? `60%` : `100%` }}
          >
            <ChatBoxHeader
              type={`one-one`}
              onClick={() => setRightSidebar((prev) => !prev)}
            />
            <MessagesList database={friends} />
            {isEligible ? (
              <ChatInput />
            ) : (
              <div className="h-[64px] flex justify-center items-center bg-orange-200">
                You can no longer send messages
              </div>
            )}
          </div>
          <RightSidebar>
            <RightSidebarCompWrapper>
              <div className="flex flex-col items-center justify-center">
                <Avatar
                  url={selectedChatUser?.user_img}
                  className={`w-20 h-20`}
                />
                <h1 className="text-xl font-medium mt-2">
                  {selectedChatUser?.user_name}
                </h1>
                <p className="text-xs text-slate-600">
                  {selectedChatUser?.user_email}
                </p>
              </div>
            </RightSidebarCompWrapper>
            {/* <RightSidebarCompWrapper>
              <div className='flex flex-col items-start justify-between'>
                <p className='text-slate-800 text-lg font-semibold'>There is no place to hide</p>
                <p className='text-slate-600 text-xs'>9 July</p>
              </div>
            </RightSidebarCompWrapper> */}
          </RightSidebar>
        </div>
      ) : (
        <div className="w-full h-full flex justify-center items-center text-3xl text-red-500 font-bold">
          {/* User doesnot exist */}
        </div>
      )}
    </div>
  );
}
