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

const MedLamaLogo = () => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <Stethoscope className="h-5 w-5 text-white" />
    </div>
    <div>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">MedLama</h1>
      <p className="text-xs text-gray-500 dark:text-gray-400">AI Health Assistant</p>
    </div>
  </div>
);

// Sample conversation starters to make the chat more interactive
const conversationStarters = [
  "I've been having chest pain for the last few days.",
  "My throat feels sore and I have a slight fever.",
  "I've been getting headaches more frequently lately.",
  "My skin has developed a rash that won't go away.",
  "I'm feeling unusually tired all the time."
];

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI health assistant powered by Gemini and Perplexity. How can I help you today? Feel free to describe any symptoms or health concerns you're experiencing.",
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
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <MedLamaLogo />
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Main Chat Interface */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          {/* Chat Messages Area */}
          <div className="h-[70vh] overflow-y-auto p-6">
            <div className="space-y-6">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex gap-4 ${
                    message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === "assistant"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}>
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`flex-1 max-w-3xl ${
                    message.role === "assistant" ? "" : "text-right"
                  }`}>
                    <div className={`inline-block px-4 py-3 rounded-2xl ${
                      message.role === "assistant"
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        : "bg-blue-600 text-white"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Processing Indicator */}
              {isProcessing && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={scrollRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
            
            {/* Conversation Starters */}
            {showConversationStarters && messages.length <= 2 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Common health concerns:</p>
                <div className="flex flex-wrap gap-2">
                  {conversationStarters.map((starter, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600"
                      onClick={() => handleStarterSelect(starter)}
                    >
                      {starter}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  placeholder="Describe your symptoms or health concerns..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full pr-12 py-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3"
                  disabled={isProcessing || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Additional Actions */}
            <div className="mt-3 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert("Teleconsultation feature coming soon!")}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-gray-600"
              >
                <Video className="h-4 w-4 mr-2" />
                Schedule Teleconsultation
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

