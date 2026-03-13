import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import AviatorViewer from "@/components/AviatorViewer";
import { getBuildPriceCents, formatMoney } from "@/lib/pricing";

const products = [
  {
    slug: "aviator",
    name: "Valmontier Aviator",
    image: "/valmontieraviator.png",
    desc:
      "A square profile with crisp edges, a bright Roman dial, and blued hands. Clean, architectural, and daily-ready.",
  },
  {
    slug: "grand-valmontier",
    name: "Grand Valmontier",
    image: "/grandvalmontier.png",
    desc:
      "A calm sky blue dial with precise markers and a refined case. A dress-forward piece with quiet presence.",
  },
  {
    slug: "chronaut",
    name: "Valmontier Chronaut",
    image: "/valmontierchronaut.png",
    desc:
      "A sport chronograph profile with a balanced dial, strong legibility, and a bracelet-built stance.",
  },
];

const optionCatalog = {
  aviator: {
    dialColors: ["White Roman", "Ivory", "Silver", "Sky Blue"],
    handColors: ["Blue", "Black", "Steel", "Gold"],
    strapOptions: ["Steel Bracelet", "Black Leather", "Navy Leather", "Brown Leather", "Tan Leather"],
    hasQuickRelease: true,
  },
  "grand-valmontier": {
    dialColors: ["Sky Blue", "Silver", "Black", "Blue"],
    handColors: ["Blue", "Black", "Steel", "Gold"],
    strapOptions: ["Steel Bracelet", "Black Leather", "Navy Leather", "Brown Leather", "Tan Leather"],
    hasQuickRelease: false,
  },
  chronaut: {
    dialColors: ["Black", "Blue", "Silver"],
    handColors: ["Blue", "Black", "Steel", "Gold"],
    strapOptions: ["Steel Bracelet", "Leather Strap"],
    hasQuickRelease: false,
  },
};

function getDefaultOptions(slug) {
  const cfg = optionCatalog[slug] || {
    dialColors: [],
    handColors: [],
    strapOptions: [],
    hasQuickRelease: false,
  };

  return {
    dialColor: cfg.dialColors?.[0] || "",
    handColor: cfg.handColors?.[0] || "",
    strap: cfg.strapOptions?.[0] || "",
    quickRelease: false,
  };
}

