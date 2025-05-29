'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

export default function Dashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState('User')
  const [habitName, setHabitName] = useState('')
  const [habitDescription, setHabitDescription] = useState('')
  const [habitFrequency, setHabitFrequency] = useState('daily')

  useEffect(() => {
    // Fetch user data from the server
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile')
        const data = await response.json()
        if (data.name) {
          setUserName(data.name)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      if (data.success && data.redirectTo) {
        router.replace(data.redirectTo)
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleCreateHabit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: habitName,
          description: habitDescription,
          frequency: habitFrequency,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      // Reset form
      setHabitName('')
      setHabitDescription('')
      setHabitFrequency('daily')

      // Optionally, refresh the habits list or show a success message
    } catch (error) {
      console.error('Error creating habit:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {userName}!</span>
              <Button
                onClick={handleLogout}
                variant="outline"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
            <h2 className="text-2xl font-bold mb-4">Welcome to your Dashboard!</h2>
            <p className="text-lg mb-4">You are now logged in.</p>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label htmlFor="habitName" className="block text-sm font-medium text-gray-700">Habit Name</label>
                <Input
                  id="habitName"
                  value={habitName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHabitName(e.target.value)}
                  required
                  placeholder="Enter habit name"
                />
              </div>
              <div>
                <label htmlFor="habitDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  id="habitDescription"
                  value={habitDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHabitDescription(e.target.value)}
                  placeholder="Enter habit description"
                />
              </div>
              <div>
                <label htmlFor="habitFrequency" className="block text-sm font-medium text-gray-700">Frequency</label>
                <Select
                  id="habitFrequency"
                  value={habitFrequency}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setHabitFrequency(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </div>
              <Button type="submit" className="w-full">Create Habit</Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 