// Ensure this directive is necessary for client-side rendering
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, ArrowRight, Moon, Sun, Stethoscope, Video, Clock, ArrowLeft } from "lucide-react";
import { SeverityIndicator } from "@/components/severity-indicator";
import { useTheme } from "next-themes";
import type { Doctor, SymptomAnalysis, Message, Conversation, EmergencyFacility } from "@/lib/types";
import { findAvailableDoctors, findNearbyHospitals } from "@/lib/analysis";

type Stage = "chat" | "analysis" | "doctors" | "history";

const MedLamaLearnLogo = () => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
      <div className="relative">
        <Stethoscope className="h-6 w-6 text-white" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
      </div>
    </div>
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        MedLama Learn
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">AI-Powered Medical Tutor</p>
    </div>
  </div>
);

// Educational learning prompts for MedLama Learn
const learningPrompts = [
  "Explain the cardiac cycle step by step",
  "Quiz me on the respiratory system",
  "Create a mind map of the nervous system",
  "How does the immune system work?",
  "Explain the digestive process",
  "What are the main types of blood cells?",
  "How does the endocrine system function?",
  "Create a visual diagram of the heart anatomy"
];

// Learning modules for the dashboard
const learningModules = [
  { id: "concepts", title: "Concepts", icon: "📚", color: "bg-blue-500", description: "Learn medical concepts" },
  { id: "quizzes", title: "Quizzes", icon: "🧠", color: "bg-purple-500", description: "Test your knowledge" },
  { id: "visuals", title: "Visuals", icon: "🎨", color: "bg-green-500", description: "Interactive diagrams" },
  { id: "progress", title: "Progress", icon: "📊", color: "bg-orange-500", description: "Track your learning" }
];

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to MedLama Learn! 🎓 I'm your AI-powered medical tutor. I can help you understand complex medical concepts through interactive explanations, create quizzes to test your knowledge, and generate visual diagrams to make learning easier.\n\nWhat would you like to learn today? Try asking me to explain a medical concept, quiz you on a topic, or create a visual diagram!",
    },
  ]);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<Stage>("chat");
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [facilities, setFacilities] = useState<EmergencyFacility[]>([]);
  const [isReadyForAnalysis, setIsReadyForAnalysis] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDimmed, setIsDimmed] = useState(false);
  const [showConversationStarters, setShowConversationStarters] = useState(true);
  const { theme, setTheme } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsDimmed(isProcessing);
  }, [isProcessing]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load conversations from localStorage on initial load
  useEffect(() => {
    const savedConversations = localStorage.getItem('medlama-conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        // Convert date strings back to Date objects
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          date: new Date(conv.date)
        }));
        setConversations(conversationsWithDates);
      } catch (e) {
        console.error("Error loading conversations:", e);
      }
    }
  }, []);

  // Save conversations to localStorage when they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('medlama-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    try {
      const result = await fetch(`/api/llm/response/?message=${userMessage}`);
      const jsonResponse = await result.json();

      if (jsonResponse.analysis_complete) {
        const severityMatch = jsonResponse.messages.match(/(low|moderate|high)/i);
        const severity = severityMatch
          ? severityMatch[0].toLowerCase()
          : "moderate";

        const result = {
          severity: severity as SymptomAnalysis["severity"],
          report: jsonResponse.messages // Convert the array to a single string
        };

        setAnalysis(result);
        setDoctors(await findAvailableDoctors(""));
        setFacilities(await findNearbyHospitals());

        setStage("analysis");
      }

      return jsonResponse.messages;
    } catch (err) {
      console.error(err);
      return "An error occurred while generating the response.";
    }
  };

  const createNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: "New Consultation",
      lastMessage: "Started a new health consultation",
      date: new Date(),
      messages: [
        {
          role: "assistant",
          content: "Hello! I'm your AI health assistant powered by Gemini and Perplexity. How can I help you today? Feel free to describe any symptoms or health concerns you're experiencing.",
        }
      ]
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newId);
    setMessages(newConversation.messages);
    setStage("chat");
    setIsReadyForAnalysis(false);
    setAnalysis(null);
    setShowConversationStarters(true);
  };

  const handleStarterSelect = (starter: string) => {
    setInput(starter);
    setShowConversationStarters(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    setShowConversationStarters(false);

    // Determine a contextual response based on the user's message
    const aiResponse = {
      role: "assistant" as const,
      content: generateResponse(input)
    };

    // Update conversation in storage
    if (currentConversationId) {
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === currentConversationId) {
            // Extract first 30 characters for title if this is the first user message
            const isFirstMessage = conv.messages.filter(m => m.role === "user").length === 0;
            return {
              ...conv,
              title: isFirstMessage ? input.substring(0, 30) + (input.length > 30 ? "..." : "") : conv.title,
              lastMessage: input,
              messages: [...conv.messages, userMessage],
              date: new Date()
            };
          }
          return conv;
        });
      });
    } else {
      // Create new conversation if one doesn't exist
      const newId = Date.now().toString();
      const newConversation: Conversation = {
        id: newId,
        title: input.substring(0, 30) + (input.length > 30 ? "..." : ""),
        lastMessage: input,
        date: new Date(),
        messages: [messages[0], userMessage]
      };

      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newId);
    }

    // After 2 exchanges, show the analysis button
    setTimeout(async () => {
      const resolvedContent = await aiResponse.content;
      setMessages((prev) => [...prev, { ...aiResponse, content: resolvedContent }]);
      setIsProcessing(false);

      // Update the conversation with the AI response
      if (currentConversationId) {
        setConversations(prev => {
          return prev.map(conv => {
            if (conv.id === currentConversationId) {
              return {
                ...conv,
                messages: [...conv.messages, { ...aiResponse, content: resolvedContent }],
              };
            }
            return conv;
          });
        });
      }

      // After a few exchanges, suggest analysis
      const userMessageCount = messages.filter(m => m.role === "user").length;
      if (userMessageCount >= 1) {
        setIsReadyForAnalysis(true);
      }
    }, 1000);
  };

  const handleAnalysis = async () => {
    setIsProcessing(true);
    const symptoms = messages
      .filter((msg) => msg.role === "user")
      .map((msg) => msg.content)
      .join(" ");

    try {
      // Simulated analysis result - in a real app, this would come from a backend
      const severityMatch = messages[messages.length - 1].content.match(/(low|moderate|high)/i);
        const severity = severityMatch
          ? severityMatch[0].toLowerCase()
          : "moderate";

      const result = {
        severity: severity as SymptomAnalysis["severity"],
        report: messages[messages.length - 1].content
      };

      setAnalysis(result);
      setDoctors(await findAvailableDoctors(""));
      setFacilities(await findNearbyHospitals());
      // Add a slight delay to simulate processing and make it feel interactive
      setTimeout(() => {
        setStage("analysis");
      }, 500);

      // Add a subtle animation to indicate transition
      document.body.classList.add("transitioning");
      setTimeout(() => {
        document.body.classList.remove("transitioning");
      }, 1000);

      setStage("analysis");
    } catch (error) {
      console.error("Error analyzing symptoms or finding doctors:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConversationId(conversationId);
      setStage("chat");
      setIsReadyForAnalysis(true);
      setShowConversationStarters(false);
    }
  };

  const Header = () => (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <MedLamaLearnLogo />
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
              Home
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
              Learn
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
              Quiz
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
              Visuals
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
              Dashboard
            </Button>
          </nav>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStage(stage === "history" ? "chat" : "history")}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Clock className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );

  // History view
  if (stage === "history") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Consultation History
              </h2>
              <Button 
                onClick={createNewConversation} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                New Consultation
              </Button>
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No consultations yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start your first health consultation to see your history here.
                </p>
                <Button 
                  onClick={createNewConversation} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Start First Consultation
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => loadConversation(conv.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {conv.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {conv.lastMessage}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">
                        {conv.date.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Analysis view
  if (stage === "analysis" && analysis) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Symptom Analysis
              </h2>
              <SeverityIndicator severity={analysis.severity} />
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Analysis Summary</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{analysis.report}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recommended Facilities</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {facilities.map((facility, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{facility.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{facility.address}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {facility.phone}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recommended Specialists</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doctor, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{doctor.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {doctor.phone}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email: {doctor.email}</p>
                    </div>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Schedule Appointment
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={createNewConversation}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                New Consultation
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            MedLama Learn
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Your AI-Powered Medical Tutor. Learn medicine through conversations, quizzes, and mind maps.
          </p>
          
          {/* Learning Modules Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {learningModules.map((module) => (
              <div key={module.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200 dark:border-gray-700">
                <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center text-2xl mb-3 mx-auto`}>
                  {module.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{module.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Learning Interface */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          {/* Chat Messages Area */}
          <div className="h-[60vh] overflow-y-auto p-8">
            <div className="space-y-6">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex gap-4 ${
                    message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === "assistant"
                      ? "bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900"
                      : "bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900"
                  }`}>
                    {message.role === "assistant" ? (
                      <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`flex-1 max-w-4xl ${
                    message.role === "assistant" ? "" : "text-right"
                  }`}>
                    <div className={`inline-block px-6 py-4 rounded-2xl ${
                      message.role === "assistant"
                        ? "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Processing Indicator */}
              {isProcessing && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-6 py-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm font-medium">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={scrollRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            
            {/* Learning Prompts */}
            {showConversationStarters && messages.length <= 2 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Try these learning prompts:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {learningPrompts.map((prompt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto p-4 bg-white dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-600 text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-300"
                      onClick={() => handleStarterSelect(prompt)}
                    >
                      <span className="text-sm">{prompt}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Ask me to explain a medical concept, quiz you, or create a visual diagram..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full pr-14 py-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                  disabled={isProcessing}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg px-4 py-2 shadow-lg"
                  disabled={isProcessing || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Difficulty Slider */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Explain like I'm:</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs">5 years old</Button>
                <Button variant="outline" size="sm" className="text-xs">High school student</Button>
                <Button variant="outline" size="sm" className="text-xs">Medical student</Button>
                <Button variant="outline" size="sm" className="text-xs">Doctor</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

