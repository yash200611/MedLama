'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Moon, Sun, Stethoscope, BookOpen, Brain, BarChart3, History, Target, Trophy, TrendingUp, Clock, Award, Users, Zap } from 'lucide-react'
import Link from 'next/link'

const MedLamaLearnLogo = () => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
      <Stethoscope className="h-6 w-6 text-white" />
    </div>
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        MedLama Learn
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">AI-Powered Medical Education</p>
    </div>
  </div>
)

const navigationItems = [
  { name: 'Home', href: '/', icon: Stethoscope },
  { name: 'Learn', href: '/learn', icon: BookOpen },
  { name: 'Quiz', href: '/quiz', icon: Brain },
  { name: 'Visuals', href: '/visuals', icon: BarChart3 },
  { name: 'Dashboard', href: '/dashboard', icon: Target },
  { name: 'History', href: '/history', icon: History },
]

const mockStats = {
  totalLessons: 24,
  totalQuizzes: 8,
  totalVisuals: 12,
  totalTime: 156, // minutes
  currentStreak: 7,
  longestStreak: 15,
  averageScore: 85,
  topicsStudied: 6
}

const mockTopics = [
  { name: 'Cardiology', progress: 85, lessons: 8, quizzes: 3, lastStudied: '2 hours ago' },
  { name: 'Respiratory', progress: 70, lessons: 6, quizzes: 2, lastStudied: '1 day ago' },
  { name: 'Neurology', progress: 45, lessons: 4, quizzes: 1, lastStudied: '3 days ago' },
  { name: 'Immunology', progress: 30, lessons: 2, quizzes: 1, lastStudied: '1 week ago' },
  { name: 'Anatomy', progress: 60, lessons: 3, quizzes: 1, lastStudied: '2 days ago' },
  { name: 'Physiology', progress: 25, lessons: 1, quizzes: 0, lastStudied: '1 week ago' }
]

const mockAchievements = [
  { name: 'First Lesson', description: 'Complete your first lesson', icon: BookOpen, earned: true, date: '2024-01-15' },
  { name: 'Quiz Master', description: 'Score 90% or higher on 5 quizzes', icon: Brain, earned: true, date: '2024-01-20' },
  { name: 'Visual Learner', description: 'Create 10 visual diagrams', icon: BarChart3, earned: true, date: '2024-01-25' },
  { name: 'Streak Keeper', description: 'Study for 7 days in a row', icon: Zap, earned: true, date: '2024-01-28' },
  { name: 'Knowledge Seeker', description: 'Study 10 different topics', icon: Target, earned: false, date: null },
  { name: 'Perfect Score', description: 'Get 100% on a quiz', icon: Trophy, earned: false, date: null }
]

const mockRecentActivity = [
  { type: 'lesson', title: 'Cardiac Cycle Explained', topic: 'Cardiology', time: '2 hours ago', score: null },
  { type: 'quiz', title: 'Respiratory System Quiz', topic: 'Respiratory', time: '1 day ago', score: 92 },
  { type: 'visual', title: 'Heart Anatomy Diagram', topic: 'Cardiology', time: '2 days ago', score: null },
  { type: 'lesson', title: 'Nervous System Overview', topic: 'Neurology', time: '3 days ago', score: null },
  { type: 'quiz', title: 'Cardiology Quiz', topic: 'Cardiology', time: '4 days ago', score: 88 }
]

export default function DashboardPage() {
  const [stats, setStats] = useState(mockStats)
  const [topics, setTopics] = useState(mockTopics)
  const [achievements, setAchievements] = useState(mockAchievements)
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <MedLamaLearnLogo />
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={item.name === 'Dashboard' ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-9 px-4 ${
                      item.name === 'Dashboard' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Back Button */}
            <Link href="/">
              <Button variant="ghost" size="sm" className="h-9 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here's your learning progress and achievements
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalLessons}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Lessons Completed
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalQuizzes}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Quizzes Taken
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalVisuals}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Visuals Created
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Study Time
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Progress */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Learning Progress
              </h2>
              
              <div className="space-y-6">
                {topics.map((topic) => (
                  <div key={topic.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {topic.name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-500">
                        {topic.progress}%
                      </span>
                    </div>
                    
                    <Progress value={topic.progress} className="h-2 mb-3" />
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{topic.lessons} lessons • {topic.quizzes} quizzes</span>
                      <span>Last studied: {topic.lastStudied}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Achievements
              </h2>
              
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.name}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      achievement.earned
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      achievement.earned
                        ? 'bg-green-100 dark:bg-green-900/20'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <achievement.icon className={`h-5 w-5 ${
                        achievement.earned ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        achievement.earned ? 'text-green-900 dark:text-green-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-sm ${
                        achievement.earned ? 'text-green-700 dark:text-green-300' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Earned on {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Recent Activity
              </h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      {activity.type === 'lesson' && <BookOpen className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'quiz' && <Brain className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'visual' && <BarChart3 className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {activity.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <span>{activity.topic}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                        {activity.score && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">{activity.score}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
