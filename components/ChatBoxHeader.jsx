import { useContext, useMemo } from "react";
import { Appstate } from "@/hooks/context";
import Avatar from "./Avatar";
import { generateTimeStamp } from "../functions/generateTime";

function ChatBoxHeader({ address, name, participants, type, onClick }) {
  const { selectedChatUser, presenceInfo, selectedGroup } =
    useContext(Appstate);

  const user_presence_info = useMemo(() => {
    const current_user = presenceInfo.find(
      (user_presence_status) =>
        user_presence_status?.user_id === selectedChatUser.user_id
    );
    return {
      last_Seen: generateTimeStamp(current_user?.last_seen || 0),
      online: current_user?.online,
    };
  }, [selectedChatUser, presenceInfo]);
  const ifId_exist = useMemo(() => {
    if (type === "group") {
      return selectedGroup?.id;
    } else if (type === "one-one") {
      return selectedChatUser.user_id;
    }
  }, [selectedChatUser,selectedGroup]);


  return ifId_exist ? (
    <div className="w-full flex justify-between px-4 py-2 shadow-md shadow-[#00000017] truncate">
      <div className="flex justify-between">
        <Avatar url={selectedChatUser?.user_img} address={address} />
        <div
          className="h-full flex flex-col items-start justify-center ml-4 cursor-pointer"
          onClick={onClick}
        >
          <p>{name || selectedChatUser?.user_name}</p>
          <p className={`text-slate-500 text-sm`}>
            {user_presence_info.online
              ? user_presence_info.online === "away"
                ? "😴"
                : "online"
              : user_presence_info?.last_Seen}
          </p>
          <p>
            {type === "group" ? (
              <div className="flex items-center">
                {participants?.map((participant) => (
                  <p
                    key={participant.user_id}
                    className="text-xs w-[60px] truncate text-slate-600"
                  >
                    {participant.user_name}
                    {}
                  </p>
                ))}
              </div>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  ) : null;
}

export default ChatBoxHeader;