export default function ProductPage() {
  const { slug } = useParams();
  const product = useMemo(() => products.find((p) => p.slug === slug), [slug]);

  const cfg = optionCatalog[slug] || {
    dialColors: [],
    handColors: [],
    strapOptions: [],
    hasQuickRelease: false,
  };

  const [options, setOptions] = useState(getDefaultOptions(slug));
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    city: "",
    province: "",
    postalCode: "",
    country: "CA",
  });

  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [selectedShipping, setSelectedShipping] = useState(null);

  useEffect(() => {
    setOptions(getDefaultOptions(slug));
    setShippingOptions([]);
    setSelectedShipping(null);
    setShippingError("");
  }, [slug]);

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

  const productPriceCents = getBuildPriceCents(slug, options);
  const shippingPriceCents = selectedShipping?.priceCents ?? 0;
  const totalPriceCents = productPriceCents + shippingPriceCents;

  const summary = [
    options.dialColor ? `Dial: ${options.dialColor}` : null,
    options.handColor ? `Hands: ${options.handColor}` : null,
    options.strap ? `Strap: ${options.strap}` : null,
    cfg.hasQuickRelease ? `Quick release: ${options.quickRelease ? "Yes" : "No"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleQuoteShipping = async () => {
    try {
      setShippingLoading(true);
      setShippingError("");
      setShippingOptions([]);
      setSelectedShipping(null);

      const res = await fetch("/api/shipping-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          city: shippingAddress.city,
          province: shippingAddress.province,
          country: shippingAddress.country,
          postalCode: shippingAddress.postalCode,
        }),
      });

      const text = await res.text();
        let data = {};

        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          throw new Error(`Non-JSON response: ${text.slice(0, 200)}`);
        }

        console.error("Shipping quote response:", data);

        if (!res.ok) {
          throw new Error(data?.detail || data?.error || "Failed to get shipping quote");
        }

      setShippingOptions(data.options || []);
    } catch (err) {
      setShippingError(err.message || "Failed to get shipping quote");
    } finally {
      setShippingLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      if (!selectedShipping) {
        alert("Please calculate and select a shipping option first.");
        return;
      }

      setCheckoutLoading(true);

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          productName: product.name,
          options,
          shipping: {
            label: selectedShipping.label,
            priceCents: selectedShipping.priceCents,
            serviceId: selectedShipping.serviceId,
          },
        }),
      });

      const text = await res.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Non-JSON response: ${text.slice(0, 200)}`);
      }

      if (!res.ok || !data.url) {
        throw new Error(data?.error || "Failed to create checkout session");
      }

      window.location.href = data.url;
    } catch (err) {
      alert(err.message || "Failed to start checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="secondary" className="border-black/10 bg-black/5 text-zinc-900">
            <Link to="/">Back</Link>
          </Button>
          <Badge className="border border-black/10 bg-black/5 text-zinc-900">
            {formatMoney(productPriceCents)}
          </Badge>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {slug === "aviator" ? (
            <AviatorViewer options={options} />
          ) : (
            <Card className="overflow-hidden border-black/10 bg-zinc-50">
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
                  Choose the options you want. Pricing updates live below.
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
                  <Select
                    value={options.strap}
                    onValueChange={(val) => setOptions((v) => ({ ...v, strap: val }))}
                  >
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
                      className="data-[state=checked]:bg-sky-600 data-[state=unchecked]:bg-zinc-300"
                    />
                  </div>
                ) : null}

                <Separator className="bg-black/10" />

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-zinc-900">Live shipping quote</div>
                    <div className="text-xs text-zinc-600">
                      Enter your shipping destination to preview Purolator rates.
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm text-zinc-700">City</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress((v) => ({ ...v, city: e.target.value }))
                        }
                        className="h-10 rounded-md border border-black/10 bg-white px-3 text-sm text-zinc-900"
                        placeholder="Toronto"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm text-zinc-700">Province</label>
                      <input
                        type="text"
                        value={shippingAddress.province}
                        onChange={(e) =>
                          setShippingAddress((v) => ({ ...v, province: e.target.value }))
                        }
                        className="h-10 rounded-md border border-black/10 bg-white px-3 text-sm text-zinc-900"
                        placeholder="ON"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm text-zinc-700">Postal code</label>
                      <input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) =>
                          setShippingAddress((v) => ({ ...v, postalCode: e.target.value }))
                        }
                        className="h-10 rounded-md border border-black/10 bg-white px-3 text-sm text-zinc-900"
                        placeholder="M5V2T6"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm text-zinc-700">Country</label>
                      <input
                        type="text"
                        value={shippingAddress.country}
                        onChange={(e) =>
                          setShippingAddress((v) => ({ ...v, country: e.target.value }))
                        }
                        className="h-10 rounded-md border border-black/10 bg-white px-3 text-sm text-zinc-900"
                        placeholder="CA"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleQuoteShipping}
                    className="bg-sky-600 text-white hover:bg-sky-500"
                    disabled={shippingLoading}
                  >
                    {shippingLoading ? "Calculating..." : "Calculate shipping"}
                  </Button>

                  {shippingError ? (
                    <div className="text-sm text-red-600">{shippingError}</div>
                  ) : null}

                  {shippingOptions.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-zinc-900">Available shipping options</div>

                      {shippingOptions.map((option) => {
                        const isSelected = selectedShipping?.serviceId === option.serviceId;

                        return (
                          <button
                            key={option.serviceId}
                            type="button"
                            onClick={() => setSelectedShipping(option)}
                            className={`w-full rounded-xl border p-3 text-left transition ${
                              isSelected
                                ? "border-sky-500 bg-sky-50"
                                : "border-black/10 bg-white hover:bg-zinc-50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="text-sm font-medium text-zinc-900">
                                  {option.label}
                                </div>
                                <div className="text-xs text-zinc-600">
                                  {option.estimatedTransitDays
                                    ? `${option.estimatedTransitDays} business days`
                                    : option.expectedDeliveryDate || "Estimated delivery available"}
                                </div>
                              </div>

                              <div className="text-sm font-semibold text-zinc-900">
                                {formatMoney(option.priceCents)}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {selectedShipping ? (
                    <div className="rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm text-zinc-700">
                      <span className="font-medium">Selected shipping:</span>{" "}
                      {selectedShipping.label} · {formatMoney(selectedShipping.priceCents)}
                    </div>
                  ) : null}
                </div>

                <Separator className="bg-black/10" />

                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="mb-3 text-sm font-medium text-zinc-900">Pricing</div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Watch subtotal</span>
                      <span className="font-medium text-zinc-900">
                        {formatMoney(productPriceCents)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Shipping</span>
                      <span className="font-medium text-zinc-900">
                        {selectedShipping ? formatMoney(shippingPriceCents) : "Select shipping"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-black/10 pt-2 text-base">
                      <span className="font-semibold text-zinc-900">Total</span>
                      <span className="font-semibold text-zinc-900">
                        {formatMoney(totalPriceCents)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-zinc-700">
                  <span className="font-medium">Selected:</span> {summary || "No options selected"}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    className="w-full bg-sky-600 text-white hover:bg-sky-500 sm:w-auto"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? "Redirecting..." : "Checkout this build"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full border-black/10 bg-black/5 text-zinc-900 sm:w-auto"
                    onClick={() => {
                      setOptions(getDefaultOptions(slug));
                      setShippingOptions([]);
                      setSelectedShipping(null);
                      setShippingError("");
                    }}
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