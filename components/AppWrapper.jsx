"use client";

import { Appstate } from "@/hooks/context";
import { useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { firestoreDB, realtimeDB } from "../firebase.config";
import Sidenav from "@/components/Sidenav";
import { serviceList } from "@/constants/serviceList";
import { collection, query, onSnapshot } from "firebase/firestore";

import { updateFriendsAndStatus } from "@/functions/updateFriendsAndStatus";
import { setUpSubCollectionListener } from "@/functions/subCollectionListener";

import { ref, onDisconnect, goOffline, goOnline } from "firebase/database";

import { handleVisibileStatus } from "@/functions/handleVisibleStatus";
import { includeUser } from "@/functions/includeUser";
import { useRouter } from "next/navigation";

export default function AppWrapper({ children }) {
  const { isSignedIn, user, isLoaded } = useUser();

  const {
    setFriends,
    setPresenceInfo,
    setMessages,
    setConversationsInfo,
    conversationsInfo,
    setSelectedService,
    setGroups
  } = useContext(Appstate);

  const [connection, setConnection] = useState(false);

  useEffect(() => {
    setFriends([]);
    setGroups([])
    updateFriendsAndStatus({
      conversationsInfo,
      setFriends,
      setPresenceInfo,
      user,
      setGroups
    });
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

    setFriends([]);
    setGroups([])
    const unsub_subcollection_list = [];
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
          setGroups
        });
        unsub_subcollection_list.push(unsub_subcollection);
      }
      setConversationsInfo(conversations_info_list);
    });

    return () => {
      // unsub()
      unSubMessages();
      unsub_subcollection_list.forEach((unsub) => unsub());
    };
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
    serviceList.forEach((service) => {
      if (pathArray.includes(service.service)) {
        setSelectedService(service.to);
      }
    });
  }, []);

  return (
    <div className="h-full">
      <div className="flex h-full">
        <Sidenav className={`h-full w-[80px]`} />
        {children}
      </div>
    </div>
  );
}
