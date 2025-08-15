import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Shield, CreditCard, Truck, RotateCcw, AlertTriangle, Scale } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                1. Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing and using Chemical Corporation's services, you agree to be bound by these Terms and
                Conditions. These terms apply to all users of our website, products, and services.
              </p>
              <p>
                Chemical Corporation reserves the right to modify these terms at any time. Continued use of our services
                constitutes acceptance of any changes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                2. Order Processing and Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Order Confirmation</h4>
                <p>
                  All orders are subject to acceptance and confirmation by Chemical Corporation. We reserve the right to
                  refuse or cancel any order at our discretion.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Payment Terms</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Payment is only processed after order confirmation and final pricing approval</li>
                  <li>No charges are made during the initial order placement</li>
                  <li>Final pricing may vary based on current market rates and availability</li>
                  <li>
                    Payment methods include bank transfer, credit terms (for approved clients), and cheque payments
                  </li>
                  <li>All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Payment Security</h4>
                    <p className="text-blue-700 text-sm">
                      Your payment information is secure. We do not store credit card details and use encrypted
                      connections for all transactions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                3. Shipping and Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Delivery Terms</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Delivery timelines are estimates and may vary based on product availability and location</li>
                  <li>Shipping charges will be applied as applicable</li>
                  <li>Special handling charges may apply for hazardous materials</li>
                  <li>Delivery address changes after order confirmation may incur additional charges</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Risk of Loss</h4>
                <p>
                  Risk of loss and title for products pass to the buyer upon delivery to the carrier. Chemical
                  Corporation is not responsible for damages during transit.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                4. Returns and Refunds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Return Policy</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Returns are accepted within 30 days of delivery for unopened products</li>
                  <li>Chemical products cannot be returned once opened due to safety regulations</li>
                  <li>Custom or special-order items are non-returnable</li>
                  <li>Return shipping costs are borne by the customer unless the return is due to our error</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Refund Process</h4>
                <p>
                  Approved refunds will be processed within 7-10 business days to the original payment method. Refund
                  amounts may be subject to restocking fees for certain products.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                5. Product Information and Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Product Accuracy</h4>
                <p>
                  While we strive to provide accurate product information, specifications may change without notice.
                  Always refer to the product label and safety data sheet for the most current information.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Safety Compliance</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Buyers are responsible for ensuring proper handling and storage of chemical products</li>
                  <li>All applicable safety regulations and permits must be obtained by the buyer</li>
                  <li>Chemical Corporation provides safety data sheets (SDS) for all chemical products</li>
                  <li>Buyers must have appropriate facilities and training for handling purchased chemicals</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Chemical Corporation's liability is limited to the purchase price of the products. We are not liable for
                indirect, incidental, special, or consequential damages arising from the use of our products or
                services.
              </p>
              <p>
                Products are sold "as is" without warranties beyond those required by law. Buyers assume all risks
                associated with the use of chemical products.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                All content on our website, including text, graphics, logos, and software, is the property of Chemical
                Corporation and is protected by copyright and trademark laws.
              </p>
              <p>
                Users may not reproduce, distribute, or create derivative works from our content without written
                permission.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We collect and use personal information in accordance with our Privacy Policy. By using our services,
                you consent to the collection and use of your information as described.
              </p>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Governing Law and Disputes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These terms are governed by the laws of India. Any disputes arising from these terms or the use of our
                services shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
              </p>
              <p>
                We encourage resolution of disputes through direct communication. For formal complaints, please contact
                our customer service team.
              </p>
            </CardContent>
          </Card>

          <Separator />

          <div className="text-center text-gray-600 space-y-2">
            <p className="font-semibold">Contact Information</p>
            <p>Chemical Corporation</p>
            <p>Email: chemicalcorporation.ldh@gmail.com</p>
            <p>Phone: +91-9417250691</p>
            <p>Address: CHEMICAL CORPORATION, GOKAL ROAD, LUDHIANA 141008</p>
          </div>
        </div>
      </div>
    </div>
  )
}
