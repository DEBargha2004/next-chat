import { getImage } from "@/functions/getImage";
import { Appstate } from "@/hooks/context";
import { useContext, useEffect, useMemo, useState } from "react";
import Avatar from "./Avatar";
import RightSidebarCompWrapper from "./RightSidebarCompWrapper";
import { format } from "date-fns";
import Userbox from "./Userbox";

function RightSidebar({ open }) {
  const { selectedGroup } = useContext(Appstate);
  const [groupImgUrl, setGroupImgUrl] = useState("");

  const ownerBadge = () => {
    return (
      <img
        src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
        className="h-4"
      />
    );
  };

  const adminBadge = () => {
    return (
      <span className="text-green-700 bg-green-200 px-2 py-1 rounded text-xs">
        Group Admin
      </span>
    );
  };

  return (
    <div
      className={`h-full overflow-y-scroll transition-all duration-500 bg-white`}
      style={{ width: open ? `35%` : `0` }}
    >
      <RightSidebarCompWrapper>
        <div className="w-full flex flex-col items-center justify-between">
          <Avatar
            address={selectedGroup?.img}
            className={`w-[80px] h-[80px]`}
          />
          <p className="text-3xl font-semibold my-2 mx-5 text-center">
            {selectedGroup?.name}
          </p>
          <p className="text-slate-500">
            Group &#x2022; {selectedGroup?.participantsCount} participants
          </p>
        </div>
      </RightSidebarCompWrapper>
      <RightSidebarCompWrapper>
        <div className="flex flex-col items-start justify-between">
          <p className="text-lg mb-2">{selectedGroup?.description}</p>
          <p className="text-sm text-slate-500 font-medium">
            Created by {selectedGroup?.owner.user_name},{` `}
            {format(selectedGroup?.createdAt.seconds || 0, "dd/MM/yy")}
          </p>
        </div>
      </RightSidebarCompWrapper>
      <RightSidebarCompWrapper disablePadding>
        <div>
          <div className="flex justify-between items-center text-md text-slate-500 p-3">
            {selectedGroup?.participantsCount} participants
          </div>
          <div className="pb-4">
            {selectedGroup?.participants.map((participant) => (
              <Userbox
                key={participant.user_id}
                item={participant}
                badges={{
                  owner:
                    selectedGroup.owner.user_id === participant.user_id
                      ? ownerBadge()
                      : null,
                  admin: selectedGroup.admin.includes(participant.user_id)
                    ? adminBadge()
                    : null,
                }}
              />
            ))}
          </div>
        </div>
      </RightSidebarCompWrapper>
    </div>
  );
}

export default RightSidebar;
