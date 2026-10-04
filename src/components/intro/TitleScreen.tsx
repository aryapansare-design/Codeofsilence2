import { useEffect, useState } from "react";
import grungeBackgroundAsset from "@/assets/grunge-background.jpg.asset.json";
const grungeBackground = grungeBackgroundAsset.url;
import bloodSplatter1Asset from "@/assets/blood-splatter-1.png.asset.json";
const bloodSplatter1 = bloodSplatter1Asset.url;
import bloodSplatter2Asset from "@/assets/blood-splatter-2.png.asset.json";
const bloodSplatter2 = bloodSplatter2Asset.url;
import bloodDripsAsset from "@/assets/blood-drips.png.asset.json";
const bloodDrips = bloodDripsAsset.url;

interface TitleScreenProps {
  onComplete: () => void;
}

export const TitleScreen = ({ onComplete }: TitleScreenProps) => {
  const [magnifyPosition, setMagnifyPosition] = useState({ x: -10, y: 40 }); // Start off-screen left
  const [magnifyScale, setMagnifyScale] = useState(1.5);
  const [lensRadius, setLensRadius] = useState(55);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 9500); // Allow full sequence including zoom out

    let step = 0;
    const interval = setInterval(() => {
      step++;
      // Investigative sequence with even timing: CODE (0-55) -> OF (56-95) -> transition (96-120) -> SILENCE (121-190) -> zoom out (191-230)
      if (step <= 55) {
        // Investigate "CODE" - smooth detective scan
        const progress = step / 55;
        const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress; // Ease in-out
        const x = -10 + (eased * 36); // -10 -> 26
        setMagnifyPosition({ x, y: 40 });
        setMagnifyScale(1.5);
        setLensRadius(55);
      } else if (step <= 95) {
        // Investigate "OF" - careful focus
        const progress = (step - 55) / 40;
        const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        const x = 26 + (eased * 18); // 26 -> 44
        setMagnifyPosition({ x, y: 40 });
        setMagnifyScale(1.5);
        setLensRadius(55);
      } else if (step <= 120) {
        // Smooth transition down to "SILENCE" - deliberate movement
        const progress = (step - 95) / 25;
        const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        const x = 44 - (eased * 10); // 44 -> 34
        const y = 40 + (eased * 25); // 40 -> 65
        setMagnifyPosition({ x, y });
        setMagnifyScale(1.5);
        setLensRadius(55);
      } else if (step <= 190) {
        // Investigate "SILENCE" - methodical scan across each letter
        const progress = (step - 120) / 70;
        const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        const x = 34 + (eased * 28); // 34 -> 62
        setMagnifyPosition({ x, y: 65 });
        setMagnifyScale(1.5);
        setLensRadius(55);
      } else if (step <= 230) {
        // Detective steps back - smooth reveal of the complete evidence
        const progress = (step - 190) / 40;
        const eased = progress * progress * (3 - 2 * progress); // Smooth ease-out
        // Move to center
        const x = 62 - (eased * 12); // 62 -> 50
        const y = 65 - (eased * 12.5); // 65 -> 52.5
        setMagnifyPosition({ x, y });
        // Reduce magnification smoothly
        setMagnifyScale(1.5 - (eased * 0.5)); // 1.5 -> 1.0
        // Expand lens to reveal everything
        setLensRadius(55 + (eased * 445)); // 55 -> 500
      } else {
        // Full reveal - case closed
        setMagnifyPosition({ x: 50, y: 52.5 });
        setMagnifyScale(1.0);
        setLensRadius(500);
      }
    }, 40); // Smooth investigative pace

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-200 animate-fade-in">
      {/* Light Grunge Concrete Background */}
      <div 
        className="absolute inset-0 z-0 opacity-80"
        style={{
          backgroundImage: `url(${grungeBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(1.8) contrast(1.1) saturate(0.3)',
        }}
      />
      
      {/* Concrete Texture Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-stone-300/60 via-stone-200/50 to-stone-400/60" />
      
      {/* Static Interference */}
      <div className="absolute inset-0 z-[1] opacity-10 animate-scanlines pointer-events-none" 
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
        }}
      />
      
      {/* Realistic Blood Splatter Overlays - Layered */}
      <div 
        className="absolute top-10 left-20 z-[2] w-96 h-96 opacity-85 mix-blend-darken animate-pulse"
        style={{
          backgroundImage: `url(${bloodSplatter1})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          animationDuration: '4s',
          filter: 'contrast(1.3) saturate(1.2)',
        }}
      />
      <div 
        className="absolute bottom-20 right-32 z-[2] w-[500px] h-[500px] opacity-75 mix-blend-darken"
        style={{
          backgroundImage: `url(${bloodSplatter2})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          filter: 'contrast(1.4) saturate(1.3) brightness(0.9)',
        }}
      />
      <div 
        className="absolute top-0 right-24 z-[2] w-48 h-[600px] opacity-70 mix-blend-darken"
        style={{
          backgroundImage: `url(${bloodDrips})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          filter: 'contrast(1.3) saturate(1.2)',
        }}
      />
      {/* Additional Blood Smears */}
      <div 
        className="absolute top-1/4 left-1/4 z-[2] w-64 h-64 opacity-60 mix-blend-darken"
        style={{
          backgroundImage: `url(${bloodSplatter1})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          transform: 'rotate(180deg)',
          filter: 'contrast(1.2) blur(1px)',
        }}
      />
      <div 
        className="absolute bottom-32 left-40 z-[2] w-40 h-96 opacity-65 mix-blend-darken"
        style={{
          backgroundImage: `url(${bloodDrips})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          transform: 'rotate(15deg)',
          filter: 'contrast(1.3)',
        }}
      />
      
      {/* Dust and Smoke Particles */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: `rgba(100, 100, 100, ${0.1 + Math.random() * 0.2})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center relative">
          {/* Main Title with Embossed Effect and Glitch */}
          <div className="relative inline-block">
            <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight relative">
              <span className="block"
                style={{
                  color: '#5c0f0f',
                  textShadow: `
                    2px 2px 0px rgba(255, 255, 255, 0.3),
                    -1px -1px 0px rgba(0, 0, 0, 0.7),
                    4px 4px 8px rgba(0, 0, 0, 0.6),
                    0 0 20px rgba(139, 0, 0, 0.4),
                    inset 2px 2px 4px rgba(255, 255, 255, 0.2)
                  `,
                  WebkitTextStroke: '2px rgba(70, 10, 10, 0.5)',
                  filter: 'drop-shadow(0 0 15px rgba(139, 0, 0, 0.6))',
                  background: 'linear-gradient(145deg, #6b1515 0%, #3d0808 50%, #5c0f0f 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'flicker 0.3s infinite alternate, glitch 2s infinite',
                }}>
                CODE OF
              </span>
              <span className="block mt-2"
                style={{
                  color: '#5c0f0f',
                  textShadow: `
                    2px 2px 0px rgba(255, 255, 255, 0.3),
                    -1px -1px 0px rgba(0, 0, 0, 0.7),
                    4px 4px 8px rgba(0, 0, 0, 0.6),
                    0 0 20px rgba(139, 0, 0, 0.4)
                  `,
                  WebkitTextStroke: '2px rgba(70, 10, 10, 0.5)',
                  filter: 'drop-shadow(0 0 15px rgba(139, 0, 0, 0.6))',
                  background: 'linear-gradient(145deg, #6b1515 0%, #3d0808 50%, #5c0f0f 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'flicker 0.4s infinite alternate, glitch 2.5s infinite',
                }}>
                SILENCE
              </span>
            </h1>
            
            {/* Magnified Text Layer - Shows zoomed text through magnifying glass */}
            <div 
              className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
              style={{
                clipPath: `circle(${lensRadius}px at ${magnifyPosition.x}% ${magnifyPosition.y}%)`,
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <h1 
                  className="font-display text-4xl md:text-6xl font-black tracking-tight text-center transition-transform duration-500 ease-out"
                  style={{
                    transform: `scale(${magnifyScale})`,
                    transformOrigin: `${magnifyPosition.x}% ${magnifyPosition.y}%`,
                  }}
                >
                  <span className="block"
                    style={{
                      color: '#5c0f0f',
                      textShadow: `
                        2px 2px 0px rgba(255, 255, 255, 0.4),
                        -1px -1px 0px rgba(0, 0, 0, 0.8),
                        4px 4px 8px rgba(0, 0, 0, 0.7),
                        0 0 25px rgba(139, 0, 0, 0.5)
                      `,
                      WebkitTextStroke: '2px rgba(70, 10, 10, 0.6)',
                      filter: 'drop-shadow(0 0 20px rgba(139, 0, 0, 0.7)) brightness(1.3) contrast(1.3)',
                      background: 'linear-gradient(145deg, #6b1515 0%, #3d0808 50%, #5c0f0f 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                    CODE OF
                  </span>
                  <span className="block mt-2"
                    style={{
                      color: '#5c0f0f',
                      textShadow: `
                        2px 2px 0px rgba(255, 255, 255, 0.4),
                        -1px -1px 0px rgba(0, 0, 0, 0.8),
                        4px 4px 8px rgba(0, 0, 0, 0.7),
                        0 0 25px rgba(139, 0, 0, 0.5)
                      `,
                      WebkitTextStroke: '2px rgba(70, 10, 10, 0.6)',
                      filter: 'drop-shadow(0 0 20px rgba(139, 0, 0, 0.7)) brightness(1.3) contrast(1.3)',
                      background: 'linear-gradient(145deg, #6b1515 0%, #3d0808 50%, #5c0f0f 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                    SILENCE
                  </span>
                </h1>
              </div>
            </div>
            
            {/* Detective Spotlight Glow - Subtle investigation light */}
            <div 
              className="absolute pointer-events-none transition-all duration-500 ease-out"
              style={{
                left: `${magnifyPosition.x}%`,
                top: `${magnifyPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                width: '220px',
                height: '220px',
                background: 'radial-gradient(circle, rgba(139, 0, 0, 0.15) 0%, rgba(139, 0, 0, 0.08) 40%, transparent 70%)',
                opacity: lensRadius > 100 ? Math.max(0, 1 - (lensRadius - 100) / 400) : 0.6,
                filter: 'blur(20px)',
              }}
            />
            
            {/* Magnifying Glass Frame - Moves across text */}
            <div 
              className="absolute w-[150px] h-[150px] pointer-events-none transition-all duration-500 ease-out"
              style={{
                left: `${magnifyPosition.x}%`,
                top: `${magnifyPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                opacity: lensRadius > 100 ? Math.max(0, 1 - (lensRadius - 100) / 400) : 1,
              }}
            >
              <div className="relative w-full h-full" style={{
                animation: 'float 3s ease-in-out infinite',
              }}>
                {/* Realistic Metal Rim and Glass Lens */}
                <div className="absolute inset-0 rounded-full border-[10px] shadow-2xl"
                  style={{
                    borderColor: '#4a5568',
                    background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02) 60%)',
                    boxShadow: `
                      0 0 0 2px #2d3748,
                      0 0 50px rgba(0, 0, 0, 0.8),
                      inset 0 0 30px rgba(0, 0, 0, 0.3),
                      inset -5px -5px 20px rgba(255, 255, 255, 0.1)
                    `,
                    backdropFilter: 'blur(1px)',
                  }}>
                  {/* Glass Reflection Effects */}
                  <div className="absolute top-8 left-8 w-20 h-20 bg-white/30 rounded-full blur-2xl" />
                  <div className="absolute top-16 right-12 w-10 h-10 bg-white/15 rounded-full blur-lg" />
                  <div className="absolute bottom-10 left-16 w-8 h-8 bg-white/10 rounded-full blur-md" />
                </div>
                {/* Metal Handle */}
                <div className="absolute bottom-[-35px] right-[-25px] w-3 h-20 rounded-full transform rotate-45 shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
                    boxShadow: '-2px -2px 5px rgba(255, 255, 255, 0.1), 2px 2px 8px rgba(0, 0, 0, 0.8)',
                  }}
                />
                <div className="absolute bottom-[-52px] right-[-34px] w-4 h-12 rounded-full transform rotate-45"
                  style={{
                    background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Blood Splatter Over Text - Multiple Layers */}
          <div 
            className="absolute top-1/3 left-0 w-48 h-48 opacity-80 mix-blend-darken pointer-events-none z-20"
            style={{
              backgroundImage: `url(${bloodSplatter1})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              transform: 'rotate(45deg)',
              filter: 'contrast(1.3) saturate(1.2)',
            }}
          />
          <div 
            className="absolute top-1/2 right-10 w-56 h-56 opacity-70 mix-blend-darken pointer-events-none z-20"
            style={{
              backgroundImage: `url(${bloodSplatter2})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              transform: 'rotate(-20deg)',
              filter: 'contrast(1.4) saturate(1.3)',
            }}
          />
          
          {/* Subtitle */}
          <p className="font-body text-xl md:text-2xl mt-8 tracking-widest uppercase animate-fade-in"
            style={{
              color: '#3d0808',
              textShadow: '1px 1px 2px rgba(255, 255, 255, 0.3), 2px 2px 6px rgba(0, 0, 0, 0.6)',
              animationDelay: '0.5s',
              fontWeight: '600',
            }}>
            A Murder Mystery
          </p>
          
          {/* Dramatic Underline */}
          <div className="flex items-center justify-center gap-4 mt-6 animate-fade-in"
            style={{ animationDelay: '1s' }}>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[hsl(var(--blood-red))] to-transparent" />
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--blood-red))] shadow-glow-red" 
              style={{
                boxShadow: '0 0 10px hsl(var(--blood-red))',
              }}
            />
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[hsl(var(--blood-red))] to-transparent" />
          </div>
        </div>
      </div>
      
      {/* Low-Key Lighting Vignette */}
      <div className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 50% 30%, transparent 20%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.6) 100%),
            linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.4) 100%)
          `,
        }}
      />
    </div>
  );
};
