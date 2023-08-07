import { contentDB } from "@/firebase.config"
import { uploadBytes,ref } from "firebase/storage"


export async function uploadImage(file,address){
    const contentRef = ref(contentDB, address)

    file && (await uploadBytes(contentRef, file))
}