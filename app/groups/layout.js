"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { serviceList } from "@/constants/serviceList";
import { useContext, useEffect, useRef, useState } from "react";
import Searchbar from "@/components/Searchbar";
import { handleSearchUser } from "@/functions/handleSearchUser";
import { useUser } from "@clerk/nextjs";
import Userbox from "@/components/Userbox";
import { cloneDeep } from "lodash";
import tick from "../../public/tick.png";
import Avatar from "@/components/Avatar";
import { v4 } from "uuid";
import { uploadImage } from "@/functions/uploadImage";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { firestoreDB } from "@/firebase.config";
import { Appstate } from "@/hooks/context";
import Link from "next/link";
import Image from "next/image";
import { updateGroups } from "@/functions/updateGroups";
import { useRouter } from "next/navigation";

const GroupInfo = ({ groupInfo, setGroupInfo, list }) => {
  const handleGroupImage = (e) => {
    setGroupInfo((prev) => ({ ...prev, groupImageFile: e.target.files[0] }));
    const reader = new FileReader();

    reader.onload = () => {
      setGroupInfo((prev) => ({ ...prev, groupImageUrl: reader.result }));
    };
    reader.readAsDataURL(e.target.files[0]);
  };
  return (
    <div className="flex flex-col items-start justify-between">
      <input
        type="text"
        onChange={(e) =>
          setGroupInfo((prev) => ({
            ...prev,
            groupName: e.target.value,
          }))
        }
        value={groupInfo.groupName}
      />
      <ParticipantsList list={list} />
      <input type="file" onChange={handleGroupImage} />
      <Avatar url={groupInfo.groupImageUrl} group />
      <textarea
        onChange={(e) => {
          setGroupInfo((prev) => ({
            ...prev,
            groupDescription: e.target.value,
          }));
        }}
        value={groupInfo.groupDescription}
        className="w-[250px] h-[150px]"
      />
    </div>
  );
};

const ParticipantsList = ({ list, Component, componentStyle }) => {
  return (
    <div className={`flex shrink-0 mb-3 ${`overflow-x-auto`}`}>
      {list.map((user, index) => {
        return Component ? (
          <Component url={user.user_img} className={componentStyle} />
        ) : (
          <div className="w-11 mr-3" key={index}>
            <Image
              src={user.user_img}
              className="w-10 rounded-full"
              alt="user-image"
            />
            <h1 className="text-xs truncate">{user.user_name}</h1>
          </div>
        );
      })}
    </div>
  );
};

const SelectParticipants = ({ error, children, query, onChange, list }) => {
  return (
    <div className="w-[90%] mx-auto">
      <Searchbar placeholder={`Find Users`} value={query} onChange={onChange} />
      <ParticipantsList list={list} />
      <div className={`h-[300px] overflow-y-auto mb-4`}>{children}</div>
      <p className="my-2 text-sm text-red-500">{error}</p>
    </div>
  );
};

