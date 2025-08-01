"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"

const offers = [
  {
    title: "Free Apron!",
    description: "Get a free lab apron on all orders over ₹25,000!",
    img: "/images/offer-apron.png",
  },
  {
    title: "Bulk Discount on Solvents",
    description: "10% off on orders of 1000L or more of any solvent.",
    img: "/images/offer-solvents.png",
  },
  {
    title: "Free Shipping on Rankem",
    description: "Enjoy free shipping on all Rankem brand orders above ₹10,000.",
    img: "https://ucarecdn.com/2184bbb3-7dd0-484b-aa5a-0be02f721550/-/preview/900x650/",
  },
  {
    title: "15% Off Whatman Filters",
    description: "Get 15% off on genuine Whatman filter papers — perfect for lab use.",
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cellulose_filter_paper_quantitative_hardened_low_ash_grade_50_13890-m08jan21_5_1200x1200.jpg-IMPmkpUd73OqsMPSUW5859nkiMYovp.jpeg",
  },
  {
    title: "New Borosil Glassware",
    description: "Explore the latest 2025 Borosil catalog — special intro prices!",
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1a-1.jpg-uPlgGFUrUaBGN2tIcVUaSWjA34OMBx.jpeg",
  },
]

export function OffersCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Carousel className="w-full max-w-4xl mx-auto">
      <CarouselContent style={{ transform: `translateX(-${currentIndex * 100}%)`, transition: "transform 0.5s ease" }}>
        {offers.map((offer, index) => (
          <CarouselItem key={index} className="basis-full shrink-0 grow-0">
            <Card className="overflow-hidden">
              <CardContent className="relative flex aspect-video items-center justify-center p-0">
                <Image src={offer.img || "/placeholder.svg"} alt={offer.title} fill style={{ objectFit: "cover" }} />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 text-center text-white p-6">
                  <h3 className="text-3xl font-bold">{offer.title}</h3>
                  <p className="mt-2 text-lg">{offer.description}</p>
                  <Button className="mt-4" variant="secondary" asChild>
                    <Link href="/offers">See All Offers</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-[-50px]" />
      <CarouselNext className="right-[-50px]" />
    </Carousel>
  )
}
