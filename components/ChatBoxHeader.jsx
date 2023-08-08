import { useContext, useMemo } from "react";
import { Appstate } from "@/hooks/context";
import Avatar from "./Avatar";
import { generateTimeStamp } from "../functions/generateTime";

function ChatBoxHeader({ address, name, participants, type }) {
  const { selectedChatUser, presenceInfo, selectedGroup } =
    useContext(Appstate);

  const user_presence_info = useMemo(() => {
    const current_user = presenceInfo.find(
      (user_presence_status) =>
        user_presence_status?.user_id === selectedChatUser.current_User_Id
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
      return selectedChatUser.current_User_Id;
    }
  }, []);

  return ifId_exist ? (
    <div className="w-full flex justify-between px-4 py-2 shadow-md shadow-[#00000017]">
      <div className="flex justify-between">
        <Avatar url={selectedChatUser?.current_User_Image} address={address} />
        <div className="h-full flex flex-col items-start justify-center ml-4">
          <p>{name || selectedChatUser?.current_User_Name}</p>
          <p className={`text-slate-500 text-sm`}>
            {user_presence_info.online
              ? user_presence_info.online === "away"
                ? "😴"
                : "online"
              : user_presence_info?.last_Seen}
          </p>
        </div>
      </div>
    </div>
  ) : null;
}

export default ChatBoxHeader;
