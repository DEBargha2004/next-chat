"use client";

import { Appstate } from "@/hooks/context";
import { useContext, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { firestoreDB, realtimeDB } from "../firebase.config";
import Sidenav from "@/components/Sidenav";
import { serviceList } from "@/constants/serviceList";
import {
  collection,
  query,
  onSnapshot,
  getDocs,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

import { updateFriends } from "@/functions/updateFriends";
import { setUpSubCollectionListener } from "@/functions/subCollectionListener";

import { ref, onDisconnect, goOffline, goOnline } from "firebase/database";

import { handleVisibileStatus } from "@/functions/handleVisibleStatus";
import { includeUser } from "@/functions/includeUser";
import { isBoolean } from "lodash";

export default function AppWrapper({ children }) {
  const { isSignedIn, user, isLoaded } = useUser();

  const {
    setFriends,
    setPresenceInfo,
    setMessages,
    setConversationsInfo,
    conversationsInfo,
    setSelectedService,
    setGroups,
    setCloseFriends,
    unsub_subcollection_list,
  } = useContext(Appstate);

  const [connection, setConnection] = useState(false);

  const getFriends = async () => {
    const docs = await getDocs(
      collection(firestoreDB, `users/${user?.id}/friends`)
    );
    const requiredIds = [];
    docs.docs.forEach((doc) => {
      const seekerId = doc.get("seekerId");
      const acceptorId = doc.get("acceptorId");
      const friendId = seekerId === user?.id ? acceptorId : seekerId;
      requiredIds.push(friendId);
    });
    requiredIds.push(user?.id);
    return requiredIds;
  };

  useEffect(() => {
    setFriends([]);

    for (const conversation_info of conversationsInfo) {
      if (conversation_info.type === "group") {
        continue;
      }
      updateFriends({
        conversation_info,
        setFriends,
        setPresenceInfo,
        user,
      });
    }
  }, [conversationsInfo]);

  useEffect(() => {
    if (isSignedIn && isLoaded && connection) {
      includeUser({ user });
    }
  }, [isLoaded, isSignedIn, connection]);

  //setting connection
  useEffect(() => {
    if (!isSignedIn) {
      goOffline(realtimeDB);
      setConnection(false);
    } else {
      goOnline(realtimeDB);
      setConnection(true);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    // setting the listener for message change in each conversation document

    // setFriends([])
    // setGroups([])

    setPresenceInfo([]);

    const cquery = query(
      collection(firestoreDB, `users/${user.id}/conversations`)
    );

    const unSubMessages = onSnapshot(cquery, async (snapshots) => {
      const conversations_info_list = [];
      // console.log(snapshots.docs)
      for (const snapshot of snapshots.docs) {
        const conversation_info = snapshot.data();
        // if (conversation_info.type === "group") continue;
        conversations_info_list.push(conversation_info);

        const unsub_subcollection = await setUpSubCollectionListener({
          conversation_info,
          user,
          setMessages,
        });
        unsub_subcollection_list.push({
          conversation_id: conversation_info.conversation_id,
          unsub: unsub_subcollection,
        });
      }

      const conversation_ids = [];
      conversations_info_list?.forEach((conversation_Info) => {
        conversation_ids.push(conversation_Info.conversation_id);
      });

      setConversationsInfo(conversations_info_list);
      console.log("setting...");
    });

    getFriends().then((result) => {
      setCloseFriends(result);
    });
  }, [isLoaded]);

  // socket connection for managing presence status
  useEffect(() => {
    isLoaded &&
      onDisconnect(
        ref(realtimeDB, `users/${user?.id || localStorage.getItem(`user_id`)}`)
      ).update({
        online: false,
        last_seen: new Date().toString(),
      });

    isLoaded &&
      document.addEventListener("visibilitychange", () =>
        handleVisibileStatus(user)
      );

    return () => {
      document.removeEventListener("visibilitychange", () =>
        handleVisibileStatus(user)
      );
    };
  }, [isLoaded]);

  // changing service selected on path change
  useEffect(() => {
    const appPath = location.pathname;
    const pathArray = appPath.split("/");
    serviceList?.forEach((service) => {
      if (pathArray.includes(service.service)) {
        setSelectedService(service.to);
      }
    });
  }, []);

  return (
    <div className="h-full">
      <div className="flex h-full overflow-hidden">
        <Sidenav className={`h-full w-[80px]`} />
        {children}
      </div>
    </div>
  );
}
