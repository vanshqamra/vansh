"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

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
    img: "https://ucarecdn.com/8ea7953b-bca0-4568-b562-bdbfd906aa11/-/preview/1000x1000",
  },
  {
    title: "New Borosil Glassware",
    description: "Explore the latest 2025 Borosil catalog — special intro prices!",
    img: "https://ucarecdn.com/82dea84f-9906-498f-be71-65b931c60ab4/-/preview/1000x817/",
  },
]

export default function OffersPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold text-center mb-8">All Offers</h1>
      {offers.map((offer, index) => (
        <Card key={index} className="overflow-hidden shadow-md">
          <CardContent className="flex flex-col md:flex-row p-0">
            <div className="relative w-full md:w-1/2 h-64">
              <Image
                src={offer.img}
                alt={offer.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6 flex flex-col justify-center w-full md:w-1/2">
              <h2 className="text-2xl font-semibold">{offer.title}</h2>
              <p className="mt-2 text-gray-600">{offer.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
