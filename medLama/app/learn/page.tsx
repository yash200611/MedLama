'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Send, User, ArrowLeft, Moon, Sun, Stethoscope, BookOpen, Brain, BarChart3, History, Target } from 'lucide-react'
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

const learningPrompts = [
  "Explain the cardiac cycle step by step",
  "How does the respiratory system work?",
  "What is the nervous system structure?",
  "Explain the immune system response",
  "How does the digestive process work?",
  "What are the main blood cell types?",
  "Explain the endocrine system function",
  "Create a visual diagram of the heart"
]

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export default function LearnPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Welcome to MedLama Learn! 🎓 I'm your AI-powered medical tutor. I can help you understand complex medical concepts through detailed explanations, create quizzes to test your knowledge, and generate visual diagrams to make learning easier.\n\nWhat would you like to learn today?",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPrompts, setShowPrompts] = useState(true)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)
    setShowPrompts(false)

    try {
      // Import API client dynamically
      const { apiClient } = await import('@/lib/api')
      
      // Send message to new API with conversation_id
      const data = await apiClient.sendMessage({
        message: input,
        conversation_id: conversationId || undefined,
        learning_level: 'medical_student'
      })
      
      // Store conversation ID for future messages
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id)
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error 
          ? `Error: ${error.message}. Please make sure the backend is running and your API key is configured.`
          : "I'm sorry, I'm having trouble connecting right now. Please try again.",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt)
    setShowPrompts(false)
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

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
                    variant={item.name === 'Learn' ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-9 px-4 ${
                      item.name === 'Learn' 
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
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Chat Area */}
          <div className="h-[60vh] md:h-[70vh] overflow-hidden">
            <ScrollArea ref={scrollAreaRef} className="h-full p-4 md:p-6">
              <div className="space-y-4 md:space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 md:gap-4 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                      message.isUser 
                        ? 'bg-blue-100 dark:bg-blue-900' 
                        : 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900'
                    }`}>
                      {message.isUser ? (
                        <User className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Bot className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-4xl ${message.isUser ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl ${
                        message.isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
                      }`}>
                        <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 md:mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                      <Bot className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 max-w-4xl">
                      <div className="inline-block px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 md:p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            {/* Learning Prompts */}
            {showPrompts && messages.length <= 2 && (
              <div className="mb-4 md:mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 md:mb-4">Try these learning prompts:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {learningPrompts.map((prompt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto p-3 md:p-4 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300"
                      onClick={() => handlePromptSelect(prompt)}
                    >
                      <span className="text-xs md:text-sm">{prompt}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-3 md:gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Ask me to explain a medical concept, quiz you, or create a visual diagram..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full pr-12 md:pr-14 py-3 md:py-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  disabled={isProcessing}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-md md:rounded-lg px-3 md:px-4 py-1.5 md:py-2 shadow-lg"
                  disabled={isProcessing || !input.trim()}
                >
                  <Send className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </form>

            {/* Difficulty Level */}
            <div className="mt-3 md:mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-4">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Explain like I'm:</span>
              <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center">
                <Button variant="outline" size="sm" className="text-xs px-2 md:px-3 py-1 md:py-2">5 years old</Button>
                <Button variant="outline" size="sm" className="text-xs px-2 md:px-3 py-1 md:py-2">High school student</Button>
                <Button variant="outline" size="sm" className="text-xs px-2 md:px-3 py-1 md:py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">Medical student</Button>
                <Button variant="outline" size="sm" className="text-xs px-2 md:px-3 py-1 md:py-2">Doctor</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
