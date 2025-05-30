"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Flower2 } from "lucide-react"

export function Headbar() {
  const pathname = usePathname()
  const [userName, setUserName] = useState("User")
  const [userImage, setUserImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile")
        const data = await res.json()
        if (data.name) setUserName(data.name)
        if (data.image) setUserImage(data.image)
      } catch {}
    }
    fetchProfile()
  }, [])

  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-white/80 shadow-md backdrop-blur z-40">
      {/* Logo/Brand */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-green-600 flex items-center gap-2">
          <Flower2 className="h-7 w-7 text-green-400" />
          Elevatr
        </span>
      </div>
      {/* Navigation */}
      <nav className="flex gap-6 items-center">
        <Link href="/dashboard" className={`text-base font-medium px-3 py-1 rounded transition-colors ${pathname === "/dashboard" ? "text-green-700 bg-green-100 shadow-sm" : "text-blue-700 hover:text-green-600 hover:bg-green-50"}`}>Dashboard</Link>
        <Link href="/stats" className={`text-base font-medium px-3 py-1 rounded transition-colors ${pathname === "/stats" ? "text-green-700 bg-green-100 shadow-sm" : "text-blue-700 hover:text-green-600 hover:bg-green-50"}`}>Stats</Link>
      </nav>
      {/* User Profile Section */}
      <Link href="/profile" className={`flex items-center gap-3 group px-3 py-1 rounded transition-colors ${pathname === "/profile" ? "bg-green-100 shadow-sm" : "hover:bg-green-50"}`}>
        {userImage ? (
          <img
            src={userImage}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-green-200 shadow"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center shadow border-2 border-white">
            <span className="text-lg font-semibold text-green-700">{userName[0]}</span>
          </div>
        )}
        <span className={`text-base font-semibold transition-colors ${pathname === "/profile" ? "text-green-700" : "text-blue-700 group-hover:text-green-600"}`}>{userName}</span>
      </Link>
    </header>
  )
} 