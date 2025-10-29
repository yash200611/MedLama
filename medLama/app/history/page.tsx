'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, Moon, Sun, Stethoscope, BookOpen, Brain, BarChart3, History, Target, Search, Filter, Calendar, Clock, Trash2, Star } from 'lucide-react'
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

const mockHistory = [
  {
    id: '1',
    type: 'lesson',
    title: 'Cardiac Cycle Explained',
    content: 'The cardiac cycle is the sequence of events that occurs during one complete heartbeat...',
    topic: 'Cardiology',
    timestamp: new Date('2024-01-28T14:30:00'),
    duration: 15,
    rating: 5,
    tags: ['anatomy', 'physiology', 'heart']
  },
  {
    id: '2',
    type: 'quiz',
    title: 'Respiratory System Quiz',
    content: 'Quiz completed with 92% accuracy. Questions covered lung function, gas exchange, and breathing mechanics...',
    topic: 'Respiratory',
    timestamp: new Date('2024-01-27T16:45:00'),
    duration: 8,
    rating: 4,
    tags: ['quiz', 'lungs', 'breathing']
  },
  {
    id: '3',
    type: 'visual',
    title: 'Heart Anatomy Diagram',
    content: 'Created detailed heart anatomy diagram showing chambers, valves, and blood flow...',
    topic: 'Cardiology',
    timestamp: new Date('2024-01-26T11:20:00'),
    duration: 12,
    rating: 5,
    tags: ['diagram', 'anatomy', 'heart']
  },
  {
    id: '4',
    type: 'lesson',
    title: 'Nervous System Overview',
    content: 'Comprehensive overview of the nervous system including brain regions, spinal cord, and neural pathways...',
    topic: 'Neurology',
    timestamp: new Date('2024-01-25T09:15:00'),
    duration: 20,
    rating: 4,
    tags: ['brain', 'nerves', 'anatomy']
  },
  {
    id: '5',
    type: 'quiz',
    title: 'Cardiology Quiz',
    content: 'Quiz on cardiac cycle, heart anatomy, and cardiovascular diseases. Scored 88%...',
    topic: 'Cardiology',
    timestamp: new Date('2024-01-24T13:30:00'),
    duration: 10,
    rating: 4,
    tags: ['quiz', 'heart', 'diseases']
  },
  {
    id: '6',
    type: 'lesson',
    title: 'Immune System Response',
    content: 'Detailed explanation of how the immune system responds to infections and foreign substances...',
    topic: 'Immunology',
    timestamp: new Date('2024-01-23T15:45:00'),
    duration: 18,
    rating: 5,
    tags: ['immune', 'infection', 'antibodies']
  }
]

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Lessons', value: 'lesson' },
  { label: 'Quizzes', value: 'quiz' },
  { label: 'Visuals', value: 'visual' }
]

const topicOptions = [
  { label: 'All Topics', value: 'all' },
  { label: 'Cardiology', value: 'Cardiology' },
  { label: 'Respiratory', value: 'Respiratory' },
  { label: 'Neurology', value: 'Neurology' },
  { label: 'Immunology', value: 'Immunology' }
]

export default function HistoryPage() {
  const [history, setHistory] = useState(mockHistory)
  const [filteredHistory, setFilteredHistory] = useState(mockHistory)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [topicFilter, setTopicFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    let filtered = history

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter)
    }

    // Apply topic filter
    if (topicFilter !== 'all') {
      filtered = filtered.filter(item => item.topic === topicFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.timestamp.getTime() - a.timestamp.getTime()
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime()
        case 'duration':
          return b.duration - a.duration
        case 'rating':
          return b.rating - a.rating
        default:
          return 0
      }
    })

    setFilteredHistory(filtered)
  }, [history, searchQuery, typeFilter, topicFilter, sortBy])

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="h-5 w-5 text-blue-600" />
      case 'quiz':
        return <Brain className="h-5 w-5 text-purple-600" />
      case 'visual':
        return <BarChart3 className="h-5 w-5 text-green-600" />
      default:
        return <History className="h-5 w-5 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lesson':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'quiz':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
      case 'visual':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

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
                    variant={item.name === 'History' ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-9 px-4 ${
                      item.name === 'History' 
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Learning History
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Review your past learning sessions and track your progress
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search your learning history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={typeFilter === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter(option.value)}
                  className={typeFilter === option.value ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Topic Filter */}
            <div className="flex gap-2">
              {topicOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={topicFilter === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTopicFilter(option.value)}
                  className={topicFilter === option.value ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="duration">Longest Duration</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </Card>

        {/* History List */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <Card className="p-12 text-center">
              <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No history found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery || typeFilter !== 'all' || topicFilter !== 'all'
                  ? 'Try adjusting your filters to see more results'
                  : 'Start learning to build your history'}
              </p>
              <Link href="/learn">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Start Learning
                </Button>
              </Link>
            </Card>
          ) : (
            filteredHistory.map((item) => (
              <Card key={item.id} className={`p-6 ${getTypeColor(item.type)} hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    {getTypeIcon(item.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHistoryItem(item.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {item.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {item.timestamp.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {item.duration} min
                      </div>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                        {item.topic}
                      </span>
                      <div className="flex gap-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
