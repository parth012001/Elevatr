'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoginCredentials } from '@/types/auth'
import { Flower2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Sending login request...')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      if (data.success && data.redirectTo) {
        console.log('Redirecting to:', data.redirectTo)
        router.replace(data.redirectTo)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-green-100 to-pink-100 relative overflow-hidden">
      {/* Playful floating shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-200 rounded-full opacity-30 blur-2xl animate-float-slow" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-200 rounded-full opacity-30 blur-2xl animate-float-slower" />
      <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-pink-200 rounded-full opacity-20 blur-2xl animate-float" style={{transform: 'translate(-50%,-50%)'}} />
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl px-10 py-12 flex flex-col items-center animate-fade-in">
          {/* Logo/Brand */}
          <div className="flex flex-col items-center mb-6">
            <Flower2 className="h-10 w-10 text-green-400 mb-2 animate-bounce-slow" />
            <span className="text-3xl font-extrabold text-green-700 tracking-tight mb-1">Elevatr</span>
            <span className="text-blue-500 text-base font-medium">Welcome back! Sign in to continue</span>
          </div>
          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-center">
                <div className="text-sm text-red-700 font-medium animate-shake">{error}</div>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  className="bg-white text-black placeholder:text-gray-400 border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  className="bg-white text-black placeholder:text-gray-400 border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-blue-500 transition-colors"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full button-primary shadow-playful text-lg py-3 mt-2 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 transition-all"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>
          <div className="mt-6 text-center text-gray-500 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-green-600 font-semibold hover:underline">Create one</Link>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .animate-float-slow { animation: float 8s ease-in-out infinite alternate; }
        .animate-float-slower { animation: float 12s ease-in-out infinite alternate; }
        .animate-float { animation: float 10s ease-in-out infinite alternate; }
        @keyframes float {
          0% { transform: translateY(0); }
          100% { transform: translateY(-20px); }
        }
        .animate-fade-in { animation: fadeIn 1.2s cubic-bezier(0.4,0,0.2,1); }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-bounce-slow { animation: bounce 2.5s infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
} 