"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Flower2, LogOut, User } from "lucide-react"

export function Headbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState("User")
  const [userImage, setUserImage] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick)
    } else {
      document.removeEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      const data = await res.json()
      if (data.success && data.redirectTo) {
        router.replace(data.redirectTo)
      }
    } catch {}
  }

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
      {/* User Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          className={`flex items-center gap-3 group px-3 py-1 rounded transition-colors ${pathname === "/profile" ? "bg-green-100 shadow-sm" : "hover:bg-green-50"}`}
          onClick={() => setDropdownOpen((v) => !v)}
          aria-label="User menu"
        >
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
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in">
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-green-50 rounded-t-xl transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <User className="h-5 w-5 text-green-400" />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-b-xl w-full text-left font-medium transition-colors border-t border-gray-100"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
} 