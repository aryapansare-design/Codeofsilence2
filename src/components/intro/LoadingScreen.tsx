// @ts-nocheck -- ported verbatim from the original project
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  // human-readable label that many callers pass (e.g. "Dr. Verma's Office")
  locationName?: string;
  // explicit room id (preferred) that maps to the switch in Game.tsx ("verma", "research", "archive", "server")
  roomId?: string;
  locationColor: string;
}

export const LoadingScreen = ({ locationName, locationColor, roomId }: LoadingScreenProps) => {
  const navigate = useNavigate();

  // Normalize: Game.tsx expects the query param to be one of: verma, research, archive, server
  const mapLabelToRoom = (label?: string) => {
    if (!label) return undefined;
    const l = label.toLowerCase();
    if (l.includes('verma') || l.includes('office')) return 'verma';
    if (l.includes('research') || l.includes('lab')) return 'research';
    if (l.includes('archive') || l.includes('archives') || l.includes('personal')) return 'archive';
    if (l.includes('server')) return 'server';
    return undefined;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      // prefer explicit roomId, otherwise try to infer from the human-readable label
      const room = roomId || mapLabelToRoom(locationName) || '';
      navigate({ to: "/game", search: { room } });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, locationName, roomId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Scanning Effect Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent animate-scan" />
      </div>

      {/* Police Lights Effect */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-red-500/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '1.5s' }}
      />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '1.5s', animationDelay: '0.75s' }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-8 px-4">
        {/* Spinning Loader */}
        <div className="flex justify-center">
          <div 
            className="relative"
            style={{
              filter: `drop-shadow(0 0 30px ${locationColor})`
            }}
          >
            <Loader2 
              className="w-20 h-20 animate-spin" 
              style={{ color: locationColor }}
            />
            <div 
              className="absolute inset-0 rounded-full animate-ping opacity-40"
              style={{
                backgroundColor: locationColor,
                animationDuration: '2s'
              }}
            />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-4">
          <h2 
            className="font-display text-3xl md:text-4xl font-bold animate-pulse"
            style={{ 
              color: locationColor,
              textShadow: `0 0 20px ${locationColor}`
            }}
          >
            ACCESSING {locationName.toUpperCase()}
          </h2>
          
          <div className="space-y-2">
            <p className="font-body text-cyan-400 text-lg tracking-wider animate-fade-in">
              Scanning for evidence...
            </p>
            <p className="font-body text-cyan-400 text-lg tracking-wider animate-fade-in"
              style={{ animationDelay: '0.5s' }}>
              Analyzing crime scene...
            </p>
            <p className="font-body text-cyan-400 text-lg tracking-wider animate-fade-in"
              style={{ animationDelay: '1s' }}>
              Loading investigation protocols...
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto">
          <div 
            className="h-2 rounded-full overflow-hidden"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: `1px solid ${locationColor}40`
            }}
          >
            <div 
              className="h-full animate-progress"
              style={{
                backgroundColor: locationColor,
                boxShadow: `0 0 20px ${locationColor}`
              }}
            />
          </div>
        </div>

        {/* System Status */}
        <div className="font-mono text-xs text-green-400 space-y-1 animate-fade-in"
          style={{ animationDelay: '1.5s' }}>
          <p>[SYSTEM] Establishing secure connection...</p>
          <p>[SYSTEM] Encryption level: MAXIMUM</p>
          <p>[SYSTEM] Status: READY</p>
        </div>
      </div>

      {/* Corner Accents */}
      <div 
        className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 opacity-50"
        style={{ borderColor: locationColor }}
      />
      <div 
        className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 opacity-50"
        style={{ borderColor: locationColor }}
      />
      <div 
        className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 opacity-50"
        style={{ borderColor: locationColor }}
      />
      <div 
        className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 opacity-50"
        style={{ borderColor: locationColor }}
      />
    </div>
  );
};
