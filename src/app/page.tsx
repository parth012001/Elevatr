"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, CalendarDays, BarChart, Flower2, Heart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-100 relative overflow-hidden">
      {/* Floating playful shapes */}
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.25, scale: 1 }} transition={{ duration: 1 }} className="absolute -top-32 -left-32 w-96 h-96 bg-green-200 rounded-full blur-2xl z-0" />
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.2, scale: 1 }} transition={{ duration: 1.2, delay: 0.2 }} className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-200 rounded-full blur-2xl z-0" />
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.15, scale: 1 }} transition={{ duration: 1.4, delay: 0.4 }} className="absolute top-1/2 left-1/2 w-40 h-40 bg-purple-200 rounded-full blur-2xl z-0" style={{transform: 'translate(-50%,-50%)'}} />

      <header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <span className="text-2xl font-extrabold text-green-700 flex items-center gap-2">
          <Flower2 className="h-7 w-7 text-green-400 animate-bounce-slow" />
          Elevatr
        </span>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-blue-700 font-medium hover:underline">Sign In</Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 text-lg rounded-full shadow-lg hover:scale-105 transition-transform">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-10 pb-20 flex flex-col md:flex-row items-center gap-12 relative z-10">
        {/* Left: Hero Text */}
        <motion.section initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="flex-1 max-w-xl">
          <div className="mb-4 text-sm font-semibold text-blue-500 tracking-wide uppercase">Welcome to Elevatr</div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
            Transform Your Life<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">With Habits & Reflection</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">Personalized habit tracking, daily reflections, and beautiful stats—all in one seamless, playful platform. Build streaks, celebrate wins, and grow every day.</p>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 text-xl rounded-full shadow-xl hover:scale-105 transition-transform">
              Start Your Journey
            </Button>
          </Link>
        </motion.section>

        {/* Right: Floating Habit Cards */}
        <motion.section initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex-1 flex flex-col items-center relative min-h-[420px]">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.7 }} className="relative w-[320px] h-[420px] bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center border border-blue-100 px-8 py-8">
            <CalendarDays className="h-12 w-12 text-green-400 mb-2" />
            <div className="text-2xl font-bold text-blue-700 mb-1">Daily Journal</div>
            <div className="text-gray-500 mb-4 text-center">Reflect on your day and track your progress.</div>
            <div className="flex flex-col gap-3 w-full px-6">
              <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-2 shadow-inner">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-blue-700">Habit Completed!</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-2 shadow-inner">
                <BarChart className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-blue-700">Streak: 7 days</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 rounded-xl px-4 py-2 shadow-inner">
                <Heart className="h-5 w-5 text-pink-400" />
                <span className="font-semibold text-blue-700">Reflection Saved!</span>
              </div>
            </div>
            {/* Floating badges */}
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1, duration: 0.5 }} className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-400 to-blue-400 text-white px-7 py-2 rounded-full shadow-lg text-sm font-semibold whitespace-nowrap flex items-center justify-center min-w-[180px]">
              Weekly Progress: 5/7
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, duration: 0.5 }} className="absolute -bottom-8 right-4 bg-white border border-blue-100 px-3 py-1 rounded-xl shadow text-blue-500 font-semibold text-xs">
              Journal Entry Added
            </motion.div>
          </motion.div>
        </motion.section>
      </main>

      {/* Statistic Cards */}
      <section className="container mx-auto px-6 pb-16 flex flex-col md:flex-row gap-6 md:gap-10 justify-center items-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-white/80 backdrop-blur rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center min-w-[180px]">
          <div className="text-2xl font-bold text-green-600 mb-1">Live</div>
          <div className="text-sm text-blue-500">Available Now</div>
          <div className="text-xs text-green-500 mt-2 font-medium">Start Tracking</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="bg-white/80 backdrop-blur rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center min-w-[180px]">
          <div className="text-2xl font-bold text-blue-600 mb-1">98%</div>
          <div className="text-sm text-blue-500">User Satisfaction</div>
          <div className="text-xs text-blue-400 mt-2 font-medium">Loved by Users</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="bg-white/80 backdrop-blur rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center min-w-[180px]">
          <div className="text-2xl font-bold text-purple-600 mb-1">2025</div>
          <div className="text-sm text-blue-500">Habit Revolution</div>
          <div className="text-xs text-purple-400 mt-2 font-medium">Join the Movement</div>
        </motion.div>
      </section>

      <style jsx global>{`
        .animate-bounce-slow { animation: bounce 2.5s infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
