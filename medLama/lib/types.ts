export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  messageType?: "text" | "analysis" | "tip" | "recommendation";
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  date: Date;
  messages: Message[];
  symptoms?: string[];
  severity?: "low" | "moderate" | "high";
}

export interface SymptomAnalysis {
  severity: "low" | "moderate" | "high";
  report: string;
  recommendations?: string[];
  nextSteps?: string[];
  riskFactors?: string[];
}

export interface Doctor {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  address: string;
  rating?: number;
  availability?: string;
  distance?: number;
}

export interface EmergencyFacility {
  name: string;
  type: "hospital" | "urgentCare" | "clinic";
  address: string;
  phone: string;
  distance?: number;
  emergencyServices?: string[];
}

export interface SymptomSuggestion {
  id: string;
  name: string;
  category: string;
  relatedSymptoms: string[];
  bodyPart?: string;
}

export interface HealthTip {
  id: string;
  content: string;
  category: string;
  type: "prevention" | "treatment" | "lifestyle";
}

export interface Analytics {
  totalConsultations: number;
  mostCommonSymptoms: string[];
  averageSeverity: string;
  dailyStats: Record<string, number>;
}