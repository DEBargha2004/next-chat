import { realtimeDB } from "@/firebase.config"
import { update ,ref} from "firebase/database"

export const handleVisibileStatus = (user) => {
    if(document.hidden){
      update(ref(realtimeDB,`users/${user?.id}`),{
        online : 'away'
      })
    }else{
      update(ref(realtimeDB,`users/${user?.id}`),{
        online : true
      })
    }
  }