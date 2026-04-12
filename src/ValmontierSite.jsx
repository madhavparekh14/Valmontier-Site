import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom"
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Sparkles,
  Watch,
  Compass,
  Gem,
  ArrowRight,
  Check,
  Mail,
} from "lucide-react";
import BespokeForm from "@/components/BespokeForm";
import AviatorViewer from "@/components/AviatorViewer";

// FIX 1: Removed invalid `import { label } from "framer-motion/client"`

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const LuxeBg = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-400/15 blur-3xl" />
    <div className="absolute -bottom-40 left-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-600/10 blur-3xl" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_55%)]" />
    <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:18px_18px]" />
  </div>
);

const mockWatches = [
  {
    slug: "aviator",
    name: "Valmontier Aviator",
    price: "$399.99",
    tags: ["Everyday Wear"],
    desc: "Matte black case with warm gilt accents and a clean, legible dial.",
    // FIX 2: Replace with your real production Stripe payment links
    paymentLink: "https://buy.stripe.com/3cIcN5dE87F3ajY3eW3wQ01",
    image: "/valmontieraviator.png"
  },
  {
    slug: "grand-valmontier",
    name: "Grand Valmontier",
    price: "$480",
    tags: ["Casual"],
    desc: "Deep charcoal sunburst dial, slim hands, and polished casework.",
    // FIX 2: Removed "test_" prefix — replace with your real production Stripe link
    paymentLink: "https://buy.stripe.com/REPLACE_WITH_REAL_GRAND_VALMONTIER_LINK",
    image: "/grandvalmontier.png"
  },
  {
    slug: "chronaut",
    name: "Valmontier Chronaut",
    price: "$299.99",
    tags: ["Chronograph"],
    desc: "Brushed steel feel with a dark dial and crisp lume for daily wear.",
    // FIX 2: Removed "test_" prefix — replace with your real production Stripe link
    paymentLink: "https://buy.stripe.com/REPLACE_WITH_REAL_CHRONAUT_LINK",
    image: "/valmontierchronaut.png"
  },
];

const processSteps = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Select a design or start bespoke",
    desc: "Choose an existing Valmontier design or build from scratch with custom components.",
  },
  {
    icon: <Gem className="h-5 w-5" />,
    title: "Configure parts",
    desc: "Case, bracelet, dial, hands, and movement. Every detail is deliberate.",
  },
  {
    icon: <Compass className="h-5 w-5" />,
    title: "Confirm and craft",
    desc: "We review your specs and assemble your watch to order with careful QC.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Deliver with confidence",
    desc: "Secure shipping and support. Your watch is built to be worn, not stored.",
  },
];

const faqs = [
  {
    q: "Are Valmontier watches truly made to order?",
    a: "Yes. Most pieces are assembled after you place an order so you can choose the exact configuration you want.",
  },
  {
    q: "Can I request custom parts, including the movement?",
    a: "Yes. You can select from supported movements or request a specific movement, and we will confirm feasibility and pricing.",
  },
  {
    q: "What is the typical price range?",
    a: "Most builds fall between $300 and $500 depending on materials and movement choice.",
  },
  {
    q: "Do you offer warranty and service?",
    a: "We provide a standard warranty and can support servicing depending on the movement and parts selected.",
  },
];

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs text-zinc-900">
      {children}
    </span>
  );
}

function SectionHeading({ eyebrow, title, desc }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-3 flex items-center justify-center gap-2">
        <span className="h-px w-10 bg-white/10" />
        <span className="text-xs tracking-[0.32em] text-sky-600">{eyebrow}</span>
        <span className="h-px w-10 bg-white/10" />
      </div>
      <h2 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
        {title}
      </h2>
      {desc ? (
        <p className="mt-3 text-balance text-sm leading-relaxed text-zinc-600 md:text-base">
          {desc}
        </p>
      ) : null}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
      <div className="text-xs uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-zinc-900 md:text-xl">{value}</div>
    </div>
  );
}

