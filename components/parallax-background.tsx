"use client"

import type React from "react"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"

interface ParallaxBackgroundProps {
  image1: string
  image2: string
  children: React.ReactNode
}

export function ParallaxBackground({ image1, image2, children }: ParallaxBackgroundProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y1 = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])
  const y2 = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"])

  return (
    <div ref={ref} className="relative w-full h-screen overflow-hidden">
      <motion.div className="absolute inset-0 z-0" style={{ y: y1 }}>
        <Image
          src={image1 || "/placeholder.svg"}
          alt="Parallax Background Layer 1"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />
      </motion.div>
      <motion.div className="absolute inset-0 z-10" style={{ y: y2 }}>
        <Image
          src={image2 || "/placeholder.svg"}
          alt="Parallax Background Layer 2"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />
      </motion.div>
      <div className="relative z-20 flex items-center justify-center h-full">{children}</div>
    </div>
  )
}
