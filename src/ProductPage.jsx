import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import AviatorViewer from "@/components/AviatorViewer";

const products = [
  {
    slug: "aviator",
    name: "Valmontier Aviator",
    price: "$399.99",
    image: "/valmontieraviator.png",
    paymentLink: "https://buy.stripe.com/test_9B6bJ1fMg4sR77M16O3wQ00",
    desc:
      "A square profile with crisp edges, a bright Roman dial, and blued hands. Clean, architectural, and daily-ready.",
  },
  {
    slug: "grand-valmontier",
    name: "Grand Valmontier",
    price: "$480",
    image: "/grandvalmontier.png",
    paymentLink: "https://buy.stripe.com/test_3cIcN5dE87F3ajY3eW3wQ01",
    desc:
      "A calm sky blue dial with precise markers and a refined case. A dress-forward piece with quiet presence.",
  },
  {
    slug: "chronaut",
    name: "Valmontier Chronaut",
    price: "$299.99",
    image: "/valmontierchronaut.png",
    paymentLink: "https://buy.stripe.com/test_fZubJ19nS4sR9fU6r83wQ02",
    desc:
      "A sport chronograph profile with a balanced dial, strong legibility, and a bracelet-built stance.",
  },
];

const optionCatalog = {
  aviator: {
    dialColors: ["White Roman", "Ivory", "Silver", "Sky Blue"],
    handColors: ["Blue", "Polished Steel", "Black"],
    strapOptions: ["Steel Bracelet", "Black Leather", "Navy Leather", "Brown Leather", "Tan Leather"],
    hasQuickRelease: true,
  },
  "grand-valmontier": {
    dialColors: ["Sky Blue", "Ice Blue", "Silver", "Charcoal"],
    handColors: ["Blue", "Polished Steel", "Black"],
    strapOptions: ["Navy Crocodile Leather", "Black Leather", "Steel Bracelet"],
    hasQuickRelease: false,
  },
  chronaut: {
    dialColors: ["Black", "Blue", "Silver"],
    handColors: ["Polished Steel", "Black", "Blue"],
    strapOptions: ["Steel Bracelet", "Leather Strap"],
    hasQuickRelease: false,
  },
};

export default function ProductPage() {
  const { slug } = useParams();
  const product = useMemo(() => products.find((p) => p.slug === slug), [slug]);

  const cfg = optionCatalog[slug] || {
    dialColors: [],
    handColors: [],
    strapOptions: [],
    hasQuickRelease: false,
  };

  const [options, setOptions] = useState({
    dialColor: cfg.dialColors?.[0] || "",
    handColor: cfg.handColors?.[0] || "",
    strap: cfg.strapOptions?.[0] || "",
    quickRelease: false,
  });

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="text-zinc-900">Product not found.</div>
        <Button asChild className="mt-4">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  const summary = [
    options.dialColor ? `Dial: ${options.dialColor}` : null,
    options.handColor ? `Hands: ${options.handColor}` : null,
    options.strap ? `Strap: ${options.strap}` : null,
    cfg.hasQuickRelease ? `Quick release: ${options.quickRelease ? "Yes" : "No"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="secondary" className="border-black/10 bg-black/5 text-zinc-900">
            <Link to="/">Back</Link>
          </Button>
          <Badge className="border border-black/10 bg-black/5 text-zinc-900">{product.price}</Badge>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {slug === "aviator" ? (
            <AviatorViewer options={options} />
          ) : (
            <Card className="border-black/10 bg-zinc-50 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </Card>
          )}

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-semibold">{product.name}</h1>
              <p className="mt-2 text-zinc-600">{product.desc}</p>
            </div>

            <Card className="border-black/10 bg-zinc-50">
              <CardHeader>
                <CardTitle className="text-lg">Customize your build</CardTitle>
                <CardDescription className="text-zinc-600">
                  Choose the options you want. Your selections are reflected below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm text-zinc-700">Dial color</label>
                    <Select
                      value={options.dialColor}
                      onValueChange={(val) => setOptions((v) => ({ ...v, dialColor: val }))}
                    >
                      <SelectTrigger className="border-black/10 bg-white">
                        <SelectValue placeholder="Select dial color" />
                      </SelectTrigger>
                      <SelectContent className="border-black/10 bg-white text-zinc-900">
                        {cfg.dialColors.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm text-zinc-700">Hand color</label>
                    <Select
                      value={options.handColor}
                      onValueChange={(val) => setOptions((v) => ({ ...v, handColor: val }))}
                    >
                      <SelectTrigger className="border-black/10 bg-white">
                        <SelectValue placeholder="Select hand color" />
                      </SelectTrigger>
                      <SelectContent className="border-black/10 bg-white text-zinc-900">
                        {cfg.handColors.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}

                        <SelectItem value="Blue (Lume)">Blue (Lume)</SelectItem>
                        <SelectItem value="Black (Lume)">Black (Lume)</SelectItem>
                        <SelectItem value="Steel (Lume)">Steel (Lume)</SelectItem>
                        <SelectItem value="Gold (Lume)">Gold (Lume)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-zinc-700">Strap or bracelet</label>
                  <Select value={options.strap} onValueChange={(val) => setOptions((v) => ({ ...v, strap: val }))}>
                    <SelectTrigger className="border-black/10 bg-white">
                      <SelectValue placeholder="Select strap" />
                    </SelectTrigger>
                    <SelectContent className="border-black/10 bg-white text-zinc-900">
                      {cfg.strapOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {cfg.hasQuickRelease ? (
                  <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-3">
                    <div>
                      <div className="text-sm font-medium">Quick release strap attachments</div>
                      <div className="text-xs text-zinc-600">Swap straps without tools.</div>
                    </div>
                    <Switch
                      checked={options.quickRelease}
                      onCheckedChange={(checked) =>
                        setOptions((v) => ({ ...v, quickRelease: checked }))
                      }
                      className="
                        data-[state=checked]:bg-sky-600
                        data-[state=unchecked]:bg-zinc-300
                      "
                    />
                  </div>
                ) : null}

                <Separator className="bg-black/10" />

                <div className="text-sm text-zinc-700">
                  <span className="font-medium">Selected:</span> {summary || "No options selected"}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild className="w-full bg-sky-600 text-white hover:bg-sky-500 sm:w-auto">
                    <a href={product.paymentLink} target="_blank" rel="noopener noreferrer">
                      Checkout this build
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full border-black/10 bg-black/5 text-zinc-900 sm:w-auto"
                    onClick={() =>
                      setOptions({
                        dialColor: cfg.dialColors?.[0] || "",
                        handColor: cfg.handColors?.[0] || "",
                        strap: cfg.strapOptions?.[0] || "",
                        quickRelease: false,
                      })
                    }
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}