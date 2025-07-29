"use client"

import { useScroll, useTransform, motion } from "framer-motion"
import Image from "next/image"

export function ParallaxBackground() {
  const { scrollYProgress } = useScroll()
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"></div>

      {/* Layer 1: Farthest background - subtle molecules */}
      <motion.div className="absolute inset-0" style={{ y: y1 }}>
        <Image
          src="/images/parallax-bg-1.png"
          alt="Molecular background"
          layout="fill"
          objectFit="cover"
          className="opacity-10"
        />
      </motion.div>

      {/* Layer 2: Mid-ground - glassware silhouettes */}
      <motion.div className="absolute inset-0" style={{ y: y2 }}>
        <Image
          src="/images/parallax-bg-2.png"
          alt="Laboratory glassware silhouettes"
          layout="fill"
          objectFit="cover"
          className="opacity-5"
        />
      </motion.div>
    </div>
  )
}
