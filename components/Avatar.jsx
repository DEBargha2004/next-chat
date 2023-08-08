import Image from "next/image";
import man from "../public/man.jpeg";
import { useEffect, useMemo, useState } from "react";
import { getImage } from "@/functions/getImage";

const icons = { group: `https://cdn-icons-png.flaticon.com/512/33/33308.png` };

function Avatar({ url, online, className, group, address }) {
  const [processedUrl, setProcessedUrl] = useState("");

  useEffect(() => {
    address && getImage(address).then((url) => setProcessedUrl(url));
  }, [address]);
  const noProfile = () => {
    if (group) {
      return icons.group;
    }
  };
  return (
    <div className="flex relative">
      <img
        src={processedUrl ? processedUrl : url ? url : noProfile()}
        // src={url ? url : noProfile()}
        className={`h-12 w-12 object-cover rounded-full ${className}`}
        alt=""
      />
      {online ? (
        online === "away" ? (
          <div className="w-4 h-4 flex rounded-full justify-center items-center bg-white absolute bottom-[1px] right-0">
            <div className="h-[10px] w-[10px] bg-orange-600 rounded-full" />
          </div>
        ) : (
          <div className="w-4 h-4 flex rounded-full justify-center items-center bg-white absolute bottom-[1px] right-0">
            <div className="h-[10px] w-[10px] bg-green-500 rounded-full" />
          </div>
        )
      ) : (
        ""
      )}
    </div>
  );
}

export default Avatar;
