import { contentDB } from "@/firebase.config";
import { getDownloadURL, ref } from "firebase/storage";

export async function getImage(address) {
  if (!address) return "";
  const contentRef = ref(contentDB, address);
  const url = await getDownloadURL(contentRef);

  return url;
}
