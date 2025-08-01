"use client"

import { useEffect, useRef } from "react"

export function ParallaxBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const scrolled = window.pageYOffset
      const parallax = scrolled * 0.5

      containerRef.current.style.transform = `translateY(${parallax}px)`
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 w-full h-[120%]">
        {/* Laboratory Grid Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Floating Laboratory Equipment */}
        <div className="absolute inset-0">
          {/* Beaker 1 */}
          <div className="absolute top-20 left-10 animate-float">
            <svg width="60" height="80" viewBox="0 0 60 80" className="text-blue-300 opacity-30">
              <path
                d="M15 20 L15 50 Q15 65 30 65 Q45 65 45 50 L45 20 Z"
                fill="currentColor"
                stroke="rgba(59, 130, 246, 0.5)"
                strokeWidth="2"
              />
              <path d="M15 20 L45 20" stroke="rgba(59, 130, 246, 0.7)" strokeWidth="3" />
              <circle cx="30" cy="40" r="3" fill="rgba(34, 197, 94, 0.6)" />
            </svg>
          </div>

          {/* Test Tube 1 */}
          <div className="absolute top-32 right-20 animate-float-delayed">
            <svg width="20" height="100" viewBox="0 0 20 100" className="text-green-300 opacity-40">
              <rect
                x="6"
                y="10"
                width="8"
                height="80"
                rx="4"
                fill="currentColor"
                stroke="rgba(34, 197, 94, 0.5)"
                strokeWidth="1"
              />
              <rect x="6" y="70" width="8" height="20" fill="rgba(34, 197, 94, 0.6)" />
              <circle cx="10" cy="8" r="3" fill="rgba(59, 130, 246, 0.7)" />
            </svg>
          </div>

          {/* Microscope */}
          <div className="absolute bottom-40 left-1/4 animate-float-slow">
            <svg width="80" height="100" viewBox="0 0 80 100" className="text-indigo-300 opacity-25">
              <rect x="30" y="80" width="20" height="15" fill="currentColor" />
              <rect x="35" y="40" width="10" height="40" fill="currentColor" />
              <circle cx="40" cy="35" r="15" fill="none" stroke="currentColor" strokeWidth="3" />
              <circle cx="40" cy="35" r="8" fill="rgba(59, 130, 246, 0.3)" />
              <rect x="20" y="20" width="40" height="8" fill="currentColor" />
            </svg>
          </div>

          {/* Molecular Structure 1 */}
          <div className="absolute top-1/3 left-1/3 animate-spin-slow">
            <svg width="120" height="120" viewBox="0 0 120 120" className="text-cyan-300 opacity-20">
              <circle cx="60" cy="30" r="8" fill="currentColor" />
              <circle cx="30" cy="70" r="8" fill="currentColor" />
              <circle cx="90" cy="70" r="8" fill="currentColor" />
              <circle cx="60" cy="90" r="8" fill="currentColor" />
              <line x1="60" y1="30" x2="30" y2="70" stroke="currentColor" strokeWidth="2" />
              <line x1="60" y1="30" x2="90" y2="70" stroke="currentColor" strokeWidth="2" />
              <line x1="30" y1="70" x2="60" y2="90" stroke="currentColor" strokeWidth="2" />
              <line x1="90" y1="70" x2="60" y2="90" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          {/* Erlenmeyer Flask */}
          <div className="absolute bottom-20 right-1/4 animate-float">
            <svg width="70" height="90" viewBox="0 0 70 90" className="text-purple-300 opacity-30">
              <path
                d="M25 30 L25 10 L45 10 L45 30 L60 70 Q60 80 35 80 Q10 80 10 70 Z"
                fill="currentColor"
                stroke="rgba(147, 51, 234, 0.5)"
                strokeWidth="2"
              />
              <path d="M25 10 L45 10" stroke="rgba(147, 51, 234, 0.7)" strokeWidth="3" />
              <ellipse cx="35" cy="60" rx="15" ry="8" fill="rgba(147, 51, 234, 0.4)" />
            </svg>
          </div>

          {/* Floating Particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-float-random"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Chemical Formula Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-6xl font-mono text-blue-200 opacity-10 select-none">H₂SO₄ • NaCl • C₆H₁₂O₆</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-2deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float-random {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(3px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-float-random {
          animation: float-random 7s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
