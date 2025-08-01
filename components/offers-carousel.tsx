"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Autoplay from "autoplay" // Corrected import

interface Offer {
  id: string
  title: string
  description: string
  image: string
  ctaText: string
  ctaLink: string
}

interface OffersCarouselProps {
  offers: Offer[]
}

export function OffersCarousel({ offers }: OffersCarouselProps) {
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
            <Card className="overflow-hidden shadow-lg">
              <div className="relative h-64 w-full">
                <Image
                  src={offer.image || "/placeholder.svg"}
                  alt={offer.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">{offer.title}</CardTitle>
                <CardDescription className="text-md text-gray-600 dark:text-gray-400">
                  {offer.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href={offer.ctaLink}>{offer.ctaText}</Link>
                </Button>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
