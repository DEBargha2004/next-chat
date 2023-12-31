"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Appstate } from "@/hooks/context";
import ChatBoxHeader from "@/components/ChatBoxHeader";
import MessagesList from "@/components/MessagesList";
import ChatInput from "@/components/ChatInput";
import RightSidebar from "@/components/RightSidebar";
import AdminBadge from "@/components/Badges/AdminBadge";
import OwnerBadge from "@/components/Badges/OwnerBadge";
import RightSidebarCompWrapper from "@/components/RightSidebarCompWrapper";
import Avatar from "@/components/Avatar";
import format from "date-fns/format";
import Userbox from "@/components/Userbox";
import { handleSelectUser_For_Conversation } from "@/functions/handleSelectUser_For_Conversation";
import { leaveGroup } from "@/functions/leaveGroup";
import { useUser } from "@clerk/nextjs";
import Searchbar from "@/components/Searchbar";
import { handleSearchUser } from "@/functions/handleSearchUser";
import { cloneDeep } from "lodash";
import Image from "next/image";
import tick from "../../../public/tick.png";
import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firestoreDB } from "@/firebase.config";
import { useRouter } from "next/navigation";
import { updatePresenceStatus } from "@/functions/updatePresenceStatus";

function Page({ params }) {
  const {
    groups,
    messages,
    setSelectedGroup,
    selectedGroup,
    setSelectedService,
    setFriends,
    setPresenceInfo,
    conversationsInfo,
  } = useContext(Appstate);

  const router = useRouter();

  const full_id = `group_${params.groupid}`;
  const [showChatPage, setShowChatPage] = useState(true);
  const [rightSidebar, setRightSidebar] = useState(false);
  const [friendQuery, setFriendQuery] = useState("");
  const [selectedUsersId, setSelectedUsersId] = useState([]);
  const [searchedFriend, setSearchedFriend] = useState([]);
  const [noResponse, setNoResponse] = useState(false);
  const [isEligible, setIsEligible] = useState(false);

  const { user, isLoaded } = useUser();
  const addFriendDialogBoxRef = useRef(null);

  const handleSelectedUsers = (userId) => {
    if (!selectedUsersId.includes(userId)) {
      setSelectedUsersId((prev) => [...prev, userId]);
    } else {
      const index = selectedUsersId.indexOf(userId);
      setSelectedUsersId((prev) => {
        prev = cloneDeep(prev);
        prev.splice(index, 1);
        return [...prev];
      });
    }
  };

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

  const openAddFriendDialog = () => {
    addFriendDialogBoxRef.current.showModal();
  };

  const closeAddFriendDialog = () => {
    if (noResponse) return;
    addFriendDialogBoxRef.current.close();
    setFriendQuery("");
    setSearchedFriend([]);
    setSelectedUsersId([]);
  };

  const addSelectedFriends = async () => {
    if (!selectedUsersId.length) return;
    if (noResponse) return;
    setNoResponse(true);
    const docInfo = await getDoc(
      doc(firestoreDB, `groups/${selectedGroup?.id}`)
    );
    const adminInfo = docInfo.get("admin");
    if (!adminInfo.includes(user?.id)) {
      alert("You are no longer an admin");
      return;
    } else {
      const conversation_info = {
        conversation_id: selectedGroup?.conversation_id,
        createdAt: selectedGroup?.createdAt,
        type: "group",
        joinedAt: serverTimestamp(),
        isParticipant: true,
      };
      for (const id of selectedUsersId) {
        await setDoc(
          doc(
            firestoreDB,
            `users/${id}/conversations/${selectedGroup?.conversation_id}`
          ),
          conversation_info
        );

        const userInfo = searchedFriend.find((friend) => friend.user_id === id);
        await setDoc(
          doc(firestoreDB, `groups/${selectedGroup?.id}/participants/${id}`),
          {
            ...userInfo,
            joinedAt: serverTimestamp(),
            isParticipant: true,
          }
        );
        await updateDoc(doc(firestoreDB, `groups/${selectedGroup?.id}`), {
          participantsCount: increment(1),
        });

        await setDoc(
          doc(
            firestoreDB,
            `conversations/${selectedGroup?.conversation_id}/participants/${id}`
          ),
          {
            conversation_id: selectedGroup?.conversation_id,
            type: "group",
            joinedAt: serverTimestamp(),
            isParticipant: true,
          }
        );
      }
    }

    addFriendDialogBoxRef.current.close();
    setNoResponse(false);
    location.reload();
  };

  const showInfo = (id) => {
    if (!selectedGroup?.admin?.includes(user?.id)) return false;
    if (user?.id === selectedGroup?.owner?.user_id) {
      if (id === user?.id) return false;
      return true;
    } else {
      if (selectedGroup?.admin?.includes(id)) return false;
      return true;
    }
  };
  const Overlay = () => {
    return (
      <div className="w-full h-full absolute top-0 left-0 -z-10 bg-green-300">
        <Image
          src={tick.src}
          width={28}
          height={28}
          className="w-7 z-10 absolute right-4 top-[50%] -translate-y-[50%]"
          alt="tick"
        />
      </div>
    );
  };

  useEffect(() => {
    selectedGroup?.participants?.map((participant) => {
      updatePresenceStatus({ setPresenceInfo, id: participant.user_id });
    });
  }, [selectedGroup]);

  useEffect(() => {
    if (!isLoaded) return;
    selectedGroup.conversation_id &&
      getDoc(
        doc(
          firestoreDB,
          `conversations/${selectedGroup.conversation_id}/participants/${user?.id}`
        )
      ).then((data) => {
        const isParticipant = data.get("isParticipant");
        setIsEligible(isParticipant);
      });
  }, [conversationsInfo[selectedGroup?.conversation_id], user, isLoaded,selectedGroup]);

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
            {isEligible ? (
              <ChatInput type="group" width={rightSidebar ? `80%` : ``} />
            ) : (
              <div
                className="h-[64px] flex justify-center items-center  bg-orange-200 text-black"
                // width={rightSidebar ? `80%` : ``}
              >
                You are no longer a participant
              </div>
            )}
          </div>
          <RightSidebar open={rightSidebar} type="group">
            <RightSidebarCompWrapper>
              <div className="w-full flex flex-col items-center justify-between">
                <Avatar
                  address={selectedGroup?.img}
                  className={`w-[80px] h-[80px]`}
                />
                <p className="text-xl font-semibold mt-2">
                  {selectedGroup?.name}
                </p>
                <p className="text-slate-500 text-xs">
                  Group &#x2022; {selectedGroup?.participantsCount} participants
                </p>
              </div>
            </RightSidebarCompWrapper>
            <RightSidebarCompWrapper>
              <div className="flex flex-col items-start justify-between">
                <p className="text- mb-2">{selectedGroup?.description}</p>
                <p className="text-xs text-slate-500 font-medium">
                  Created by {selectedGroup?.owner?.user_name},{` `}
                  {format(
                    selectedGroup?.createdAt?.seconds * 1000 || 0,
                    "dd/MM/yy"
                  )}
                </p>
              </div>
            </RightSidebarCompWrapper>
            {selectedGroup?.admin?.includes(user?.id) ? (
              <RightSidebarCompWrapper>
                <button
                  className="px-2 py-1 rounded bg-blue-600 text-white"
                  onClick={openAddFriendDialog}
                >
                  Add participant
                </button>
              </RightSidebarCompWrapper>
            ) : null}
            <RightSidebarCompWrapper disablePadding>
              <div>
                <div className="flex justify-between items-center text-md text-slate-500 p-3">
                  {selectedGroup?.participantsCount} participants
                </div>
                <div className="pb-4">
                  {selectedGroup?.participants?.map((participant) => {
                    const linkRef = participant.user_id.replace("user_", "");
                    return participant.isParticipant ? (
                      <Userbox
                        key={participant.user_id}
                        item={participant}
                        id={participant.user_id}
                        onClick={(e) => {
                          participant.user_id === user?.id
                            ? null
                            : handleSelectUser_For_Conversation({
                                participant,
                                router,
                                setFriends,
                                setSelectedService,
                                user,
                              });
                        }}
                        badges={{
                          owner:
                            selectedGroup?.owner?.user_id ===
                            participant.user_id
                              ? OwnerBadge()
                              : null,
                          admin: selectedGroup?.admin?.includes(
                            participant.user_id
                          )
                            ? AdminBadge()
                            : null,
                        }}
                        disableHoverEffect={
                          participant.user_id === user?.id ? true : false
                        }
                        enableMoreInfo={showInfo(participant.user_id)}
                      />
                    ) : null;
                  })}
                </div>
              </div>
            </RightSidebarCompWrapper>
            <RightSidebarCompWrapper>
              <div className="flex justify-center">
                <button
                  className="bg-red-500 text-white w-[70%] transition-all py-1 rounded uppercase hover:bg-red-700 "
                  onClick={() => {
                    const finalDecision = prompt("Type CONFIRM to exit");
                    if (finalDecision !== `CONFIRM`) return;

                    leaveGroup({
                      id: user?.id,
                      selectedGroup,
                      router,
                      redirect: true,
                    });
                  }}
                >
                  Leave
                </button>
              </div>
            </RightSidebarCompWrapper>
          </RightSidebar>
        </div>
      ) : (
        <div className="w-full h-full flex justify-center items-center text-3xl text-red-500 font-bold">
          {/* User doesnot exist */}
        </div>
      )}

      <dialog ref={addFriendDialogBoxRef}>
        <Searchbar
          placeholder={`Search more`}
          value={friendQuery}
          onChange={(e) =>
            handleSearchUser({
              e,
              user_id: user?.id,
              excluded: selectedGroup?.participants.filter(
                (participant) => participant.isParticipant
              ),
              setQuery: setFriendQuery,
            }).then((result) => {
              setSearchedFriend(result.data);
            })
          }
        />
        {searchedFriend.map((user) => (
          <Userbox
            key={user.user_id}
            item={user}
            onClick={() => handleSelectedUsers(user.user_id)}
            selected={selectedUsersId.includes(user.user_id)}
            OverlayComponent={Overlay}
          />
        ))}
        <button
          className={`bg-blue-600 text-white px-2 py-1 rounded
          ${
            noResponse || !selectedUsersId.length
              ? `grayscale cursor-not-allowed`
              : ``
          }`}
          onClick={addSelectedFriends}
        >
          Add
        </button>
        <button
          className={`bg-red-500 text-white px-2 py-1 rounded ${
            noResponse ? `grayscale cursor-not-allowed` : ``
          }`}
          onClick={closeAddFriendDialog}
        >
          Cancel
        </button>
      </dialog>
    </>
  );
}

export default Page;
