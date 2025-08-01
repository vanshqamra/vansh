import { ContactForm } from "@/components/contact-form"
import { Mail, MapPin, Phone } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Chemical Corporation. Find our address in Ludhiana, contact details, or send us a message through our contact form.",
}

export default function ContactPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Contact Us</h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
            We're here to help. Reach out to us for quotes, questions, or support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Location</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-slate-600">Gokal Road, Ludhiana, Punjab</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Contact Person: Manoj Kumar</h3>
                    <p className="text-slate-600">
                      <a href="tel:+919915533998" className="hover:text-blue-600">
                        +91 9915533998
                      </a>
                    </p>
                    <p className="text-slate-600">
                      <a href="tel:+919417250691" className="hover:text-blue-600">
                        +91 9417250691
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-slate-600">
                      <a href="mailto:chemicalcorporation.ldh@gmail.com" className="hover:text-blue-600">
                        info@chemicalcorporation.in
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3423.66215400198!2d75.8442353151354!3d30.89648698158098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a8395e526787b%3A0x9f4030d651333f7f!2sGokal%20Rd%2C%20Ludhiana%2C%20Punjab!5e0!3m2!1sen!2sin!4v1678886456789!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Send us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
