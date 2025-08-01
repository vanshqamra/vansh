import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Chemical Corp.</h3>
            <p className="text-sm leading-relaxed">
              Your trusted partner for high-quality chemical solutions and laboratory supplies. Committed to innovation,
              safety, and sustainability.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" aria-label="Facebook" className="hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-white transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-white transition-colors">
                  Offers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products/bulk-chemicals" className="hover:text-white transition-colors">
                  Bulk Chemicals
                </Link>
              </li>
              <li>
                <Link href="/products/laboratory-supplies" className="hover:text-white transition-colors">
                  Laboratory Supplies
                </Link>
              </li>
              <li>
                <Link href="/products/scientific-instruments" className="hover:text-white transition-colors">
                  Scientific Instruments
                </Link>
              </li>
              <li>
                <Link href="/brand/qualigens" className="hover:text-white transition-colors">
                  Qualigens Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
            <p className="text-sm">123 Chemical Lane, Science City, SC 12345</p>
            <p className="text-sm mt-2">Email: info@chemicalcorp.com</p>
            <p className="text-sm mt-2">Phone: +1 (234) 567-890</p>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Chemical Corporation. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
