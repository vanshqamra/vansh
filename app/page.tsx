import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ParallaxBackground } from "@/components/parallax-background"
import { getFeaturedProducts, getBrands, getClientLogos } from "@/lib/data"
import { ProductGrid } from "@/components/product-grid"
import { OffersCarousel } from "@/components/offers-carousel"

export default function HomePage() {
  const featuredProducts = getFeaturedProducts()
  const brands = getBrands()
  const clientLogos = getClientLogos()

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
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Parallax */}
      <ParallaxBackground image1="/images/parallax-bg-1.png" image2="/images/parallax-bg-2.png">
        <div className="relative z-20 text-center text-white px-4 py-16 md:py-24">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg">
            Your Partner in Chemical Excellence
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
            Providing high-quality chemicals, laboratory supplies, and scientific instruments for research, industry,
            and education.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/products">Explore Products</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              <Link href="/contact">Get a Quote</Link>
            </Button>
          </div>
        </div>
      </ParallaxBackground>

      {/* Featured Products Section */}
      <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-gray-50">Featured Products</h2>
          <ProductGrid products={featuredProducts} />
          <div className="text-center mt-10">
            <Button asChild size="lg" variant="outline">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="py-12 md:py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-gray-50">Special Offers</h2>
          <OffersCarousel offers={offers} />
          <div className="text-center mt-10">
            <Button asChild size="lg" variant="outline">
              <Link href="/offers">View All Offers</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-gray-50">Our Trusted Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-center">
            {brands.map((brand) => (
              <Link
                href={`/brand/${brand.slug}`}
                key={brand.id}
                className="flex justify-center items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <Image
                  src={brand.logoUrl || "/placeholder.svg"}
                  alt={brand.name}
                  width={120}
                  height={60}
                  objectFit="contain"
                  className="max-h-16 w-auto"
                />
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg" variant="outline">
              <Link href="/brands">Explore All Brands</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 md:py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-gray-50">
            Why Choose Chemical Corporation?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold mb-2">Quality Assurance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We source only the highest purity chemicals and lab supplies from reputable manufacturers, ensuring
                  reliability and accuracy for your work.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold mb-2">Expert Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our team of experienced chemists and technical specialists is ready to provide unparalleled support
                  and guidance.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold mb-2">Nationwide Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Benefit from our efficient logistics network, ensuring timely and safe delivery of your orders across
                  the country.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Client Testimonials/Logos Section */}
      <section className="py-12 md:py-20 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-10 text-gray-900 dark:text-gray-50">Our Valued Clients</h2>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {clientLogos.map((logo, index) => (
              <Image
                key={index}
                src={logo || "/placeholder.svg"}
                alt={`Client Logo ${index + 1}`}
                width={150}
                height={80}
                objectFit="contain"
                className="grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
