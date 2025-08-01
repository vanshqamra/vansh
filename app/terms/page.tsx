import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Terms & Conditions</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Please read these terms and conditions carefully before using our services.
        </p>
      </section>

      <Card className="p-6 shadow-md">
        <CardContent className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              Welcome to Chemical Corporation. These Terms and Conditions govern your use of our website and services.
              By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of
              the terms, then you may not access the service.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive
              property of Chemical Corporation and its licensors. Our trademarks and trade dress may not be used in
              connection with any product or service without the prior written consent of Chemical Corporation.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide us with information that is accurate, complete, and
              current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate
              termination of your account on our Service. You are responsible for safeguarding the password that you use
              to access the Service and for any activities or actions under your password.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Purchases</h2>
            <p>
              If you wish to purchase any product or service made available through the Service ("Purchase"), you may be
              asked to supply certain information relevant to your Purchase including, without limitation, your credit
              card number, the expiration date of your credit card, your billing address, and your shipping information.
            </p>
            <p className="mt-2">
              You represent and warrant that: (i) you have the legal right to use any credit card(s) or other payment
              method(s) in connection with any Purchase; and that (ii) the information you supply to us is true, correct
              and complete.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Links To Other Web Sites</h2>
            <p>
              Our Service may contain links to third-party web sites or services that are not owned or controlled by
              Chemical Corporation.
            </p>
            <p className="mt-2">
              Chemical Corporation has no control over, and assumes no responsibility for, the content, privacy
              policies, or practices of any third party web sites or services. You further acknowledge and agree that
              Chemical Corporation shall not be responsible or liable, directly or indirectly, for any damage or loss
              caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or
              services available on or through any such web sites or services.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason
              whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of [Your Country/State], without
              regard to its conflict of law provisions.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Changes To Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision
              is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What
              constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
              <a href="mailto:info@chemicalcorp.com" className="underline">
                info@chemicalcorp.com
              </a>
              .
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
