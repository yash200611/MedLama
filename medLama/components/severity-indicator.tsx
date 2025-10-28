import { AlertTriangle, AlertCircle, AlertOctagon, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface SeverityIndicatorProps {
  severity: "low" | "moderate" | "high";
}

export function SeverityIndicator({ severity }: SeverityIndicatorProps) {
  const config = {
    low: {
      icon: AlertCircle,
      title: "Low Risk Assessment",
      description: "Your symptoms suggest a non-urgent condition",
      className: "bg-green-500/10 text-green-500 border-green-500/20",
      progress: 33
    },
    moderate: {
      icon: AlertTriangle,
      title: "Moderate Risk - Medical Attention Advised",
      description: "Your symptoms require medical evaluation",
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      progress: 66
    },
    high: {
      icon: AlertOctagon,
      title: "High Risk - Urgent Care Needed",
      description: "Your symptoms require immediate medical attention",
      className: "bg-red-500/10 text-red-500 border-red-500/20",
      progress: 100
    }
  };

  const { icon: Icon, title, description, className, progress } = config[severity];

  return (
    <div className="space-y-4">
      <Alert className={className}>
        <Icon className="h-5 w-5" />
        <AlertTitle className="flex items-center gap-2">
          {title}
          {severity === "high" && (
            <Clock className="h-4 w-4 animate-pulse" />
          )}
        </AlertTitle>
        <AlertDescription className="mt-2">
          {description}
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Risk Level</span>
          <span className="font-medium">{severity.charAt(0).toUpperCase() + severity.slice(1)}</span>
        </div>
        <Progress
          value={progress}
          className={`h-2 ${
            severity === "low" 
              ? "bg-green-100 [&>div]:bg-green-500" 
              : severity === "moderate"
              ? "bg-yellow-100 [&>div]:bg-yellow-500"
              : "bg-red-100 [&>div]:bg-red-500"
          }`}
        />
      </div>
    </div>
  );
}