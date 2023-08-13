"use client";

import { updateGroups } from "@/functions/updateGroups";
import { Appstate } from "@/hooks/context";
import { motion } from "framer-motion";
import { useContext, useEffect } from "react";

function Page() {

  const {conversationsInfo,setGroups} = useContext(Appstate)


  return (
    <section className="h-full w-full flex flex-col justify-center items-center">
      <motion.img
        src="https://cdn3d.iconscout.com/3d/premium/thumb/group-chat-5380681-4497610.png"
        className="h-[200px]"
        alt=""
        initial={{ scale: 0 }}
        animate={{ scale: 1.5, transition: "2s" }}
      />
      <h1
        className="mt-10 text-4xl text-slate-700 w-[45%] text-center"
        style={{ fontFamily: "Rubik" }}
      >
        Enjoy Chatting with friends together
      </h1>
    </section>
  );
}

export default Page;
