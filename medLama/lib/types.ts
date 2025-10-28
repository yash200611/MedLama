export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  date: Date;
  messages: Message[];
}

export interface SymptomAnalysis {
  severity: "low" | "moderate" | "high";
  report: string;
}

export interface Doctor {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  address: string;
}

export interface EmergencyFacility {
  name: string;
  type: "hospital" | "urgentCare" | "clinic";
  address: string;
  phone: string;
}

export interface SymptomSuggestion {
  id: string;
  name: string;
  category: string;
  relatedSymptoms: string[];
  bodyPart?: string;
}