export default function RootLayout({ children }) {
  const chat = serviceList.find((service) => service.service === "chat");

  const {
    groups,
    setSelectedGroup,
    selectedGroup,
    conversationsInfo,
    setGroups,
    typingsInfo,
    lastGroupsConversations,
    unsub_subcollection_list,
  } = useContext(Appstate);
  const { user } = useUser();
  let isProcessing = false;
  const [processing, setProcessing] = useState(false);
  const router = useRouter()

  const [query, setQuery] = useState("");
  const [users_result, setUsers_result] = useState([]);
  const [dialogQuery, setDialogQuery] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [dialogState, setDialogState] = useState("select");
  const [{ groupNameError, selectParticipantsError }, setError] = useState({
    selectParticipantsError: "",
    groupNameError: "",
  });
  const [groupInfo, setGroupInfo] = useState({
    groupName: "",
    groupDescription: "",
    groupImageFile: "",
    groupImageUrl: "",
    imageAddress: "",
  });
  const [desc, setDesc] = useState("");

  const toggleModal = () => {
    const dialogBox = document.querySelector("#createGroup");
    if (dialogBox.open) {
      dialogBox.close();
    } else {
      dialogBox.showModal();
    }
  };

  const createGroup = async () => {
    const dialogBox = document.getElementById("createGroup");
    if (selectedParticipants.length < 2) {
      setError((prev) => ({
        ...prev,
        selectParticipantsError: "Select atleast 2 participants",
      }));
      return;
    }
    setError((prev) => ({ ...prev, selectParticipantsError: "" }));
    if (dialogState === "select") {
      setDialogState("create");
    } else {
      if (!groupInfo.groupName) {
        setError((prev) => ({
          ...prev,
          groupNameError: "Group should have a name",
        }));

        return;
      } else {
        if (isProcessing) return;

        isProcessing = true;
        setProcessing(true);

        const conversation_id = v4();
        const imageAddress = v4();
        groupInfo.groupImageFile &&
          (await uploadImage(groupInfo.groupImageFile, imageAddress));
        const owner = {
          user_id: user.id,
          user_name: user.fullName,
          user_img: user.imageUrl,
          user_email: user.primaryEmailAddress.emailAddress,
        };

        const participants = [...selectedParticipants, owner];

        // console.log(participants)

        const timeStamp = serverTimestamp();

        const groupInfo_firebase = {
          id: `group_${conversation_id}`,
          name: groupInfo.groupName,
          img: imageAddress,
          description: groupInfo.groupDescription,
          createdAt: timeStamp,
          owner: owner,
          participantsCount: participants.length,
          admin: [owner.user_id],
          conversation_id: conversation_id,
        };

        const conversation_info = {
          conversation_id: conversation_id,
          createdAt: timeStamp,
          type: "group",
        };

        await setDoc(
          //adding group_info
          doc(firestoreDB, `groups/group_${conversation_id}`),
          groupInfo_firebase
        );

        await Promise.all(
          //adding participants to group
          participants.map(async (participant) => {
            setDoc(
              doc(
                firestoreDB,
                `groups/group_${conversation_id}/participants/${participant.user_id}`
              ),
              {
                ...participant,
                joinedAt: serverTimestamp(),
                isParticipant: true,
              }
            );
          })
        );

        //setting conversation info in conversations
        await setDoc(
          doc(firestoreDB, `conversations/${conversation_id}`),
          conversation_info
        );

        await Promise.all(
          //adding participants in conversations
          participants.map(async (participant) => {
            const path = `conversations/${conversation_id}/participants/${participant.user_id}`;
            setDoc(doc(firestoreDB, path), {
              participant_id: participant.user_id,
              joinedAt: serverTimestamp(),
              isParticipant: true,
            });
          })
        );

        await Promise.all(
          //adding conversation_info in user->conversations
          participants.map(async (participant) => {
            await setDoc(
              doc(
                firestoreDB,
                `users/${participant.user_id}/conversations/${conversation_id}`
              ),
              {
                ...conversation_info,
                joinedAt: serverTimestamp(),
                isParticipant: true,
              }
            );
          })
        );

        isProcessing = false;
        setProcessing(false);
        setDialogState("select");
        setSelectedParticipants([]);
        setGroupInfo((prev) => ({
          ...prev,
          groupDescription: "",
          groupImageFile: "",
          groupImageUrl: "",
          groupName: "",
          imageAddress: "",
        }));
        dialogBox.close();
      }
    }
  };

  const handleSelect_Participants = (user) => {
    // console.log(user)
    // Do Something
    const checkUser = selectedParticipants.find(
      (selectedUser) => selectedUser.user_id === user.user_id
    );

    // console.log(checkUser)
    if (!checkUser) {
      setSelectedParticipants((prev) => [...prev, user]);
    } else {
      const index = selectedParticipants.findIndex(
        (selectedUser) => selectedUser.user_id === user.user_id
      );
      // console.log(index)
      setSelectedParticipants((prev) => {
        const prevClone = cloneDeep(prev);
        prevClone.splice(index, 1);

        return [...prevClone];
      });
    }
  };

  const handle_Dialog_Query_Change = (e) => {
    handleSearchUser({
      e,
      user_id: user?.id,
      setQuery: setDialogQuery,
    }).then((result) => {
      setUsers_result(result.data);
    });
  };

  const OverlayComponent = () => {
    return (
      <div className="w-full h-full absolute top-0 left-0 -z-10 bg-green-300">
        <Image
          width={28}
          height={28}
          src={tick.src}
          className="w-7 z-10 absolute right-4 top-[50%] -translate-y-[50%]"
          alt="tick"
        />
      </div>
    );
  };

  const GroupOverlayComponent = () => {
    return (
      <div className="-z-10 bg-slate-200 w-full h-full absolute left-0 top-0"></div>
    );
  };

  const getUserInfo = (id, participants) => {
    const info = participants?.find(
      (participant) => participant.user_id === id
    );
    return info;
  };

  useEffect(() => {
    // console.log(conversationsInfo);
    for (const conversation_info of conversationsInfo) {
      if (conversation_info.type === "group") {
        // const prev_conversation_info = lastGroupsConversations.current.find(
        //   (conversation) =>
        //     conversation.conversation_id === conversation_info.conversation_id
        // );
        // router.refresh()
        // location.reload()
        updateGroups({ conversation_info, setGroups, setSelectedGroup });
        // console.log("groups fetched");
        lastGroupsConversations.current.push({
          conversation_id: conversation_info.conversation_id,
          isParticipant: conversation_info.isParticipant,
        });
        // if (prev_conversation_info) {
        //   // console.log(prev_conversation_info,conversation_info);
        //   if (
        //     prev_conversation_info.isParticipant !==
        //     conversation_info.isParticipant
        //   ) {
        //     console.log(prev_conversation_info, conversation_info);
        //     const unsub = unsub_subcollection_list.find(
        //       (unsub_conversation) =>
        //         unsub_conversation.conversation_id ===
        //         conversation_info.conversation_id
        //     );

        //     updateGroups({ conversation_info, setGroups, setSelectedGroup });
        //     // console.log("groups fetched");
        //     lastGroupsConversations.current.push({
        //       conversation_id: conversation_info.conversation_id,
        //       isParticipant: conversation_info.isParticipant,
        //     });
        //   }
        // } else {
        //   updateGroups({ conversation_info, setGroups, setSelectedGroup });
        //   lastGroupsConversations.current.push({
        //     conversation_id: conversation_info.conversation_id,
        //     isParticipant: conversation_info.isParticipant,
        //   });
        // }
      }
    }
  }, [conversationsInfo]);

  return (
    <>
      <Sidebar className={`w-[30%] border-r-[1px] border-slate-400`}>
        <Topbar linkedElement={chat} />
        <div
          className="w-[90%] mx-auto mb-5 p-1 bg-slate-200 rounded mt-3 cursor-pointer hover:bg-slate-300"
          onClick={toggleModal}
        >
          Create New Group
        </div>
        <div>
          {groups.map((group) => {
            return (
              <Link
                key={group.id}
                href={`/groups/${group.id.replace("group_", "")}`}
              >
                <Userbox
                  address={group.img}
                  item={group}
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  selected={selectedGroup?.id === group.id}
                  OverlayComponent={GroupOverlayComponent}
                  include={{ lastMessage: true, lastMessageTime: true }}
                  id={group.id}
                  essential={
                    typingsInfo[group?.conversation_id]?.typer
                      ? typingsInfo[group?.conversation_id]?.typer !== user?.id
                        ? `${
                            getUserInfo(
                              typingsInfo[group?.conversation_id].typer,
                              group.participants
                            )?.user_name ||
                            getUserInfo(
                              typingsInfo[group?.conversation_id].typer,
                              group.participants
                            )?.user_email
                          } is typing...`
                        : ``
                      : ``
                  }
                />
              </Link>
            );
          })}
        </div>
      </Sidebar>
      <div className="w-[70%] h-full">{children}</div>
      <dialog
        id="createGroup"
        className="p-5 transition-all w-[40%] rounded-xl shadow-2xl"
      >
        {dialogState === "select" ? (
          <SelectParticipants
            query={dialogQuery}
            onChange={handle_Dialog_Query_Change}
            error={selectParticipantsError}
            list={selectedParticipants}
          >
            {users_result?.map((user, index) => {
              const isSelected = selectedParticipants.find(
                (selectedUser) => selectedUser.user_id === user.user_id
              );
              return (
                <Userbox
                  item={user}
                  key={index}
                  onClick={() => handleSelect_Participants(user)}
                  disableHoverEffect={isSelected}
                  selected={isSelected}
                  OverlayComponent={OverlayComponent}
                />
              );
            })}
          </SelectParticipants>
        ) : (
          <GroupInfo
            {...{ groupInfo, setGroupInfo, list: selectedParticipants }}
          />
        )}
        <div className="w-[80%] mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              dialogState === "select"
                ? (() => {
                    if (processing) return;
                    toggleModal();
                    setDialogQuery("");
                  })()
                : (() => {
                    if (processing) return;
                    setDialogState("select");
                  })();
            }}
            className={`px-4 py-2 bg-red-500 w-[45%] text-white rounded-lg ${
              processing ? `grayscale cursor-not-allowed` : ``
            }`}
          >
            {dialogState === "select" ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={createGroup}
            className={`px-4 py-2 w-[45%] bg-green-500 ${
              dialogState === "select"
                ? selectedParticipants.length < 2
                  ? "grayscale cursor-not-allowed"
                  : ``
                : !groupInfo.groupName
                ? `grayscale cursor-not-allowed`
                : ``
            } text-white rounded-lg ${
              processing ? `grayscale cursor-not-allowed` : ``
            }`}
          >
            {dialogState === "select" ? "Select" : "Create"}
          </button>
        </div>
      </dialog>
    </>
  );
}
