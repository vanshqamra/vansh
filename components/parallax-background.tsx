"use client"

import { useEffect, useState } from "react"

export function ParallaxBackground() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base Laboratory Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />

      {/* Laboratory Equipment Silhouettes */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M20 20h10v60h-10z'/%3E%3Ccircle cx='25' cy='15' r='8'/%3E%3Cpath d='M50 30h20v40h-20z'/%3E%3Ccircle cx='60' cy='25' r='6'/%3E%3Cpath d='M80 40h8v30h-8z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Molecular Structure Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' strokeWidth='1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='60' cy='20' r='4'/%3E%3Ccircle cx='90' cy='30' r='4'/%3E%3Ccircle cx='45' cy='60' r='4'/%3E%3Ccircle cx='75' cy='60' r='4'/%3E%3Cline x1='30' y1='30' x2='60' y2='20'/%3E%3Cline x1='60' y1='20' x2='90' y2='30'/%3E%3Cline x1='30' y1='30' x2='45' y2='60'/%3E%3Cline x1='90' y1='30' x2='75' y2='60'/%3E%3Cline x1='45' y1='60' x2='75' y2='60'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "150px 150px",
        }}
      />

      {/* Floating Laboratory Elements */}
      <div className="absolute inset-0">
        {/* Beaker */}
        <div
          className="absolute top-1/4 left-1/6 w-16 h-20 opacity-20"
          style={{
            transform: `translate(${scrollY * 0.1}px, ${Math.sin(scrollY * 0.01) * 10}px)`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-b from-transparent via-blue-300/30 to-blue-400/40 rounded-b-lg border-2 border-white/20">
            <div className="w-8 h-2 bg-white/20 mx-auto mt-2 rounded"></div>
          </div>
        </div>

        {/* Test Tube */}
        <div
          className="absolute top-1/3 right-1/4 w-4 h-16 opacity-25"
          style={{
            transform: `translate(${-scrollY * 0.15}px, ${Math.cos(scrollY * 0.01) * 15}px)`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-b from-transparent via-green-300/30 to-green-400/40 rounded-b-full border border-white/20">
            <div className="w-full h-2 bg-white/20 rounded-t"></div>
          </div>
        </div>

        {/* Erlenmeyer Flask */}
        <div
          className="absolute bottom-1/3 left-1/3 w-12 h-16 opacity-20"
          style={{
            transform: `translate(${scrollY * 0.08}px, ${Math.sin(scrollY * 0.008) * 8}px)`,
          }}
        >
          <div
            className="w-full h-full bg-gradient-to-b from-transparent via-purple-300/30 to-purple-400/40 rounded-b-lg border-2 border-white/20"
            style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)" }}
          >
            <div className="w-4 h-3 bg-white/20 mx-auto rounded"></div>
          </div>
        </div>

        {/* Microscope */}
        <div
          className="absolute top-1/2 right-1/6 w-20 h-24 opacity-15"
          style={{
            transform: `translate(${-scrollY * 0.12}px, ${Math.cos(scrollY * 0.009) * 12}px)`,
          }}
        >
          <div className="relative w-full h-full">
            <div className="absolute bottom-0 w-full h-4 bg-white/20 rounded"></div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2 h-12 bg-white/20 rounded"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          transform: `translate(${scrollY * 0.05}px, ${scrollY * 0.05}px)`,
        }}
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  )
}
