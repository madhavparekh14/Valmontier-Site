import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* Back button */}
        <div className="mb-8">
          <Button
            asChild
            variant="secondary"
            className="border-black/10 bg-black/5 text-zinc-900"
          >
            <Link to="/">Back to site</Link>
          </Button>
        </div>

        <h1 className="text-4xl font-semibold mb-10">Privacy Policy</h1>

        <div className="space-y-8 text-sm text-zinc-600 leading-relaxed">

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">1. Information We Collect</h2>
            <p>
              We collect information you provide when placing an order or contacting us, including your name, email address,
              billing and shipping address, and payment details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">2. How We Use Your Information</h2>
            <p>
              Your information is used to process and fulfill orders, communicate updates, improve our services, and prevent fraud.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">3. Payment Security</h2>
            <p>
              Payments are processed through secure third-party providers. We do not store full payment information on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">4. Cookies</h2>
            <p>
              We may use cookies to improve website performance and enhance your browsing experience.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">5. Data Sharing</h2>
            <p>
              We do not sell your personal data. Information may be shared with shipping providers, payment processors,
              and legal authorities when required.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">6. Data Retention</h2>
            <p>
              We retain your data only as long as necessary to fulfill orders and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">7. Your Rights</h2>
            <p>
              You may request access, correction, or deletion of your personal data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">8. Security</h2>
            <p>
              We implement reasonable safeguards to protect your data, but no system is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">9. Updates</h2>
            <p>
              This Privacy Policy may be updated periodically. Continued use of the site indicates acceptance.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}