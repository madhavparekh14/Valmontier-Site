import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const styleCatalog = {
  Rolex: ["Daytona", "Datejust", "Day Date", "Submariner", "Land Dweller"],
  Cartier: ["Tank", "Santos", "Panthére", "Ballon Bleu"],
  Patek: ["Nautilus", "Calatrava", "Aquanaut", "Cubitus"],
  Omega: ["Speedmaster", "Seamaster", "Constellation"],
  Tissot: ["PRX", "Seastar"],
  AP: ["Royal Oak"],
  "Grand Seiko": ["Heritage", "Sport"],
};

const caseFinishOptions = ["Silver", "Black", "Gold", "Rose Gold"];

const movementOptions = ["Automatic", "Quartz"];

const strapStyleOptions = [
  "Jubilee",
  "Oyster",
  "Presidential",
  "Leather Strap",
  "Rubber",
  "Flat Jubilee",
];

const handsStyleOptions = [
  "Dauphine",
  "Sword",
  "Cathedral",
  "Mercedes",
  "Alpha",
  "Leaf",
  "Baton",
  "Snowflake",
  "Syringe",
  "Arrow",
  "Lance",
  "Spade",
  "Fleur de Lys",
  "Skeleton",
];

export default function BespokeForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    budget: "300-500",
    styleBrand: "Rolex",
    styleBuild: "Daytona",
    caseSize: "40mm",
    caseFinish: "Silver",
    bracelet: "Jubilee",
    hands: "Dauphine",
    movement: "Automatic",
    bezel: "Fluted",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const exampleNotes = useMemo(
    () =>
      "40mm brushed case, dark sunburst dial, applied indices, slim baton hands, tapered bracelet, automatic movement, minimal branding, strong lume.",
    []
  );

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/_/g, "_");

  const buildImageSrc = `/watch-builds/${slugify(form.styleBuild)}_${slugify(
    form.caseFinish
  )}_${slugify(form.bracelet.replace(" Strap", ""))}.png`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/bespoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          budget: form.budget,
          styleBrand: form.styleBrand,
          styleBuild: form.styleBuild,
          caseSize: form.caseSize,
          caseFinish: form.caseFinish,
          bracelet: form.bracelet,
          hands: form.hands,
          movement: form.movement,
          bezel: form.styleBrand === "Rolex" ? form.bezel : undefined,
          notes: form.notes,
          message: form.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Submission failed");
      }

      setStatus("Request submitted. We will contact you soon.");
    } catch (err) {
      setStatus(err.message || "Submission failed");
    }
  };

    return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* LEFT: FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm text-zinc-700">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Your name"
              required
              className="border-black/10 bg-white"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-zinc-700">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="you@domain.com"
              required
              className="border-black/10 bg-white"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-zinc-700">Budget</label>
          <Select value={form.budget} onValueChange={(val) => setField("budget", val)}>
            <SelectTrigger className="border-black/10 bg-white">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="border-black/10 bg-white text-zinc-900">
              <SelectItem value="300-500">$300 to $500</SelectItem>
              <SelectItem value="500-750">$500 to $750</SelectItem>
              <SelectItem value="750-1000">$750 to $1,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm text-zinc-700">Inspired brand</label>
            <Select
              value={form.styleBrand}
              onValueChange={(val) =>
                setForm((prev) => ({
                  ...prev,
                  styleBrand: val,
                  styleBuild: styleCatalog[val]?.[0] || "",
                  bezel: "Fluted",
                }))
              }
            >
              <SelectTrigger className="border-black/10 bg-white">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent className="border-black/10 bg-white text-zinc-900">
                {Object.keys(styleCatalog).map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-zinc-700">Inspired build</label>
            <Select
              value={form.styleBuild}
              onValueChange={(val) => setField("styleBuild", val)}
            >
              <SelectTrigger className="border-black/10 bg-white">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent className="border-black/10 bg-white text-zinc-900">
                {(styleCatalog[form.styleBrand] || []).map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm text-zinc-700">Case size</label>
            <Input
              value={form.caseSize}
              onChange={(e) => setField("caseSize", e.target.value)}
              placeholder="40mm"
              className="border-black/10 bg-white"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-zinc-700">Case finish</label>
            <Select value={form.caseFinish} onValueChange={(val) => setField("caseFinish", val)}>
              <SelectTrigger className="border-black/10 bg-white">
                <SelectValue placeholder="Select finish" />
              </SelectTrigger>
              <SelectContent className="border-black/10 bg-white text-zinc-900">
                {caseFinishOptions.map((finish) => (
                  <SelectItem key={finish} value={finish}>
                    {finish}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-zinc-700">Strap style</label>
            <Select value={form.bracelet} onValueChange={(val) => setField("bracelet", val)}>
              <SelectTrigger className="border-black/10 bg-white">
                <SelectValue placeholder="Select strap" />
              </SelectTrigger>
              <SelectContent className="border-black/10 bg-white text-zinc-900">
                {strapStyleOptions.map((strap) => (
                  <SelectItem key={strap} value={strap}>
                    {strap}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-zinc-700">Hands style</label>
            <Select value={form.hands} onValueChange={(val) => setField("hands", val)}>
              <SelectTrigger className="border-black/10 bg-white">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent className="border-black/10 bg-white text-zinc-900">
                {handsStyleOptions.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <label className="text-sm text-zinc-700">Movement</label>
            <Select value={form.movement} onValueChange={(val) => setField("movement", val)}>
              <SelectTrigger className="border-black/10 bg-white">
                <SelectValue placeholder="Select movement" />
              </SelectTrigger>
              <SelectContent className="border-black/10 bg-white text-zinc-900">
                {movementOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.styleBrand === "Rolex" && (
            <div className="grid gap-2 sm:col-span-2">
              <label className="text-sm text-zinc-700">Bezel</label>
              <Select value={form.bezel} onValueChange={(val) => setField("bezel", val)}>
                <SelectTrigger className="border-black/10 bg-white">
                  <SelectValue placeholder="Select bezel" />
                </SelectTrigger>
                <SelectContent className="border-black/10 bg-white text-zinc-900">
                  <SelectItem value="Fluted">Fluted</SelectItem>
                  <SelectItem value="Smooth">Smooth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-zinc-700">Design notes</label>
          <Textarea
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            className="min-h-[140px] border-black/10 bg-white"
            placeholder="Dial style, indices, lume preference, date or no date, and any inspiration references."
            required
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            className="w-full border border-black/10 bg-black/5 text-zinc-900 hover:bg-black/10 sm:w-auto"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                notes: prev.notes?.trim() ? prev.notes : exampleNotes,
              }))
            }
          >
            Prefill example
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white hover:bg-sky-500 sm:w-auto"
          >
            {loading ? "Sending..." : "Submit request"}
          </Button>
        </div>

        {status ? <div className="text-sm text-zinc-600">{status}</div> : null}
      </form>

      {/* RIGHT: LIVE PREVIEW */}
      <Card className="overflow-hidden border-black/10 bg-zinc-50">
        <CardHeader>
          <CardTitle className="text-zinc-900">Live build preview</CardTitle>
          <CardDescription className="text-zinc-500">
            Updates based on your selections.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-3xl border border-black/10 bg-black">
            <img
              src={buildImageSrc}
              alt={`${form.caseFinish} ${form.styleBuild} with ${form.bracelet}`}
              className="h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "/watch-builds/placeholder.png";
              }}
            />
          </div>

          <div className="mt-4 text-sm text-zinc-600">
            {form.styleBrand} {form.styleBuild} · {form.caseFinish} · {form.bracelet}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}