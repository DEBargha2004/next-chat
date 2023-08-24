import {
  arrayRemove,
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { firestoreDB } from "@/firebase.config";

export const leaveGroup = async ({ id, selectedGroup, router, redirect }) => {
  if (!id) return;

  const isOwner = Boolean(selectedGroup?.owner?.user_id === id);
  const isAdmin = selectedGroup?.admin.includes(id);
  const isParticipant = selectedGroup?.participants?.find(
    (participant) => participant.user_id === id
  );

  // console.log(isParticipant)

  isParticipant &&
    (await updateDoc(
      doc(firestoreDB, `groups/${selectedGroup?.id}/participants/${id}`),
      {
        isParticipant: false,
        leftAt: serverTimestamp(),
      }
    ));

  isParticipant &&
    (await updateDoc(doc(firestoreDB, `groups/${selectedGroup?.id}`), {
      participantsCount: increment(-1),
    }));

  isParticipant &&
    (await updateDoc(
      doc(
        firestoreDB,
        `conversations/${selectedGroup?.conversation_id}/participants/${id}`
      ),
      {
        isParticipant: false,
        leftAt: serverTimestamp(),
      }
    ));

  isOwner &&
    (await updateDoc(doc(firestoreDB, `groups/${selectedGroup?.id}`), {
      owner: {},
    }));
  isAdmin &&
    (await updateDoc(doc(firestoreDB, `groups/${selectedGroup?.id}`), {
      admin: arrayRemove(id),
    }));
  await updateDoc(
    doc(
      firestoreDB,
      `users/${id}/conversations/${selectedGroup?.conversation_id}`
    ),
    {
      isParticipant: false,
      leftAt: serverTimestamp(),
    }
  );

  redirect && router.replace(`/groups`);
  !redirect && location.reload();
};
