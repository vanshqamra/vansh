"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"

interface ParallaxBackgroundProps {
  imageSrc: string
  children: React.ReactNode
  speed?: number // Parallax speed, default to 0.5
  className?: string
}

export default function ParallaxBackground({ imageSrc, children, speed = 0.5, className }: ParallaxBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [offsetY, setOffsetY] = useState(0)

  const handleScroll = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      // Calculate how much of the element is visible in the viewport
      const viewportHeight = window.innerHeight
      const elementTopInViewport = rect.top
      const elementBottomInViewport = rect.bottom

      // Only apply parallax if the element is in or near the viewport
      if (elementBottomInViewport > 0 && elementTopInViewport < viewportHeight) {
        // Calculate scroll position relative to the element's visibility
        // This centers the parallax effect when the element is in the middle of the viewport
        const scrollPosition = (viewportHeight - elementTopInViewport) / viewportHeight
        setOffsetY(scrollPosition * speed * 100) // Adjust multiplier for desired effect
      }
    }
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    handleScroll() // Set initial position
    return () => window.removeEventListener("scroll", handleScroll)
  }, [speed])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div
        className="parallax-bg"
        style={{
          transform: `translateY(${offsetY}px)`,
          backgroundImage: `url(${imageSrc})`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
