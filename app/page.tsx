import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import ParallaxBackground from "@/components/parallax-background"
import WhatsAppButton from "@/components/whatsapp-button"

export default function HomePage() {
  const brands = [
    { name: "Fisher Chemical", logo: "/images/logo-fisher-chemical.png" },
    { name: "Reagecon", logo: "/images/logo-reagecon.png" },
    { name: "Thermo Scientific", logo: "/images/logo-thermo-scientific.png" },
    { name: "Rankem", logo: "/images/logo-rankem.png" },
    { name: "Acros Organics", logo: "/images/logo-acros-organics.png" },
    { name: "Remel", logo: "/images/logo-remel.png" },
    { name: "Fisher BioReagents", logo: "/images/logo-fisher-bioreagents.png" },
    { name: "J.T.Baker", logo: "/images/logo-jtbaker.png" },
    { name: "Decon", logo: "/images/logo-decon.png" },
    { name: "Qualigens", logo: "/images/logo-qualigens.png" },
    { name: "Microbiologics", logo: "/images/logo-microbiologics.png" },
    { name: "Kimberly-Clark", logo: "/images/logo-kimberly-clark.png" },
    { name: "Riviera", logo: "/images/logo-riviera.png" },
    { name: "EM Techcolor", logo: "/images/logo-em-techcolor.png" },
    { name: "Duran Group", logo: "/images/logo-duran-group.png" },
    { name: "Troemner", logo: "/images/logo-troemner.png" },
    { name: "JohnsonDiversey", logo: "/images/logo-johnsondiversey.png" },
    { name: "Oxoid", logo: "/images/logo-oxoid.png" },
    { name: "Biotek", logo: "/images/logo-biotek.png" },
    { name: "Corning", logo: "/images/logo-corning.png" },
    { name: "Plas-Labs", logo: "/images/logo-plas-labs.png" },
    { name: "Lonza", logo: "/images/logo-lonza.png" },
    { name: "DuPont", logo: "/images/logo-dupont.png" },
    { name: "Maybridge", logo: "/images/logo-maybridge.png" },
    { name: "Labconco", logo: "/images/logo-labconco.png" },
    { name: "Superlab", logo: "/images/logo-superlab.png" },
    { name: "IKA", logo: "/images/logo-ika.png" },
    { name: "Borosil", logo: "/images/logo-borosil.png" },
    { name: "Whatman", logo: "/images/logo-whatman.png" },
    { name: "Avarice", logo: "/images/logo-avarice.png" },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <ParallaxBackground
          imageSrc="/images/hero-background.png"
          className="relative h-[600px] flex items-center justify-center text-white"
        >
          <div className="absolute inset-0 bg-black opacity-50" />
          <Image
            src="/images/hero-overlay.png"
            alt="Hero Overlay"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 z-0 opacity-30"
          />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
              Your Partner in Chemical Excellence
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 drop-shadow-md">
              Providing high-quality chemicals, laboratory supplies, and scientific instruments for all your needs.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="px-8 py-3 text-lg">
                <Link href="/products">Explore Products</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-8 py-3 text-lg text-white border-white hover:bg-white hover:text-gray-900 bg-transparent"
              >
                <Link href="/contact">Get a Quote</Link>
              </Button>
            </div>
          </div>
        </ParallaxBackground>

        {/* About Us Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
              Chemical Corporation is a leading supplier of premium chemical products and laboratory solutions. With
              decades of experience, we are committed to delivering unparalleled quality, reliability, and customer
              service to industries worldwide.
            </p>
            <Button asChild variant="outline">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </section>

        {/* Product Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-10">Our Product Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <Image
                    src="/images/product-acid.png"
                    alt="Bulk Chemicals"
                    width={100}
                    height={100}
                    className="mx-auto mb-4"
                  />
                  <CardTitle className="text-2xl font-semibold">Bulk Chemicals</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    High-volume chemicals for industrial and manufacturing processes.
                  </CardDescription>
                  <Button asChild variant="link">
                    <Link href="/products/bulk-chemicals">View Products</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <Image
                    src="/images/product-solvent.png"
                    alt="Laboratory Supplies"
                    width={100}
                    height={100}
                    className="mx-auto mb-4"
                  />
                  <CardTitle className="text-2xl font-semibold">Laboratory Supplies</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Essential tools and consumables for research and analysis.
                  </CardDescription>
                  <Button asChild variant="link">
                    <Link href="/products/laboratory-supplies">View Products</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <Image
                    src="/images/product-salt.png"
                    alt="Scientific Instruments"
                    width={100}
                    height={100}
                    className="mx-auto mb-4"
                  />
                  <CardTitle className="text-2xl font-semibold">Scientific Instruments</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Advanced equipment for precise measurements and experiments.
                  </CardDescription>
                  <Button asChild variant="link">
                    <Link href="/products/scientific-instruments">View Products</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-10">Why Choose Chemical Corporation?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Uncompromising Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    We source and supply only the highest purity chemicals and reliable equipment, ensuring your results
                    are accurate and consistent.
                  </p>
                </CardContent>
              </Card>
              <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Extensive Product Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    From basic reagents to specialized compounds and advanced instruments, find everything you need
                    under one roof.
                  </p>
                </CardContent>
              </Card>
              <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Expert Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Our team of experienced chemists and technical experts is always ready to provide guidance and
                    support.
                  </p>
                </CardContent>
              </Card>
              <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Sustainable Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    We are committed to environmentally responsible operations, from sourcing to waste management.
                  </p>
                </CardContent>
              </Card>
              <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Timely Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Our efficient logistics ensure your orders arrive safely and on schedule, every time.
                  </p>
                </CardContent>
              </Card>
              <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Competitive Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Benefit from competitive pricing without compromising on the quality or integrity of our products.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Brands Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-10">Our Trusted Brands</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-center">
              {brands.map((brand) => (
                <div
                  key={brand.name}
                  className="flex justify-center items-center p-4 bg-white rounded-lg shadow-sm h-24"
                >
                  <Image
                    src={brand.logo || "/placeholder.svg"}
                    alt={brand.name}
                    width={120}
                    height={60}
                    objectFit="contain"
                    className="max-w-full max-h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-primary text-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-6">Need a Custom Solution?</h2>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Our team is ready to assist you with tailored chemical solutions and bulk orders. Contact us today for a
              personalized quote.
            </p>
            <Button asChild size="lg" variant="secondary" className="px-8 py-3 text-lg">
              <Link href="/dashboard/upload">Request a Quote</Link>
            </Button>
          </div>
        </section>
      </main>
      <WhatsAppButton />
    </div>
  )
}
