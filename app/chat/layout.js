'use client'

import Sidebar from "@/components/Sidebar"

export default function RootLayout({children}) {
  return (
    <>
        <Sidebar className={`w-[30%] border-r-[1px] border-slate-400`} />
        <div className="w-[70%] h-full">
        {
            children
        }
        </div>
    </>
  )
}
