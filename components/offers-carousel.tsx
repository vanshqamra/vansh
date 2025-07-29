"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from "next/image"
import { Button } from "./ui/button"

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
    img: "/images/offer-shipping.png",
  },
  {
    title: "15% Off Whatman Filters",
    description: "This month only, get a 15% discount on all Whatman filter papers.",
    img: "/images/offer-filters.png",
  },
  {
    title: "New Borosil Glassware",
    description: "Explore the new 2025 catalog of Borosil glassware. Special introductory prices.",
    img: "/images/offer-glassware.png",
  },
]

export function OffersCarousel() {
  return (
    <Carousel className="w-full max-w-4xl mx-auto" opts={{ loop: true }}>
      <CarouselContent>
        {offers.map((offer, index) => (
          <CarouselItem key={index}>
            <Card className="overflow-hidden">
              <CardContent className="relative flex aspect-video items-center justify-center p-0">
                <Image src={offer.img || "/placeholder.svg"} alt={offer.title} layout="fill" objectFit="cover" />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 text-center text-white p-6">
                  <h3 className="text-3xl font-bold">{offer.title}</h3>
                  <p className="mt-2 text-lg">{offer.description}</p>
                  <Button className="mt-4" variant="secondary">
                    See All Offers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-[-50px]" />
      <CarouselNext className="right-[-50px] border-0" />
    </Carousel>
  )
}
