'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Moon, Sun, Stethoscope, BookOpen, Brain, BarChart3, History, Target, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
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

const quizTopics = [
  {
    title: 'Cardiology',
    description: 'Heart anatomy, cardiac cycle, and cardiovascular diseases',
    icon: '🫀',
    color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    questions: 15,
    difficulty: 'Intermediate'
  },
  {
    title: 'Respiratory System',
    description: 'Lung function, breathing mechanics, and respiratory conditions',
    icon: '🫁',
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    questions: 12,
    difficulty: 'Beginner'
  },
  {
    title: 'Neurology',
    description: 'Brain anatomy, nervous system, and neurological disorders',
    icon: '🧠',
    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    questions: 20,
    difficulty: 'Advanced'
  },
  {
    title: 'Immunology',
    description: 'Immune system, antibodies, and infection responses',
    icon: '🛡️',
    color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    questions: 10,
    difficulty: 'Intermediate'
  }
]

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

interface QuizState {
  currentQuestion: number
  score: number
  answers: number[]
  completed: boolean
  questions: QuizQuestion[]
}

export default function QuizPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [quizState, setQuizState] = useState<QuizState | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const startQuiz = async (topic: string) => {
    setSelectedTopic(topic)
    setSelectedAnswer(null)
    setShowResult(false)
    
    try {
      const response = await fetch(`http://localhost:5002/api/llm/response/?message=Quiz me on ${topic.toLowerCase()}`)
      const data = await response.json()
      
      // Parse the AI response to extract quiz questions
      // For now, we'll use mock data
      const mockQuestions: QuizQuestion[] = [
        {
          question: "What is the natural pacemaker of the heart?",
          options: ["AV Node", "SA Node", "Bundle of His", "Purkinje Fibers"],
          correct: 1,
          explanation: "The SA (Sinoatrial) Node is the natural pacemaker that initiates each heartbeat."
        },
        {
          question: "During which phase do the ventricles contract?",
          options: ["Diastole", "Systole", "Atrial systole", "Isovolumetric relaxation"],
          correct: 1,
          explanation: "Ventricular systole is when the ventricles contract and pump blood out."
        },
        {
          question: "What prevents backflow of blood in the heart?",
          options: ["Muscles", "Valves", "Arteries", "Veins"],
          correct: 1,
          explanation: "Heart valves prevent backflow of blood between chambers."
        }
      ]

      setQuizState({
        currentQuestion: 0,
        score: 0,
        answers: [],
        completed: false,
        questions: mockQuestions
      })
    } catch (error) {
      console.error('Error starting quiz:', error)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult || !quizState) return
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    if (!quizState || selectedAnswer === null) return

    const isCorrect = selectedAnswer === quizState.questions[quizState.currentQuestion].correct
    const newScore = isCorrect ? quizState.score + 1 : quizState.score
    const newAnswers = [...quizState.answers, selectedAnswer]

    if (quizState.currentQuestion + 1 >= quizState.questions.length) {
      // Quiz completed
      setQuizState({
        ...quizState,
        score: newScore,
        answers: newAnswers,
        completed: true
      })
    } else {
      // Next question
      setQuizState({
        ...quizState,
        currentQuestion: quizState.currentQuestion + 1,
        score: newScore,
        answers: newAnswers
      })
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const resetQuiz = () => {
    setSelectedTopic(null)
    setQuizState(null)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (quizState?.completed) {
    const percentage = Math.round((quizState.score / quizState.questions.length) * 100)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <MedLamaLearnLogo />
              <Link href="/quiz">
                <Button variant="ghost" size="sm" className="h-9 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quizzes
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Results */}
        <main className="max-w-4xl mx-auto px-4 py-16">
          <Card className="p-8 text-center">
            <div className="mb-8">
              <div className={`text-6xl font-bold mb-4 ${getScoreColor(quizState.score, quizState.questions.length)}`}>
                {quizState.score}/{quizState.questions.length}
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {percentage}% Correct
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {selectedTopic} Quiz Complete
              </div>
            </div>

            <div className="mb-8">
              <Progress value={percentage} className="h-3 mb-4" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {percentage >= 80 ? '🎉 Excellent work!' : 
                 percentage >= 60 ? '👍 Good job!' : 
                 '📚 Keep studying!'}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={resetQuiz} variant="outline" className="px-6">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
              <Link href="/learn">
                <Button className="px-6 bg-blue-600 hover:bg-blue-700">
                  Continue Learning
                </Button>
              </Link>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  if (quizState) {
    const currentQ = quizState.questions[quizState.currentQuestion]
    const progress = ((quizState.currentQuestion + 1) / quizState.questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <MedLamaLearnLogo />
              <Link href="/quiz">
                <Button variant="ghost" size="sm" className="h-9 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quizzes
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Quiz */}
        <main className="max-w-4xl mx-auto px-4 py-16">
          <Card className="p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedTopic} Quiz
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Question {quizState.currentQuestion + 1} of {quizState.questions.length}
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {currentQ.question}
              </h3>
              
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full justify-start p-4 h-auto text-left ${
                      selectedAnswer === index
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <span className="font-medium mr-3">{String.fromCharCode(65 + index)})</span>
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {selectedAnswer !== null && (
              <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  {selectedAnswer === currentQ.correct ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {selectedAnswer === currentQ.correct ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                {quizState.currentQuestion + 1 >= quizState.questions.length ? 'Finish Quiz' : 'Next Question'}
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
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
                    variant={item.name === 'Quiz' ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-9 px-4 ${
                      item.name === 'Quiz' 
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
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Medical Knowledge Quizzes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Test your medical knowledge with AI-generated quizzes. Choose a topic and challenge yourself!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizTopics.map((topic) => (
            <Card key={topic.title} className={`p-6 ${topic.color} hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
              <div className="flex items-start gap-4">
                <div className="text-4xl">{topic.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{topic.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {topic.questions} questions • {topic.difficulty}
                    </span>
                  </div>
                  <Button
                    onClick={() => startQuiz(topic.title)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Start Quiz
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
