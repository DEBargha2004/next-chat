import { useState, useContext, useRef, useEffect, useMemo } from "react";
import { v4 } from "uuid";
import { Appstate } from "@/hooks/context";
import { useUser } from "@clerk/nextjs";
import { firestoreDB } from "../firebase.config";
import { setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { abortImage } from "@/functions/abortImage";
import { uploadImage } from "@/functions/uploadImage";
import Image from "next/image";
import generateUniqueId from "@/functions/generateUniqueid";
import EmojiPicker from "emoji-picker-react";
import { throttleText } from "@/functions/throttle";

function ChatInput({ type, width }) {
  const { user } = useUser();
  const {
    selectedChatUser,
    imageInfo,
    setImageInfo,
    refMessageInfo,
    referenceMessage,
    setReferenceMessage,
    selectedGroup,
    conversationsInfo,
  } = useContext(Appstate);

  const userInputRef = useRef(null);

  const [userInput, setUserInput] = useState("");
  const [emojiButtonStatus, setEmojiButtonStatus] = useState({
    clicked: false,
    hover: false,
  });

  const handleFileChange = (e) => {
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      setImageInfo({ url: fileReader.result, info: e.target.files[0] });
      e.target.value = null;
    };
    fileReader.readAsDataURL(e.target.files[0]);
    userInputRef.current.focus();
  };

  async function addConInfoInUser({ conversation_id }) {
    const users_con = (id) => `users/${id}/conversations/${conversation_id}`;
    const con = () => `conversations/${conversation_id}`;
    if (selectedChatUser.isGroup) {
      // Do Something
    } else {
      const sender_id = user.id;
      const receiver_id = selectedChatUser.user_id;

      const createdAt = serverTimestamp();

      const users_sender_con = await getDoc(
        doc(firestoreDB, users_con(sender_id))
      );
      const users_receiver_con = await getDoc(
        doc(firestoreDB, users_con(receiver_id))
      );
      const con_info = await getDoc(doc(firestoreDB, con()));

      if (!con_info.exists()) {
        await setDoc(doc(firestoreDB, con()), {
          conversation_id,
          createdAt,
          type: "one-one",
        });
        await setDoc(doc(firestoreDB, con(), `participants/${sender_id}`), {
          participant_id: sender_id,
        });
        await setDoc(doc(firestoreDB, con(), `participants/${receiver_id}`), {
          participant_id: receiver_id,
        });
      }

      if (!users_sender_con.exists()) {
        await setDoc(doc(firestoreDB, users_con(sender_id)), {
          conversation_id,
          createdAt,
          type: "one-one",
          participants: [sender_id, receiver_id],
        });
      }
      if (!users_receiver_con.exists()) {
        await setDoc(doc(firestoreDB, users_con(receiver_id)), {
          conversation_id,
          createdAt,
          type: "one-one",
          participants: [sender_id, receiver_id],
        });
      }
    }
  }

  const shareMessage = async ({ conversation_id, message }) => {
    const message_collection_path = `conversations/${conversation_id}/messages`;

    type !== "group" && (await addConInfoInUser({ conversation_id }));

    const messageId = v4();

    message = {
      ...message,
      messageId,
    };

    await setDoc(doc(firestoreDB, message_collection_path, messageId), message);

    setUserInput("");
    abortImage(setImageInfo);
    setReferenceMessage(null);
  };

  const handleMessageSubmit = async (e) => {
    const imageName = v4();
    e.preventDefault();

    if (!(imageInfo.url || userInput)) {
      return;
    }
    const userInfo = await getDoc(
      doc(
        firestoreDB,
        `conversations/${
          selectedGroup?.conversation_id || selectedChatUser?.conversation_id
        }/participants/${user?.id}`
      )
    );
    const isEligible = userInfo.get("isParticipant");

    if (!isEligible) return;

    const sender_id = user.id;
    const receiver_id = selectedChatUser.user_id || selectedGroup?.id;
    const message_data = {
      text: userInput,
      image: imageInfo.info ? imageName : null,
    };
    const conversation_id =
      type !== "group"
        ? generateUniqueId(sender_id, receiver_id)
        : selectedGroup.conversation_id;
    const message_type = {
      text: userInput ? true : false,
      image: imageInfo.info ? true : false,
    };
    const message_createdAt = serverTimestamp();
    const message_read = false;
    const message_readAt = null;
    const message_deliver = false;
    const message_deliveredAt = null;
    const refMessage = referenceMessage
      ? { ...refMessageInfo, marker_color: "", sender: "" }
      : null;

    const message = {
      conversation_id,
      sender_id,
      receiver_id,
      message_type,
      message_data,
      message_createdAt,
      message_read,
      message_readAt,
      message_deliver,
      message_deliveredAt,
      refMessage,
      delivered_to: [],
      read_by: [],
    };

    await uploadImage(imageInfo.info, imageName);
    (userInput || imageInfo.info) &&
      (await shareMessage({ conversation_id, message }));
  };

  const handleChangeInChatInput = async (e) => {
    setUserInput(e.target.value);
    throttleText(
      e.target.value,
      selectedChatUser?.conversation_id || selectedGroup?.conversation_id,
      user?.id
    );
  };

  useEffect(() => {
    const handleEmojisClose = (e) => {
      // console.log(e.target);
      if (!emoji_parent.contains(e.target)) {
        setEmojiButtonStatus((prev) => ({
          ...prev,
          clicked: false,
          hover: false,
        }));
      }
    };

    const emoji_icon = document.getElementById("emoji_icon");
    const emoji_parent = document.getElementById("emojis");
    window.addEventListener("click", handleEmojisClose);

    return () => window.removeEventListener("click", handleEmojisClose);
  }, []);

  return (
    <div className="min-h-[64px] flex items-center justify-between relative">
      <form
        className="flex w-full justify-between items-center px-5"
        onSubmit={handleMessageSubmit}
      >
        <input
          type="file"
          hidden
          name=""
          id="imageInput"
          onChange={handleFileChange}
          accept="image/*"
        />
        <label htmlFor="imageInput">
          <div className="p-1 hover:bg-slate-200 transition-all rounded-md">
            <Image
              width={32}
              height={32}
              src="https://cdn-icons-png.flaticon.com/512/10054/10054290.png"
              className="h-8 cursor-pointer"
              alt="addImage"
            />
          </div>
        </label>
        <div
          className={`p-1 hover:bg-slate-200 ${
            emojiButtonStatus.clicked ? `bg-slate-200` : ``
          } transition-all rounded-md relative`}
          onMouseEnter={() =>
            setEmojiButtonStatus((prev) => ({ ...prev, hover: true }))
          }
          onMouseLeave={() =>
            setEmojiButtonStatus((prev) => ({
              ...prev,
              hover: false,
            }))
          }
          onClick={() =>
            setEmojiButtonStatus((prev) => ({
              ...prev,
              clicked: !prev.clicked,
            }))
          }
          id="emojis"
        >
          <Image
            height={32}
            width={32}
            src="https://cdn-icons-png.flaticon.com/512/166/166538.png"
            className="h-8 cursor-pointer"
            alt="emoji-icon"
            id="emoji_icon"
          />
          {emojiButtonStatus.clicked || emojiButtonStatus.hover ? (
            <div className="absolute bottom-8">
              <EmojiPicker
                onEmojiClick={(e) => {
                  setUserInput((prev) => prev + e.emoji);
                }}
              />
            </div>
          ) : null}
        </div>
        <input
          type="text"
          name=""
          value={userInput}
          ref={userInputRef}
          id=""
          className="h-auto py-3 px-3 outline-none bg-gray-100 rounded-full text-lg text-slate-600 transition-all duration-500"
          onChange={(e) => handleChangeInChatInput(e)}
          style={{ width: width ? width : `85%` }}
        />
        <button
          type="submit"
          className="h-8 w-8 flex justify-center items-center"
        >
          <Image
            height={32}
            width={32}
            src="https://cdn-icons-png.flaticon.com/512/3682/3682321.png"
            className={`h-full ${!(userInput || imageInfo) ? `grayscale` : ``}`}
            alt="send message"
          />
        </button>
      </form>
    </div>
  );
}

export default ChatInput;
