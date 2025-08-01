import OffersCarousel from "@/components/offers-carousel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OffersPage() {
  const offers = [
    {
      id: 1,
      title: "Flat 10% Off on All Solvents",
      description: "Get a 10% discount on our entire range of high-purity solvents. Limited time offer!",
      image: "/images/offer-solvents.png",
      link: "/products/bulk-chemicals",
    },
    {
      id: 2,
      title: "Free Shipping on Orders Over ₹50,000",
      description: "Enjoy complimentary shipping on all orders exceeding ₹50,000. Valid for a limited period.",
      image: "/images/offer-shipping.png",
      link: "/products",
    },
    {
      id: 3,
      title: "Buy 2 Get 1 Free on Borosil Glassware",
      description: "Purchase any two Borosil glassware items and get the third one free. Stock up now!",
      image: "/images/offer-borosil-glassware.png",
      link: "/brand/borosil",
    },
    {
      id: 4,
      title: "20% Off on Whatman Filter Papers",
      description: "Exclusive discount on all Whatman filter papers for precise laboratory filtration.",
      image: "/images/offer-whatman-filters.png",
      link: "/brand/whatman",
    },
    {
      id: 5,
      title: "Special Discount on Lab Aprons",
      description: "Protect yourself with our durable lab aprons, now available at a special discounted price.",
      image: "/images/offer-apron.png",
      link: "/products/laboratory-supplies",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Exclusive Offers & Promotions</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover our latest deals and special discounts on a wide range of chemical products and laboratory supplies.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Featured Offers</h2>
        <OffersCarousel offers={offers} />
      </section>

      <Separator className="my-12" />

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">All Current Promotions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48 w-full">
                <Image
                  src={offer.image || "/placeholder.svg"}
                  alt={offer.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800">{offer.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{offer.description}</p>
                <Button asChild className="w-full">
                  <Link href={offer.link}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="text-center bg-gray-50 py-12 rounded-lg shadow-inner">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Don't Miss Out!</h2>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          Subscribe to our newsletter to get the latest updates on new products, exclusive offers, and industry news
          delivered straight to your inbox.
        </p>
        <Button size="lg">Subscribe Now</Button>
      </section>
    </div>
  )
}
