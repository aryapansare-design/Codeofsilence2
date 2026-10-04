import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface TeamIdentificationProps {
  onComplete: (analystName: string, operatorName: string) => void;
}

export const TeamIdentification = ({ onComplete }: TeamIdentificationProps) => {
  const [analystName, setAnalystName] = useState("");
  const [operatorName, setOperatorName] = useState("");

  const handleSubmit = () => {
    if (analystName.trim() && operatorName.trim()) {
      onComplete(analystName.trim(), operatorName.trim());
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center animate-fade-in">
      {/* Corner Glows - Red & Blue */}
      <div 
        className="absolute top-0 left-0 w-96 h-96 bg-red-500/20 rounded-full blur-[120px] animate-pulse"
        style={{ animationDuration: '3s' }}
      />
      <div 
        className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse"
        style={{ animationDuration: '3s', animationDelay: '1.5s' }}
      />
      <div 
        className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-[100px] animate-pulse"
        style={{ animationDuration: '4s', animationDelay: '0.5s' }}
      />

      {/* Subtle Background Pulse */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-transparent to-blue-950/10 animate-pulse"
        style={{ animationDuration: '2s' }}
      />

      {/* Faint Grid Overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 200, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 200, 255, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-6 animate-scale-in">
        {/* Heading */}
        <h1 
          className="font-display text-4xl md:text-5xl font-black text-center mb-3 tracking-tight animate-fade-in"
          style={{
            color: 'white',
            textShadow: '0 0 20px rgba(0, 200, 255, 0.8), 0 0 40px rgba(0, 200, 255, 0.4)',
          }}
        >
          Enter Your Investigation Details
        </h1>

        <p className="text-center text-white/60 font-body text-sm mb-12 animate-fade-in"
          style={{ animationDelay: '0.2s' }}>
          Identify your team before proceeding
        </p>

        {/* Input Fields */}
        <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {/* Analyst Name */}
          <div className="space-y-2">
            <Label 
              htmlFor="analyst" 
              className="font-body text-white/80 text-sm tracking-wide flex items-center gap-2"
            >
              <span className="text-cyan-400">🧑‍💻</span> Analyst Name
            </Label>
            <Input
              id="analyst"
              type="text"
              value={analystName}
              onChange={(e) => setAnalystName(e.target.value)}
              placeholder="Enter analyst name"
              className="h-12 bg-black/50 border-2 border-cyan-500/30 text-white placeholder:text-white/30 font-body
                focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
              style={{
                boxShadow: '0 0 20px rgba(0, 200, 255, 0.1)',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {/* Operator Name */}
          <div className="space-y-2">
            <Label 
              htmlFor="operator" 
              className="font-body text-white/80 text-sm tracking-wide flex items-center gap-2"
            >
              <span className="text-blue-400">👩‍💻</span> Operator Name
            </Label>
            <Input
              id="operator"
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              placeholder="Enter operator name"
              className="h-12 bg-black/50 border-2 border-blue-500/30 text-white placeholder:text-white/30 font-body
                focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
              style={{
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        {/* Start Investigation Button */}
        <Button
          onClick={handleSubmit}
          disabled={!analystName.trim() || !operatorName.trim()}
          className="w-full h-14 mt-10 font-display font-bold text-lg tracking-wide
            bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400
            text-white border-2 border-red-500/50 disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-300 animate-fade-in hover:animate-pulse"
          style={{
            animationDelay: '0.6s',
            boxShadow: '0 0 30px rgba(220, 38, 38, 0.4), 0 4px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          Start Investigation
        </Button>
      </div>

      {/* Corner Grid Accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyan-500/30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-blue-500/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-red-500/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-red-500/30" />
    </div>
  );
};
