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

const LamaLogo = () => (
  <div className="relative group">
    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-green-500/20 rounded-full blur ai-thinking"></div>
    <div className="relative z-10 rounded-full bg-primary/10 p-2 transition-transform group-hover:scale-110">
      <div className="relative">
        <Bot className="h-6 w-6 text-primary" />
        <Stethoscope className="h-4 w-4 text-primary absolute -top-1 -right-1 transform rotate-45" />
      </div>
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <LamaLogo />
          <div>
            <span className="text-xl font-semibold bg-gradient-to-r from-primary via-green-500 to-emerald-500 bg-clip-text text-transparent">
              MedLama
            </span>
            <span className="text-xs text-muted-foreground block">AI-Powered Health Assistant</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStage(stage === "history" ? "chat" : "history")}
            className="rounded-full hover:bg-secondary/80"
          >
            <Clock className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">History</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full hover:bg-secondary/80"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );

  // History view
  if (stage === "history") {
    return (
      <div className="flex min-h-screen flex-col bg-background hexagon-bg">
        <Header />
        <main className="flex flex-1 flex-col items-center p-4 md:p-8">
          <Card className="w-full max-w-4xl p-6 shadow-lg glass-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                Consultation History
              </h2>
              <Button onClick={createNewConversation} className="rounded-full">
                New Consultation
              </Button>
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No previous consultations found.</p>
                <Button onClick={createNewConversation} className="mt-4">
                  Start your first consultation
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    className="p-4 border rounded-lg hover:bg-secondary/20 cursor-pointer transition-colors"
                    onClick={() => loadConversation(conv.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{conv.title}</h3>
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {conv.lastMessage}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {conv.date.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>
    );
  }

  // Analysis view
  if (stage === "analysis" && analysis) {
    return (
      <div className="flex min-h-screen flex-col bg-background hexagon-bg">
        <Header />
        <main className="flex flex-1 flex-col items-center p-4 md:p-8">
          <Card className="w-full max-w-4xl p-6 shadow-lg glass-card">
            <div className="flex items-center mb-6">
              {/* <Button
                variant="ghost"
                className="mr-2 rounded-full"
                onClick={() => setStage("chat")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chat
              </Button> */}
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                Symptom Analysis
              </h2>
            </div>

            <SeverityIndicator severity={analysis.severity} />

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">AI Analysis Summary</h3>
              <p className="text-muted-foreground">{analysis.report}</p>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Recommended Facilities</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {facilities.map((facility, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-card/50 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Stethoscope className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{facility.name}</h4>
                        <p className="text-xs text-primary">{facility.address}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-s text-primary mb-1">Phone: {facility.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Recommended Specialists</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doctor, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-card/50 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{doctor.name}</h4>
                        <p className="text-xs text-primary">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-s text-primary">Phone: {doctor.phone}</p>
                      <p className="text-s text-primary">Email: {doctor.email}</p>
                    </div>
                    <Button size="sm" className="w-full">
                      Schedule Appointment
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              {/* <Button
                onClick={() => setStage("chat")}
                variant="outline"
              >
                Continue Chat
              </Button> */}
              <Button
                onClick={createNewConversation}
                variant="default"
              >
                New Consultation
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background hexagon-bg">
      <Header />
      <main className="flex flex-1 flex-col items-center p-4 md:p-8">
        <Card className={`flex h-[80vh] w-full max-w-4xl flex-col shadow-lg glass-card transition-opacity duration-300 ${isDimmed ? 'opacity-95' : ''}`}>
          <ScrollArea className="flex-1 p-4 chat-container">
            <div className="space-y-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 message-fade-in ${
                    message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div className={`rounded-full p-2 ${
                    message.role === "assistant"
                      ? "bg-primary/10"
                      : "bg-secondary"
                  }`}>
                    {message.role === "assistant" ? (
                      <Bot className="h-6 w-6 text-primary" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      message.role === "assistant"
                        ? "bg-card/50 border shadow-sm backdrop-blur-sm"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-center gap-2 text-muted-foreground processing">
                  <Bot className="h-5 w-5" />
                  <span>Thinking...</span>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4 space-y-4 bg-background/50 backdrop-blur-sm">
            {showConversationStarters && messages.length <= 2 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Quick start with common concerns:</p>
                <div className="flex flex-wrap gap-2">
                  {conversationStarters.map((starter, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-full"
                      onClick={() => handleStarterSelect(starter)}
                    >
                      {starter}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2"
            >
              <Input
                placeholder="Describe what you're feeling..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-full bg-secondary/50"
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full hover:glow-effect"
                disabled={isProcessing}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {/* {isReadyForAnalysis && (
              <Button
                className="w-full mt-4 rounded-full hover:glow-effect"
                onClick={handleAnalysis}
                variant="default"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Bot className="h-4 w-4 animate-spin" />
                    Analyzing Symptoms...
                  </span>
                ) : (
                  <>
                    Analyze Symptoms
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )} */}

            <Button
              className="w-full mt-4 rounded-full hover:glow-effect"
              onClick={() => alert("Teleconsultation feature coming soon!")}
              variant="outline"
            >
              <span className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Schedule Teleconsultation
              </span>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
