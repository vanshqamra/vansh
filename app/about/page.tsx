import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">About Chemical Corporation</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted partner in chemical solutions, committed to quality, safety, and innovation.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center mb-12">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            At Chemical Corporation, our mission is to provide high-quality chemical products and innovative solutions
            that meet the diverse needs of our clients across various industries. We are dedicated to fostering
            scientific advancement, ensuring environmental responsibility, and maintaining the highest standards of
            safety and integrity in all our operations.
          </p>
        </div>
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/placeholder.svg?height=400&width=600&text=Our Mission"
            alt="Our Mission"
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-105"
          />
        </div>
      </section>

      <Separator className="my-12" />

      <section className="grid md:grid-cols-2 gap-12 items-center mb-12">
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg order-2 md:order-1">
          <Image
            src="/placeholder.svg?height=400&width=600&text=Our Vision"
            alt="Our Vision"
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            We envision a future where Chemical Corporation is recognized globally as a leader in chemical innovation,
            setting benchmarks for product excellence, sustainable practices, and customer satisfaction. We aim to be
            the preferred partner for businesses seeking reliable and cutting-edge chemical solutions, contributing to a
            healthier and more sustainable world.
          </p>
        </div>
      </section>

      <Separator className="my-12" />

      <section className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800">Integrity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We conduct our business with the highest ethical standards, ensuring transparency and honesty in all our
                interactions.
              </p>
            </CardContent>
          </Card>
          <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800">Innovation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We continuously seek new and improved ways to develop products and solutions, pushing the boundaries of
                chemical science.
              </p>
            </CardContent>
          </Card>
          <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800">Sustainability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We are committed to environmentally responsible practices, minimizing our footprint and promoting a
                greener future.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="text-center bg-gray-50 py-12 rounded-lg shadow-inner">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Partner with Us?</h2>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          Explore our extensive range of products or get in touch with our expert team to discuss your specific chemical
          needs.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/products">View Products</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
