import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ParallaxBackground } from "@/components/parallax-background"
import { ProductGrid } from "@/components/product-grid"
import { OffersCarousel } from "@/components/offers-carousel"
import { ArrowRight, Beaker, Shield, Truck, Award, Users, Globe, Phone, Mail, Star } from "lucide-react"

const stats = [
  { number: "10,000+", label: "Products Available" },
  { number: "500+", label: "Happy Clients" },
  { number: "15+", label: "Years Experience" },
  { number: "50+", label: "Global Brands" },
]

const features = [
  {
    icon: Shield,
    title: "Quality Assured",
    description: "All products undergo rigorous quality testing and come with certificates of analysis",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick and secure delivery with proper handling of hazardous materials",
  },
  {
    icon: Award,
    title: "Expert Support",
    description: "Technical support from experienced chemists and laboratory professionals",
  },
  {
    icon: Users,
    title: "Trusted Partner",
    description: "Serving research institutions, universities, and industries for over 15 years",
  },
]

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Research Director, BioTech Labs",
    content:
      "Chemical Corporation has been our trusted partner for laboratory supplies. Their quality and service are unmatched.",
    rating: 5,
  },
  {
    name: "Prof. Michael Chen",
    role: "Chemistry Department, State University",
    content: "Excellent product range and technical support. They understand the needs of academic research.",
    rating: 5,
  },
  {
    name: "Rajesh Kumar",
    role: "QC Manager, Pharma Industries",
    content: "Reliable supplier with consistent quality. Their analytical grade chemicals meet all our specifications.",
    rating: 5,
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <ParallaxBackground />
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 text-sm px-4 py-2">
            Trusted by 500+ Research Institutions
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Premium Laboratory
            <br />
            <span className="text-blue-300">Chemicals & Equipment</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Your trusted partner for high-quality laboratory chemicals, scientific instruments, and research supplies
            from leading global brands
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg" asChild>
              <Link href="/products">
                Explore Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-gray-900 bg-transparent px-8 py-4 text-lg"
              asChild
            >
              <Link href="/login">Client Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Chemical Corporation?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive solutions for all your laboratory needs with unmatched quality and service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-slate-200">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular laboratory chemicals and equipment from trusted brands
            </p>
          </div>
          <ProductGrid />
          <div className="text-center mt-12">
            <Button size="lg" asChild className="px-8 py-4 text-lg">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Special Offers</h2>
            <p className="text-xl text-gray-600">Limited time deals on premium products</p>
          </div>
          <OffersCarousel />
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Product Categories</h2>
            <p className="text-xl text-gray-600">Comprehensive range of laboratory supplies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-200" asChild>
              <Link href="/products/bulk-chemicals">
                <CardHeader className="text-center">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <Beaker className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="group-hover:text-blue-600 transition-colors">Bulk Chemicals</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    High-purity chemicals for research, analysis, and industrial applications
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-200" asChild>
              <Link href="/dashboard/history">
                <CardHeader className="text-center">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="group-hover:text-green-600 transition-colors">Order History</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>Track your orders and manage your purchase history</CardDescription>
                </CardContent>
              </Link>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-200" asChild>
              <Link href="/dashboard/upload">
                <CardHeader className="text-center">
                  <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                    <Globe className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="group-hover:text-purple-600 transition-colors">Upload Requirements</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>Upload your requirements and get customized quotes</CardDescription>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600">Trusted by leading research institutions and industries</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Contact us today for personalized quotes and expert consultation on your laboratory needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4"
              asChild
            >
              <Link href="/contact">
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent px-8 py-4"
              asChild
            >
              <Link href="/contact">
                <Mail className="h-5 w-5 mr-2" />
                Email Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
