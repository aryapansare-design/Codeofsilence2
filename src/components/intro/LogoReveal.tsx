import { useEffect } from "react";
import csiLogoAsset from "@/assets/csi-kjsit-logo.png.asset.json";
const csiLogo = csiLogoAsset.url;

interface LogoRevealProps {
  onComplete: () => void;
}

export const LogoReveal = ({ onComplete }: LogoRevealProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* CSI KJSIT Logo */}
      <div className="relative z-10 text-center animate-scale-in">
        <div className="animate-pulse-soft">
          <img 
            src={csiLogo} 
            alt="CSI KJSIT Logo" 
            className="w-64 h-64 mx-auto mb-8 drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(0, 70, 140, 0.5))',
            }}
          />
        </div>
        
        {/* Official Stamp Effect */}
        <div className="font-body text-xl text-muted-foreground tracking-widest uppercase animate-fade-in"
          style={{
            animationDelay: '0.5s',
          }}>
          Official Investigation
        </div>
        
        {/* Typewriter Effect Lines */}
        <div className="mt-4 flex justify-center gap-1 animate-fade-in"
          style={{
            animationDelay: '1s',
          }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 bg-primary rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Scan Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 4px)',
          animation: 'scanlines 8s linear infinite',
        }}
      />
    </div>
  );
};
