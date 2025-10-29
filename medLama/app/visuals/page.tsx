'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, Moon, Sun, Stethoscope, BookOpen, Brain, BarChart3, History, Target, Send, Download, Share2 } from 'lucide-react'
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

const visualTypes = [
  {
    title: 'Anatomical Diagrams',
    description: 'Detailed organ structures and body systems',
    icon: '🫀',
    color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    examples: ['Heart anatomy', 'Brain structure', 'Lung cross-section']
  },
  {
    title: 'Process Flowcharts',
    description: 'Step-by-step biological processes',
    icon: '🔄',
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    examples: ['Cardiac cycle', 'Digestive process', 'Blood circulation']
  },
  {
    title: 'Mind Maps',
    description: 'Conceptual relationships and classifications',
    icon: '🧠',
    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    examples: ['Disease classifications', 'Drug mechanisms', 'System interactions']
  },
  {
    title: '3D Models',
    description: 'Three-dimensional organ representations',
    icon: '🎯',
    color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    examples: ['Heart 3D model', 'Brain regions', 'Skeletal system']
  }
]

const visualPrompts = [
  "Create a heart anatomy diagram",
  "Show the cardiac cycle flowchart",
  "Generate a nervous system mind map",
  "Create a lung cross-section diagram",
  "Show the digestive process flowchart",
  "Generate a blood circulation diagram",
  "Create a brain anatomy 3D model",
  "Show the immune system mind map"
]

interface Visual {
  id: string
  title: string
  content: string
  type: string
  timestamp: Date
}

export default function VisualsPage() {
  const [visuals, setVisuals] = useState<Visual[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const generateVisual = async (prompt: string) => {
    setIsGenerating(true)
    
    try {
      const response = await fetch(`http://localhost:5002/api/llm/response/?message=${encodeURIComponent(prompt)}`)
      const data = await response.json()
      
      const newVisual: Visual = {
        id: Date.now().toString(),
        title: prompt,
        content: data.messages,
        type: selectedType || 'diagram',
        timestamp: new Date()
      }
      
      setVisuals(prev => [newVisual, ...prev])
    } catch (error) {
      console.error('Error generating visual:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isGenerating) return
    generateVisual(input)
    setInput('')
  }

  const handlePromptSelect = (prompt: string) => {
    generateVisual(prompt)
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
                    variant={item.name === 'Visuals' ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-9 px-4 ${
                      item.name === 'Visuals' 
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Visual Types */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Visual Types
              </h2>
              
              <div className="space-y-4">
                {visualTypes.map((type) => (
                  <div
                    key={type.title}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedType === type.title
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                    }`}
                    onClick={() => setSelectedType(selectedType === type.title ? null : type.title)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{type.icon}</div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {type.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {type.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          Examples: {type.examples.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Prompts */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Prompts
              </h3>
              <div className="space-y-2">
                {visualPrompts.map((prompt, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handlePromptSelect(prompt)}
                    disabled={isGenerating}
                  >
                    <span className="text-sm">{prompt}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Side - Visual Generator */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Visual Generator
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Describe the visual you want to create..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="w-full pr-14 py-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      disabled={isGenerating}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-lg"
                      disabled={isGenerating || !input.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>

              {/* Visual Display Area */}
              <div className="min-h-[500px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Generating visual...</p>
                    </div>
                  </div>
                ) : visuals.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No visuals yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Start by describing a medical concept you'd like to visualize
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Try: "Create a heart anatomy diagram" or "Show the cardiac cycle"
                      </p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      {visuals.map((visual) => (
                        <div key={visual.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {visual.title}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {visual.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono">
                              {visual.content}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