function Nav() {
  const links = [
    { label: "Designs", href: "#designs" },
    { label: "Bespoke", href: "#bespoke" },
    { label: "Process", href: "#process" },
    { label: "FAQ", href: "#faq" },
    { label: "Admin", href: "/admin/orders" }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <a href="#" className="group inline-flex items-baseline gap-2">
          <span className="text-2xl tracking-[0.05em] text-zinc-900 font-['Ballet']">Valmontier</span>
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="secondary"
            className="hidden border border-black/10 bg-black/5 text-zinc-900 hover:bg-black/10 md:inline-flex"
          >
            <a href="#designs">Browse designs</a>
          </Button>
          <Button asChild className="bg-sky-600 text-white hover:bg-sky-500">
            <a href="#bespoke">Request bespoke</a>
          </Button>
        </div>
      </div>
    </header>
  );
}

function WatchCard({ w }) {
  return (
    <Card className="group h-full overflow-hidden border-black/10 bg-zinc-50">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-zinc-900">{w.name}</CardTitle>
            <CardDescription className="text-zinc-500">{w.price}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {w.tags.map((t) => (
              <Badge key={t} className="border border-black/10 bg-black/5 text-zinc-900">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-[4/3] overflow-hidden rounded-xl">
          <img
            src={w.image}
            alt={w.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <p className="text-sm leading-relaxed text-zinc-600">{w.desc}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          asChild
          variant="secondary"
          className="w-full border border-black/10 bg-white text-zinc-900 hover:bg-zinc-50 sm:w-auto"
        >
          <Link to={`/products/${w.slug}`}>View details</Link>
        </Button>

        <Button
          asChild
          className="w-full bg-sky-600 text-white hover:bg-sky-500 sm:w-auto"
        >
          <a href={w.paymentLink} target="_blank" rel="noopener noreferrer">
            Order this build
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ValmontierSite() {

  const signature = useMemo(() => mockWatches.find((x) => x.slug === "aviator"), [])
  const [showMessage, setShowMessage] = useState(false);
  const [aviatorOptions, setAviatorOptions] = useState({
    dialColor: "White Roman",
    handColor: "Blue",
    strap: "Steel Bracelet",
    quickRelease: false,
  });

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Nav />

      <main className="relative">
        <section className="relative">
          <LuxeBg />
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-6"
              >
                <div className="flex flex-wrap gap-2">
                  <Pill>Made to order</Pill>
                  <Pill>$300 to $500</Pill>
                  <Pill>Bespoke parts</Pill>
                </div>

                {/* FIX 3: Was two <h1> tags — second is now <h2> */}
                <h1 className="text-balance text-4xl font-['Ballet'] tracking-tight text-zinc-900 md:text-5xl">
                  Valmontier
                </h1>

                <h2 className="block text-zinc-600">Modern luxury, built to your spec</h2>

                <p className="text-balance text-base leading-relaxed text-zinc-600 md:text-lg">
                  Choose from existing designs or request a bespoke watch with custom parts, from the case and bracelet
                  to the hands and movement.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="bg-sky-600 text-white hover:bg-sky-500">
                    <a href="#designs">Explore existing designs</a>
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    className="border border-black/10 bg-black/5 text-zinc-900 hover:bg-black/10"
                  >
                    <a href="#bespoke">Request a custom build</a>
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <Stat label="Build time" value="Made to order" />
                  <Stat label="Focus" value="Parts you pick" />
                  <Stat label="Style" value="Dark luxury" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
                className="relative"
              >
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-zinc-50 p-6 shadow-2xl">
                  <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.18),transparent_55%)]" />
                  <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.22),transparent_55%)]" />

                  <div className="relative space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-xs tracking-[0.32em] text-sky-600">SIGNATURE BUILD</div>
                        <div className="text-xl font-semibold text-zinc-900">{signature?.name}</div>
                      </div>
                      <Badge className="border border-black/10 bg-black/5 text-zinc-900">{signature?.price}
                      </Badge>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                      <AviatorViewer options={aviatorOptions} />
                    </div>

                    <Button
                      className="bg-sky-600 text-white hover:bg-sky-500"
                      onClick={() => setShowMessage(true)}
                    >
                      View Aviator details
                    </Button>

                    {showMessage && (
                      <p className="text-sm text-sky-600 text-center">
                        Signature Builds Coming Soon
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/*<section id="designs" className="border-t border-black/10 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
            <SectionHeading
              eyebrow="EXISTING DESIGNS"
              title={
                <>
                  Order a signature{" "}
                  <span className="font-['Ballet']">Valmontier</span>
                </>
              }
              desc="Select a curated design and place a made to order build with your preferred configuration."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {mockWatches.map((w) => (
                <motion.div
                  key={w.name}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                >
                  <WatchCard w={w} />
                </motion.div>
              ))}
            </div>

            <div className="mt-10 rounded-3xl border border-black/10 bg-zinc-50 p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs tracking-[0.32em] text-sky-600">MADE TO ORDER</div>
                  <div className="mt-2 text-xl font-semibold text-zinc-900">Want a small tweak?</div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
                    Adjust case finish, dial tone, hands, bracelet or strap, and movement options where supported.
                  </p>
                </div>
                <Button asChild className="bg-sky-600 text-white hover:bg-sky-500">
                  <a href="#bespoke">Request a custom quote</a>
                </Button>
              </div>
            </div>
          </div>
        </section> */}

        <section id="bespoke" className="border-t border-black/10 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
            <SectionHeading
              eyebrow="BESPOKE"
              title="Build your watch, part by part"
              desc="Share your vision for a custom Valmontier and we will follow up with feasibility, pricing, and next steps."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <Card className="border-black/10 bg-zinc-50">
                <CardHeader>
                  <CardTitle className="text-zinc-900">Bespoke request</CardTitle>
                  <CardDescription className="text-zinc-500">
                    Submit your idea and we will review the configuration with you directly.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <BespokeForm />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-black/10 bg-zinc-50">
                  <CardHeader>
                    <CardTitle className="text-zinc-900">What you can customize</CardTitle>
                    <CardDescription className="text-zinc-500">
                      The core components that define the build.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        icon: <Watch className="h-5 w-5" />,
                        title: "Case and bracelet",
                        desc: "Size, finish, lug shape, bracelet taper, clasp style.",
                      },
                      {
                        icon: <Sparkles className="h-5 w-5" />,
                        title: "Dial and hands",
                        desc: "Indices, lume, textures, color tone, hand shape.",
                      },
                      {
                        icon: <Compass className="h-5 w-5" />,
                        title: "Movement",
                        desc: "Choose supported options or request a specific movement.",
                      },
                      {
                        icon: <Shield className="h-5 w-5" />,
                        title: "Assembly and QC",
                        desc: "Component checks, alignment review, and final inspection.",
                      },
                    ].map((x) => (
                      <div key={x.title} className="flex gap-3 rounded-2xl border border-black/10 bg-white p-4">
                        <div className="mt-0.5 rounded-xl border border-black/10 bg-black/5 p-2 text-sky-500">
                          {x.icon}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900">{x.title}</div>
                          <div className="mt-1 text-sm text-zinc-600">{x.desc}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-black/10 bg-zinc-50">
                  <CardHeader>
                    <CardTitle className="text-zinc-900">Made-to-order model</CardTitle>
                    <CardDescription className="text-zinc-500">
                      Why we build after you order.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-zinc-600">
                    <div className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 text-sky-600" />
                      <p>More choices, less inventory waste, and personal configurations.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 text-sky-600" />
                      <p>Better alignment between budget and parts selection.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 text-sky-600" />
                      <p>Clear expectations, with spec confirmation before assembly begins.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="border-t border-black/10 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
            <SectionHeading
              eyebrow="PROCESS"
              title="From concept to wrist"
              desc="A simple flow that keeps the experience premium and predictable."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-4">
              {processSteps.map((s) => (
                <motion.div
                  key={s.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={fadeUp}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="h-full"
                >
                  <Card className="h-full border-black/10 bg-zinc-50">
                    <CardHeader>
                      <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-black/10 bg-black/5 px-3 py-2 text-sky-500">
                        {s.icon}
                        <span className="text-xs tracking-wider text-zinc-900">STEP</span>
                      </div>
                      <CardTitle className="mt-3 text-zinc-900">{s.title}</CardTitle>
                      <CardDescription className="text-zinc-500">{s.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>

           {/*} <div className="mt-10 rounded-3xl border border-black/10 bg-zinc-50 p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-3 md:items-center">
                <div className="md:col-span-2">
                  <div className="text-xs tracking-[0.32em] text-sky-600">NEXT STEP</div>
                  <div className="mt-2 text-xl font-semibold text-zinc-900">Get a bespoke quote</div>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    Send your desired build details and we will respond with parts options, pricing, and a build plan.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button asChild className="bg-sky-600 text-white hover:bg-sky-500">
                    <a href="#bespoke">Request bespoke</a>
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    className="border border-black/10 bg-black/5 text-zinc-900 hover:bg-black/10"
                  >
                    <a href="#designs">Browse designs</a>
                  </Button>
                </div>
              </div>
            </div> */}
          </div>
        </section>

        <section id="faq" className="border-t border-black/10 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
            <SectionHeading eyebrow="FAQ" title="Answers, upfront" desc="Simple info to help you choose quickly." />

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {faqs.map((f) => (
                <Card key={f.q} className="border-black/10 bg-zinc-50">
                  <CardHeader>
                    <CardTitle className="text-base text-zinc-900">{f.q}</CardTitle>
                    <CardDescription className="text-zinc-600">{f.a}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-black/10 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <div className="text-lg font-semibold text-zinc-900">Valmontier</div>
                <div className="mt-1 text-xs tracking-[0.32em] text-sky-600">TIMEPIECES</div>
                <p className="mt-3 text-sm text-zinc-600">
                  Modern luxury watches, assembled to order with the parts you choose.
                </p>
              </div>

              <div className="space-y-2 text-sm text-zinc-600">
                <div className="font-medium text-zinc-900">Explore</div>
                <a className="block hover:text-zinc-900" href="#designs">
                  Existing designs
                </a>
                <a className="block hover:text-zinc-900" href="#bespoke">
                  Bespoke request
                </a>
                <a className="block hover:text-zinc-900" href="#process">
                  Process
                </a>
                <a className="block hover:text-zinc-900" href="#faq">
                  FAQ
                </a>
              </div>

              <div className="space-y-3">
                <div className="font-medium text-zinc-900">Stay in the loop</div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      className="w-full border-black/10 bg-black/5 pl-9 text-zinc-900"
                      placeholder="Email address"
                    />
                  </div>
                  <Button className="bg-sky-600 text-white hover:bg-sky-500">Join</Button>
                </div>
                <p className="text-xs text-zinc-500">
                  No spam. Product drops, new designs, and bespoke availability.
                </p>
              </div>
            </div>

            <Separator className="my-8 bg-white/10" />

            {/* FIX 4: Was "text-zinc-9000" — corrected to "text-zinc-500" */}
            <div className="flex flex-col gap-3 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between">
              <div>© {new Date().getFullYear()} Valmontier. All rights reserved.</div>
              <div className="flex gap-4">
                <a className="hover:text-zinc-600" href="#">
                  Privacy
                </a>
                <a className="hover:text-zinc-600" href="#">
                  Terms
                </a>
                <a className="hover:text-zinc-600" href="#">
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}