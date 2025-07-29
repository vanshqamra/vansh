import Link from "next/link"
import { FlaskConical, Mail, MapPin, Phone, Microscope } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 relative overflow-hidden">
      <div className="absolute -bottom-10 -right-10">
        <Microscope className="w-48 h-48 text-slate-700/50" />
      </div>
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4 md:px-6 relative z-10">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-4">
            <FlaskConical className="h-7 w-7 text-teal-400" />
            <span className="text-xl font-bold text-white">Chemical Corporation</span>
          </Link>
          <p className="text-sm text-slate-400">
            Serving laboratories and industries with quality chemicals and supplies since 1947.
          </p>
          <div className="mt-4 text-teal-400 font-bold border border-teal-400/50 rounded-lg px-3 py-1 inline-block">
            Serving Labs Since 1947 – 77+ Years Strong
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">Products</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/products/commercial" className="hover:text-teal-400">
                Commercial Chemicals
              </Link>
            </li>
            <li>
              <Link href="/brand/borosil" className="hover:text-teal-400">
                Borosil Glassware
              </Link>
            </li>
            <li>
              <Link href="/brand/whatman" className="hover:text-teal-400">
                Whatman Filter Papers
              </Link>
            </li>
            <li>
              <Link href="/brand/rankem" className="hover:text-teal-400">
                Rankem Reagents
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 flex-shrink-0 text-teal-400 mt-0.5" />
              <span>Gokal Road, Ludhiana, Punjab</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-teal-400" />
              <a href="tel:+919915533998" className="hover:text-teal-400">
                +91 9915533998
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-teal-400" />
              <a href="mailto:info@chemicalcorporation.in" className="hover:text-teal-400">
                info@chemicalcorporation.in
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">Clientele</h3>
          <div className="flex flex-wrap gap-4 opacity-70">
            <Image src="/images/client-logo-1.png" alt="Client Logo 1" width={100} height={32} className="h-8 w-auto" />
            <Image src="/images/client-logo-2.png" alt="Client Logo 2" width={100} height={32} className="h-8 w-auto" />
            <Image src="/images/client-logo-3.png" alt="Client Logo 3" width={100} height={32} className="h-8 w-auto" />
          </div>
        </div>
      </div>
      <div className="bg-black/20 py-4">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Chemical Corporation. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}
