"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Flower2, Camera } from 'lucide-react'
import { Headbar } from '@/components/ui/Headbar'

export default function ProfilePage() {
  const [user, setUser] = useState({ name: '', email: '', image: '' })
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [image, setImage] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/user/profile')
        const data = await res.json()
        if (res.ok) {
          setUser(data)
          setName(data.name || '')
          setImage(data.image || '')
        } else {
          setError(data.error || 'Failed to load profile.')
        }
      } catch (err) {
        setError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
      setImage(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      let imageUrl = user.image
      if (imageFile) {
        // Upload image to /api/user/upload-photo (to be implemented)
        const formData = new FormData()
        formData.append('file', imageFile)
        const res = await fetch('/api/user/upload-photo', {
          method: 'POST',
          body: formData
        })
        const data = await res.json()
        if (res.ok && data.url) {
          imageUrl = data.url
        } else {
          setError(data.error || 'Failed to upload photo.')
          setSaving(false)
          return
        }
      }
      // Save profile changes
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password: password || undefined, image: imageUrl })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Profile updated!')
        setUser(data)
        setPassword('')
        setImageFile(null)
      } else {
        setError(data.error || 'Failed to update profile.')
      }
    } catch (err) {
      setError('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
      <Headbar />
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-green-50 py-10 px-2">
        <div className="w-full max-w-lg">
          <Card className="p-8 card shadow-playful bg-gradient-to-br from-green-50 to-blue-50 animate-fade-in">
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-24 h-24 mb-2">
                <img
                  src={image || '/default-avatar.png'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg bg-gray-100"
                />
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shadow-lg border-2 border-white"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload Photo"
                >
                  <Camera className="h-5 w-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              <h2 className="text-2xl font-bold text-blue-700 mb-1">Profile</h2>
              <p className="text-blue-500">Update your info and photo</p>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-400"></div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSave}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} required className="mt-1 bg-white text-black placeholder:text-gray-400 border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input value={user.email} readOnly className="mt-1 bg-gray-100 cursor-not-allowed text-gray-400 border border-gray-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current password" className="mt-1 bg-white text-black placeholder:text-gray-400 border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" />
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                {success && <div className="text-green-600 text-sm text-center">{success}</div>}
                <div className="flex justify-end">
                  <Button type="submit" className="button-primary shadow-playful" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
} 