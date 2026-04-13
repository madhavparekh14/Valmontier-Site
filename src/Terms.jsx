import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Terms() {
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

        <h1 className="text-4xl font-semibold mb-10">Terms of Service</h1>

        <div className="space-y-8 text-sm text-zinc-600 leading-relaxed">

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">1. Overview</h2>
            <p>
              These Terms govern your use of the Valmontier website and products. By accessing or purchasing,
              you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">2. Products</h2>
            <p>
              Valmontier offers made-to-order and customizable watches. Due to the nature of customization,
              slight variations in appearance may occur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">3. Orders and Payment</h2>
            <p>
              All orders must be paid in full at checkout. Prices may change without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">4. Custom Builds</h2>
            <p>
              Custom or “Signature Builds” are final sale. Once production begins, changes or cancellations are not guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">5. Shipping</h2>
            <p>
              Shipping times are estimates and may vary. Valmontier is not responsible for delays caused by carriers or customs.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">6. Returns and Refunds</h2>
            <p>
              Standard items may be returned within 14 days if unused. Custom products are non-refundable.
              Shipping costs are non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">7. Warranty</h2>
            <p>
              A limited warranty is provided for manufacturing defects. This does not cover misuse or normal wear.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">8. Intellectual Property</h2>
            <p>
              All designs, branding, and content are owned by Valmontier and may not be used without permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">9. Limitation of Liability</h2>
            <p>
              Valmontier is not liable for indirect or incidental damages arising from product use or website access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-2">10. Changes</h2>
            <p>
              These Terms may be updated at any time. Continued use of the site indicates acceptance.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}