import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FlaskConical, Truck, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-50 mb-4">About Chemical Corporation</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Your trusted partner for high-quality chemicals, laboratory supplies, and scientific instruments.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
        <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/placeholder.svg?height=500&width=700"
            alt="Modern Chemical Laboratory"
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 hover:scale-105"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Our Mission</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            At Chemical Corporation, our mission is to empower scientific discovery and industrial innovation by
            providing unparalleled access to a comprehensive range of premium chemical products and laboratory
            solutions. We are committed to fostering a safer, healthier, and more sustainable future through our
            dedication to quality, reliability, and customer satisfaction.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            We strive to be the preferred partner for researchers, educators, and industries, delivering excellence with
            every product and service.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
        <div className="space-y-6 order-2 md:order-1">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Our Vision</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            To be the leading provider of chemical and laboratory solutions, recognized globally for our commitment to
            quality, innovation, and customer success. We envision a world where scientific advancements are accelerated
            by accessible, high-grade materials and cutting-edge instruments, and we aim to be at the forefront of this
            transformation.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            We continuously invest in technology and talent to expand our offerings and enhance our service delivery,
            ensuring we meet the evolving needs of the scientific community.
          </p>
        </div>
        <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg order-1 md:order-2">
          <Image
            src="/placeholder.svg?height=500&width=700"
            alt="Scientists Collaborating"
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 hover:scale-105"
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-gray-50">Why Choose Us?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center p-6 shadow-lg">
            <CardHeader>
              <Users className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <CardTitle className="text-xl font-semibold">Experienced Team</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Our team comprises seasoned professionals with deep expertise in chemistry and laboratory sciences.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center p-6 shadow-lg">
            <FlaskConical className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Quality Products</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                We supply only certified, high-purity chemicals and reliable laboratory equipment from trusted brands.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center p-6 shadow-lg">
            <Truck className="mx-auto h-12 w-12 text-purple-600 mb-4" />
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Efficient Logistics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Benefit from our robust supply chain ensuring timely and safe delivery across various regions.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center p-6 shadow-lg">
            <Award className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Customer Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your success is our priority. We are dedicated to providing exceptional service and support.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="text-center bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">Ready to Partner with Us?</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Whether you need bulk chemicals, specialized lab supplies, or advanced instruments, we are here to help.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          Contact Us
        </Link>
      </section>
    </div>
  )
}
