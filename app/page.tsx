import { ParallaxBackground } from "@/components/parallax-background"
import { ProductGrid } from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FlaskConical, Microscope, TestTube, Shield, Truck, Award, ChevronRight, Globe, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <ParallaxBackground />

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-600/20 text-blue-200 border-blue-400/30 hover:bg-blue-600/30">
            <Zap className="w-4 h-4 mr-2" />
            Advanced Laboratory Solutions
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
            Chemical Corporation
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Pioneering the future of laboratory science with premium chemicals, cutting-edge instruments, and innovative
            solutions for research excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              <Link href="/products">
                Explore Products
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-blue-300 text-blue-100 hover:bg-blue-600/20 px-8 py-3 text-lg bg-transparent"
            >
              <Link href="/contact">Get Quote</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-200">10K+</div>
              <div className="text-sm text-blue-300">Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-200">500+</div>
              <div className="text-sm text-blue-300">Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-200">77+</div>
              <div className="text-sm text-blue-300">Years</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-blue-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-blue-300 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Laboratory Excellence Redefined</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience unparalleled quality and innovation in every product we deliver
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <FlaskConical className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Premium Chemicals</h3>
                <p className="text-slate-600 leading-relaxed">
                  High-purity laboratory chemicals from trusted global manufacturers, ensuring consistent results in
                  your research.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Microscope className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Advanced Instruments</h3>
                <p className="text-slate-600 leading-relaxed">
                  State-of-the-art scientific instruments and equipment for precise measurements and analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <TestTube className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Laboratory Supplies</h3>
                <p className="text-slate-600 leading-relaxed">
                  Complete range of laboratory supplies and consumables for all your research needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">FEATURED PRODUCTS </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Comprehensive Laboratory Solutions</h2>
          </div>

          <ProductGrid />
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Quality Assured</h3>
              <p className="text-slate-600 text-sm">ISO certified products with rigorous quality control</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Fast Delivery</h3>
              <p className="text-slate-600 text-sm">Quick and secure shipping worldwide</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Expert Support</h3>
              <p className="text-slate-600 text-sm">Technical assistance from qualified professionals</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Global Reach</h3>
              <p className="text-slate-600 text-sm">Serving 500+ clients  </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Advance Your Research?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of researchers who trust Chemical Corporation for their laboratory needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3">
              <Link href="/products">Browse Catalog</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 px-8 py-3 bg-transparent"
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
