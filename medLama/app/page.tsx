'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Stethoscope, BookOpen, Brain, BarChart3, History, Zap, ArrowRight, Users, Award, Target, Moon, Sun } from 'lucide-react'
import Link from 'next/link'

const MedLamaLearnLogo = () => (
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
      <Stethoscope className="h-7 w-7 text-white" />
      </div>
    <div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        MedLama Learn
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">AI-Powered Medical Education Platform</p>
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

const featuredTopics = [
  {
    title: 'Cardiology',
    description: 'Master heart anatomy, cardiac cycle, and cardiovascular diseases',
    icon: '🫀',
    color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    stats: '12 lessons • 5 quizzes'
  },
  {
    title: 'Respiratory System',
    description: 'Understand lung function, breathing mechanics, and respiratory conditions',
    icon: '🫁',
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    stats: '8 lessons • 3 quizzes'
  },
  {
    title: 'Neurology',
    description: 'Explore brain anatomy, nervous system, and neurological disorders',
    icon: '🧠',
    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    stats: '15 lessons • 7 quizzes'
  },
  {
    title: 'Immunology',
    description: 'Learn about immune system, antibodies, and infection responses',
    icon: '🛡️',
    color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    stats: '10 lessons • 4 quizzes'
  }
]

const features = [
  {
    title: 'AI-Powered Learning',
    description: 'Get personalized explanations tailored to your learning level',
    icon: Zap,
    color: 'text-blue-600'
  },
  {
    title: 'Interactive Quizzes',
    description: 'Test your knowledge with AI-generated multiple choice questions',
    icon: Brain,
    color: 'text-purple-600'
  },
  {
    title: 'Visual Diagrams',
    description: 'Understand complex concepts through detailed anatomical diagrams',
    icon: BarChart3,
    color: 'text-green-600'
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics',
    icon: Award,
    color: 'text-orange-600'
  }
]

export default function HomePage() {
  const [isDark, setIsDark] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <MedLamaLearnLogo />
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => (
                <Link key={item.name} href={item.href}>
          <Button
                    variant={item.name === 'Home' ? 'default' : 'ghost'}
            size="sm"
                    className={`h-9 px-4 ${
                      item.name === 'Home' 
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

            {/* Theme Toggle */}
          <Button
            variant="ghost"
              size="sm"
              onClick={() => setIsDark(!isDark)}
              className="h-9 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Master Medicine with AI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Learn complex medical concepts through interactive AI explanations, quizzes, and visual diagrams. 
            Your personal medical education companion.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/learn">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                Start Learning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/quiz">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                Take a Quiz
                <Brain className="ml-2 h-5 w-5" />
                </Button>
            </Link>
                    </div>
                  </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <feature.icon className={`h-12 w-12 ${feature.color} mx-auto mb-4`} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
            </Card>
                ))}
              </div>

        {/* Featured Topics */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Featured Learning Topics
              </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredTopics.map((topic) => (
              <Card key={topic.title} className={`p-6 ${topic.color} hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{topic.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{topic.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-500">{topic.stats}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </Card>
                ))}
              </div>
            </div>

        {/* Stats Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                      <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400">Medical Concepts</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">1000+</div>
              <div className="text-gray-600 dark:text-gray-400">Quiz Questions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-400">Visual Diagrams</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}