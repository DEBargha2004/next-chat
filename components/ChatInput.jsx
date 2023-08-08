import { useState, useContext, useRef, useEffect } from "react";
import { v4, v5 } from "uuid";
import { Appstate } from "@/hooks/context";
import { useUser } from "@clerk/nextjs";
import { firestoreDB, contentDB } from "../firebase.config";
import { setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import Picker from "@emoji-mart/react";
import { cloneDeep } from "lodash";
import { abortImage } from "@/functions/abortImage";
import { uploadImage } from "@/functions/uploadImage";

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

  function generateUinqueid(id1, id2) {
    const sortedids = [id1, id2].sort().join("-");

    const unique_id = v5(sortedids, v5.DNS);
    return unique_id;
  }

  async function addConInfoInUser({ conversation_id }) {
    const users_con = (id) => `users/${id}/conversations/${conversation_id}`;
    const con = () => `conversations/${conversation_id}`;
    if (selectedChatUser.isGroup) {
      // Do Something
    } else {
      const sender_id = user.id;
      const receiver_id = selectedChatUser.current_User_Id;

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

    const sender_id = user.id;
    const receiver_id = selectedChatUser.current_User_Id;
    const message_data = {
      text: userInput,
      image: imageInfo.info ? imageName : null,
    };
    const conversation_id =
      type !== "group"
        ? generateUinqueid(sender_id, receiver_id)
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
    const refMessage = referenceMessage ? refMessageInfo : null;

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

  useEffect(() => {
    const handleEmojisClose = (e) => {
      if (!e.target.contains(emoji_icon)) {
        setEmojiButtonStatus((prev) => ({
          ...prev,
          clicked: false,
          hover: false,
        }));
      }
    };

    const emoji_icon = document.getElementById("emoji_icon");
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
            <img
              src="https://cdn-icons-png.flaticon.com/512/10054/10054290.png"
              className="h-8 cursor-pointer"
              alt=""
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
          <img
            src="https://cdn-icons-png.flaticon.com/512/166/166538.png"
            className="h-8 cursor-pointer"
            alt=""
            id="emoji_icon"
          />
          {emojiButtonStatus.clicked || emojiButtonStatus.hover ? (
            <div className="absolute bottom-8">
              <Picker
                className=""
                onEmojiSelect={(e) => {
                  let { native } = e;
                  let userInputClone = cloneDeep(userInput);
                  userInputClone += native;
                  setUserInput(userInputClone);
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
          onChange={(e) => setUserInput(e.target.value)}
          style={{ width: width ? width : `85%` }}
        />
        <button
          type="submit"
          className="h-8 w-8 flex justify-center items-center"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3682/3682321.png"
            className={`h-full ${!(userInput || imageInfo) ? `grayscale` : ``}`}
            alt=""
          />
        </button>
      </form>
    </div>
  );
}

export default ChatInput;
