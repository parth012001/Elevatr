'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Calendar, Plus, LogOut, Home, Settings, BarChart2 } from 'lucide-react'

interface Habit {
  id: string
  name: string
  description: string
  frequency: string
  streak: number
  completedToday: boolean
}

export default function Dashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState('User')
  const [habits, setHabits] = useState<Habit[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [habitName, setHabitName] = useState('')
  const [habitDescription, setHabitDescription] = useState('')
  const [habitFrequency, setHabitFrequency] = useState('daily')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('/api/user/profile')
        const userData = await userResponse.json()
        if (userData.name) {
          setUserName(userData.name)
        }

        // Fetch habits
        const habitsResponse = await fetch('/api/habits')
        const habitsData = await habitsResponse.json()
        setHabits(habitsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()
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
      if (response.ok) {
        setHabits([...habits, data])
        setShowCreateForm(false)
        setHabitName('')
        setHabitDescription('')
        setHabitFrequency('daily')
      }
    } catch (error) {
      console.error('Error creating habit:', error)
    }
  }

  const handleToggleHabit = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/toggle`, {
        method: 'POST',
      })
      const data = await response.json()
      if (response.ok) {
        setHabits(habits.map(habit => 
          habit.id === habitId ? { ...habit, completedToday: data.completedToday } : habit
        ))
      }
    } catch (error) {
      console.error('Error toggling habit:', error)
    }
  }

  const calculateProgress = () => {
    if (habits.length === 0) return 0
    const completed = habits.filter(habit => habit.completedToday).length
    return (completed / habits.length) * 100
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Elevatr</h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="mr-2 h-5 w-5" />
              Calendar
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <BarChart2 className="mr-2 h-5 w-5" />
              Analytics
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg font-semibold">{userName[0]}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">View Profile</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">
          {/* Progress Overview */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Today's Progress</h2>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Habit
              </Button>
            </div>
            <Card className="p-6">
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-medium text-gray-700">{Math.round(calculateProgress())}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{habits.length}</p>
                  <p className="text-sm text-gray-500">Total Habits</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {habits.filter(h => h.completedToday).length}
                  </p>
                  <p className="text-sm text-gray-500">Completed Today</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.max(...habits.map(h => h.streak), 0)}
                  </p>
                  <p className="text-sm text-gray-500">Best Streak</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Create Habit Form */}
          {showCreateForm && (
            <Card className="mb-8 p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Habit</h3>
              <form onSubmit={handleCreateHabit} className="space-y-4">
                <div>
                  <label htmlFor="habitName" className="block text-sm font-medium text-gray-700">Habit Name</label>
                  <Input
                    id="habitName"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    required
                    placeholder="Enter habit name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="habitDescription" className="block text-sm font-medium text-gray-700">Description</label>
                  <Textarea
                    id="habitDescription"
                    value={habitDescription}
                    onChange={(e) => setHabitDescription(e.target.value)}
                    placeholder="Enter habit description"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="habitFrequency" className="block text-sm font-medium text-gray-700">Frequency</label>
                  <Select
                    id="habitFrequency"
                    value={habitFrequency}
                    onChange={(e) => setHabitFrequency(e.target.value)}
                    className="mt-1"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Habit</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Habits List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Habits</h3>
            <div className="grid gap-4">
              {habits.map((habit) => (
                <Card key={habit.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{habit.name}</h4>
                      <p className="text-sm text-gray-500">{habit.description}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-xs text-gray-500">
                          {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {habit.streak} day streak
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={habit.completedToday ? "default" : "outline"}
                      onClick={() => handleToggleHabit(habit.id)}
                    >
                      {habit.completedToday ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                </Card>
              ))}
              {habits.length === 0 && (
                <Card className="p-6 text-center">
                  <p className="text-gray-500">No habits yet. Create your first habit to get started!</p>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 