"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Autoplay from "autoplay"
import { Button } from "@/components/ui/button"

interface Offer {
  id: number
  title: string
  description: string
  image: string
  link: string
}

interface OffersCarouselProps {
  offers: Offer[]
}

export default function OffersCarousel({ offers }: OffersCarouselProps) {
  const plugin = React.useRef(Autoplay({ delay: 4000, stopOnInteraction: true }))

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full max-w-4xl mx-auto"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {offers.map((offer) => (
          <CarouselItem key={offer.id}>
            <div className="p-1">
              <Card className="overflow-hidden shadow-lg">
                <CardContent className="flex flex-col md:flex-row items-center p-0">
                  <div className="relative w-full md:w-1/2 h-64 md:h-80">
                    <Image
                      src={offer.image || "/placeholder.svg"}
                      alt={offer.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                    />
                  </div>
                  <div className="p-6 md:p-8 w-full md:w-1/2 space-y-4">
                    <h3 className="text-3xl font-bold text-gray-900">{offer.title}</h3>
                    <p className="text-gray-700">{offer.description}</p>
                    <Button asChild>
                      <Link href={offer.link}>View Offer</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
