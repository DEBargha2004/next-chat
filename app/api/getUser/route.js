import { firestoreDB } from "@/firebase.config"
import { doc, getDoc } from "firebase/firestore"

export async function GET(request){
    const {searchParams} = request.nextUrl

    const userId = searchParams.get('userId')
    const userInfo = await getDoc(doc(firestoreDB,`users/${userId}`))
}