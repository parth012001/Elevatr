'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Calendar, Plus, LogOut, Home, Settings, BarChart2, Flower2, Pencil, Trash2 } from 'lucide-react'
import { ChangeEvent } from 'react'
import confetti from 'canvas-confetti'
import Link from 'next/link'

interface Habit {
  id: string
  name: string
  description: string
  frequency: string
  streak: number
  completedToday: boolean
}

const MOTIVATIONAL_QUOTES = [
  "Small steps every day lead to big results!",
  "You're growing stronger, one habit at a time!",
  "Consistency is the key to success!",
  "Celebrate your progress, no matter how small!",
  "Your future self will thank you!",
  "Keep going, you're doing amazing!",
  "Every day is a fresh start! 🌱",
  "Habits are the seeds of greatness!",
  "You're building something beautiful! 🌸",
  "Progress, not perfection!"
]

export default function Dashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState('User')
  const [habits, setHabits] = useState<Habit[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [habitName, setHabitName] = useState('')
  const [habitDescription, setHabitDescription] = useState('')
  const [habitFrequency, setHabitFrequency] = useState('daily')
  const [isLoading, setIsLoading] = useState(true)
  const [quote, setQuote] = useState('')
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editFrequency, setEditFrequency] = useState('daily')
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

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

  useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])
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
        setHabits(habits => habits.map(habit => {
          if (habit.id === habitId) {
            // Trigger confetti only if transitioning from incomplete to complete
            if (!habit.completedToday && data.completed) {
              confetti({
                particleCount: 60,
                spread: 70,
                origin: { y: 0.7 },
                colors: ['#6FCF97', '#56CCF2', '#F2C94C', '#F299C9', '#BB6BD9']
              })
            }
            return { ...habit, completedToday: data.completed, streak: data.streak }
          }
          return habit
        }))
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

  // Open edit modal and prefill state
  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit)
    setEditName(habit.name)
    setEditDescription(habit.description)
    setEditFrequency(habit.frequency)
  }

  // Save edited habit
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHabit) return
    setErrorMsg('')
    try {
      const response = await fetch(`/api/habits/${editingHabit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          frequency: editFrequency
        })
      })
      const data = await response.json()
      if (response.ok) {
        setHabits(habits => habits.map(h => h.id === editingHabit.id ? { ...h, ...data } : h))
        setEditingHabit(null)
      } else {
        setErrorMsg(data.error || 'Failed to update habit.')
      }
    } catch (err) {
      setErrorMsg('Failed to update habit.')
    }
  }

  // Delete habit with confirmation
  const handleDeleteHabit = async () => {
    if (!editingHabit) return
    setDeleting(true)
    setErrorMsg('')
    try {
      const response = await fetch(`/api/habits/${editingHabit.id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setHabits(habits => habits.filter(h => h.id !== editingHabit.id))
        setEditingHabit(null)
        setDeleteConfirm(false)
      } else {
        setErrorMsg(data.error || 'Failed to delete habit.')
      }
    } catch (err) {
      setErrorMsg('Failed to delete habit.')
    } finally {
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-green-50">
      {/* Sidebar: slim, icons only */}
      <aside className="w-20 flex flex-col items-center py-8 bg-white shadow-lg border-r border-gray-100">
        <div className="mb-8">
          <Flower2 className="h-8 w-8 text-green-400" />
        </div>
        <nav className="flex flex-col gap-8 flex-1 items-center">
          <button className="group flex flex-col items-center text-green-500 font-bold">
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1 opacity-100 transition-opacity">Dashboard</span>
          </button>
          <Link href="/stats" className="group flex flex-col items-center text-gray-400 hover:text-yellow-500 transition-colors focus:outline-none">
            <BarChart2 className="h-6 w-6" />
            <span className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Stats</span>
          </Link>
        </nav>
        <div className="mb-4 mt-auto flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center shadow-playful">
            <span className="text-lg font-semibold text-green-700">{userName[0]}</span>
          </div>
          <button className="mt-4 text-gray-400 hover:text-red-500 transition-colors" onClick={handleLogout}>
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </aside>

      {/* Main Content: centered, single column */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-0 py-10">
        {/* Motivational Quote */}
        <div className="w-full max-w-xl mb-8">
          <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-green-100 via-blue-100 to-green-50 shadow-playful text-lg font-semibold text-blue-700 animate-fade-in flex items-center gap-3">
            <Flower2 className="h-6 w-6 text-pink-400" />
            <span>{quote}</span>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="w-full max-w-xl mb-8">
          <Card className="p-6 card shadow-playful">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-medium text-gray-700">{Math.round(calculateProgress())}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-2 bg-gradient-to-r from-green-200 via-blue-200 to-green-100" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{habits.length}</p>
                <p className="text-sm text-gray-500">Total Habits</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {habits.filter(h => h.completedToday).length}
                </p>
                <p className="text-sm text-gray-500">Completed Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">
                  {Math.max(...habits.map(h => h.streak), 0)}
                </p>
                <p className="text-sm text-gray-500">Best Streak</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Habits List: clean, card stack */}
        <div className="w-full max-w-xl flex flex-col gap-6">
          {habits.length === 0 ? (
            <Card className="p-8 card shadow-playful flex flex-col items-center justify-center text-center">
              <Flower2 className="h-12 w-12 text-green-300 mb-4" />
              <p className="text-xl font-semibold text-gray-400 mb-2">No habits yet</p>
              <p className="text-gray-400">Start your journey by adding your first habit!</p>
            </Card>
          ) : (
            habits.map((habit) => (
              <Card key={habit.id} className="p-6 card shadow-playful flex flex-row items-center gap-4 transition-transform duration-300 hover:scale-[1.02] active:scale-95">
                <div className="flex flex-col items-center justify-center mr-4">
                  <span className="inline-block text-3xl mb-2">
                    {habit.completedToday ? '🌸' : '🌱'}
                  </span>
                  <span className="text-xs text-gray-400">{habit.streak}d</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    {habit.name}
                    <button
                      className="ml-2 p-1 rounded hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors"
                      aria-label="Edit Habit"
                      onClick={() => openEditModal(habit)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{habit.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">{habit.frequency}</span>
                    {habit.completedToday && <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5">Completed</span>}
                  </div>
                </div>
                <Button
                  variant={habit.completedToday ? "primary" : "outline"}
                  onClick={() => handleToggleHabit(habit.id)}
                  className={`transition-colors button-primary shadow-playful active:scale-95 px-4 py-2 text-base font-semibold ${
                    habit.completedToday ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                >
                  {habit.completedToday ? '✓' : 'Mark'}
                </Button>
              </Card>
            ))
          )}
        </div>

        {/* Floating Action Button for Add Habit */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-green-400 to-blue-400 text-white rounded-full shadow-lg p-5 hover:scale-110 transition-transform flex items-center justify-center"
          aria-label="Add Habit"
        >
          <Plus className="h-7 w-7" />
        </button>

        {/* Add Habit Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
              <h3 className="text-xl font-bold mb-4 text-center text-green-700">Add a New Habit</h3>
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
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setHabitDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="habitFrequency" className="block text-sm font-medium text-gray-700">Frequency</label>
                  <Select
                    id="habitFrequency"
                    value={habitFrequency}
                    onChange={setHabitFrequency}
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
                  <Button type="submit" className="button-primary shadow-playful">Create Habit</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Habit Modal */}
        {editingHabit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
              <h3 className="text-xl font-bold mb-4 text-center text-blue-700">Edit Habit</h3>
              <form className="space-y-4" onSubmit={handleEditSave}>
                <div>
                  <label htmlFor="editName" className="block text-sm font-medium text-gray-700">Habit Name</label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700">Description</label>
                  <Textarea
                    id="editDescription"
                    value={editDescription}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="editFrequency" className="block text-sm font-medium text-gray-700">Frequency</label>
                  <Select
                    id="editFrequency"
                    value={editFrequency}
                    onChange={setEditFrequency}
                    className="mt-1"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </div>
                {errorMsg && <div className="text-red-500 text-sm text-center">{errorMsg}</div>}
                <div className="flex justify-between items-center mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingHabit(null)}
                  >
                    Cancel
                  </Button>
                  <div className="flex gap-2">
                    <Button type="submit" className="button-primary shadow-playful">Save</Button>
                    <button
                      type="button"
                      className="p-2 rounded bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors flex items-center"
                      aria-label="Delete Habit"
                      onClick={() => setDeleteConfirm(true)}
                      disabled={deleting}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </form>
              {/* Delete Confirmation Dialog */}
              {deleteConfirm && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs text-center">
                    <p className="mb-4 text-lg text-gray-700">Are you sure you want to delete this habit?</p>
                    <div className="flex justify-center gap-4">
                      <Button variant="outline" onClick={() => setDeleteConfirm(false)} disabled={deleting}>Cancel</Button>
                      <Button className="bg-red-500 text-white" onClick={handleDeleteHabit} disabled={deleting}>
                        {deleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 1.2s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
} 