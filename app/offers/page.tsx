import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { OffersCarousel } from "@/components/offers-carousel"

export default function OffersPage() {
  const offers = [
    {
      id: "1",
      title: "20% Off on Bulk Solvents",
      description: "Get a flat 20% discount on all bulk solvent purchases over 100 liters.",
      image: "/images/offer-solvents.png",
      ctaText: "Shop Solvents",
      ctaLink: "/products/bulk-chemicals",
    },
    {
      id: "2",
      title: "Free Shipping on Orders Over ₹10,000",
      description: "Enjoy complimentary shipping on all orders exceeding ₹10,000 across India.",
      image: "/images/offer-shipping.png",
      ctaText: "Start Shopping",
      ctaLink: "/products",
    },
    {
      id: "3",
      title: "Buy 2 Get 1 Free on Lab Glassware",
      description: "Purchase any two lab glassware items and get the third one free (of equal or lesser value).",
      image: "/images/offer-glassware.png",
      ctaText: "Browse Glassware",
      ctaLink: "/products/laboratory-supplies",
    },
    {
      id: "4",
      title: "15% Off on Whatman Filters",
      description: "Special discount on all Whatman brand filter papers and membranes.",
      image: "/images/offer-whatman-filters.png",
      ctaText: "View Filters",
      ctaLink: "/products/laboratory-supplies",
    },
    {
      id: "5",
      title: "Borosil Glassware Bundle Offer",
      description: "Save big when you buy our curated Borosil glassware bundles for your lab.",
      image: "/images/offer-borosil-glassware.png",
      ctaText: "Explore Bundles",
      ctaLink: "/products/laboratory-supplies",
    },
    {
      id: "6",
      title: "Complimentary Lab Apron",
      description: "Receive a free lab apron with every purchase of scientific instruments over ₹25,000.",
      image: "/images/offer-apron.png",
      ctaText: "Shop Instruments",
      ctaLink: "/products/scientific-instruments",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-50 mb-4">Exclusive Offers</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Discover our latest promotions and special discounts on a wide range of chemical products and lab supplies.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-6 text-center">Featured Offers</h2>
        <OffersCarousel offers={offers} />
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-6 text-center">All Current Offers</h2>
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
              <CardHeader className="p-4">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">{offer.title}</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  {offer.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link href={offer.ctaLink}>{offer.ctaText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="text-center bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">Don't Miss Out!</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Subscribe to our newsletter to get the latest updates on new products and exclusive offers directly in your
          inbox.
        </p>
        <Button asChild size="lg">
          <Link href="/contact">Subscribe Now</Link>
        </Button>
      </section>
    </div>
  )
}
