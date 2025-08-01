import ContactForm from "@/components/contact-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Get in Touch</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We'd love to hear from you! Whether you have a question about our products, need support, or want to
          collaborate, our team is ready to assist.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
          <ContactForm />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Contact Information</h2>
          <Card className="p-6 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800">Reach Out Directly</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Mail className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-gray-700">Email Us</h3>
                  <p className="text-gray-600">
                    <a href="mailto:info@chemicalcorp.com" className="hover:underline">
                      info@chemicalcorp.com
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-gray-700">Call Us</h3>
                  <p className="text-gray-600">
                    <a href="tel:+1234567890" className="hover:underline">
                      +1 (234) 567-890
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-700">Visit Our Office</h3>
                  <p className="text-gray-600">
                    123 Chemical Lane, <br />
                    Science City, SC 12345 <br />
                    Country
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Business Hours</h3>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM (Local Time)</p>
                <p className="text-gray-600">Saturday - Sunday: Closed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Find Us on the Map</h2>
        <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.2100000000005!2d-122.0842499!3d37.4219999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb5e7b0b0b0b1%3A0x808fb5e7b0b0b0b1!2sGoogleplex!5e0!3m2!1sen!2sus!4v1678901234567!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            aria-label="Google Maps location of Chemical Corporation"
          ></iframe>
        </div>
      </section>
    </div>
  )
}
