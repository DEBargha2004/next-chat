import Image from "next/image"
import messenger from '../public/messenger.png'
import { UserButton } from "@clerk/nextjs"

function Navbar() {
  return (
    <div className="p-4 flex justify-between">
        <Image src={messenger} className="h-9 w-auto" />
        <UserButton />
    </div>
  )
}

export default Navbar