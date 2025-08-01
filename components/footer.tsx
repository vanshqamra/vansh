import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 md:py-12">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div className="flex flex-col items-start">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Image
              src="/generic-brand-logo.png"
              alt="Chemical Corp Logo"
              width={40}
              height={40}
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-white">Chemical Corp</span>
          </Link>
          <p className="text-sm mb-4">
            Your trusted partner for high-quality chemicals, laboratory supplies, and scientific instruments.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Facebook className="h-6 w-6" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="h-6 w-6" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram className="h-6 w-6" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin className="h-6 w-6" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/products" className="text-sm hover:text-white transition-colors">
                Products
              </Link>
            </li>
            <li>
              <Link href="/offers" className="text-sm hover:text-white transition-colors">
                Offers
              </Link>
            </li>
            <li>
              <Link href="/brands" className="text-sm hover:text-white transition-colors">
                Brands
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-sm hover:text-white transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm hover:text-white transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard/history" className="text-sm hover:text-white transition-colors">
                Order History
              </Link>
            </li>
            <li>
              <Link href="/dashboard/quote-cart" className="text-sm hover:text-white transition-colors">
                Quote Cart
              </Link>
            </li>
            <li>
              <Link href="/payments" className="text-sm hover:text-white transition-colors">
                Payment Options
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-sm hover:text-white transition-colors">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
          <address className="not-italic space-y-2 text-sm">
            <p>123 Science Avenue,</p>
            <p>Innovation City, State - 123456,</p>
            <p>India</p>
            <p>Email: info@chemicalcorp.com</p>
            <p>Phone: +91 12345 67890</p>
          </address>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Chemical Corporation. All rights reserved.
      </div>
    </footer>
  )
}
