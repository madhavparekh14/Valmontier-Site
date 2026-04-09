import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const styleCatalog = {
  Rolex: ["Daytona", "Datejust", "Submariner", "DayDate", "Land Dweller"],
  Cartier: ["Tank", "Santos", "Ballon Bleu", "Panthère"],
  Patek, Philippe: ["Nautilus", "Aquanaut", "Cubitus"],
  Grand, Seiko: ["Spring Drive Dress", "Heritage", "Sport"],
  Audemars, Piguet: ["Royal Oak"],
};

export default function BespokeForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    budget: "300-500",
    styleBrand: "Rolex",
    styleBuild: "Daytona",
    caseSize: "40mm",
    caseFinish: "Brushed steel",
    bracelet: "Tapered bracelet",
    hands: "Slim baton",
    movement: "Automatic",
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
          <Input
            value={form.caseFinish}
            onChange={(e) => setField("caseFinish", e.target.value)}
            placeholder="Brushed steel"
            className="border-black/10 bg-white"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-zinc-700">Bracelet or strap</label>
          <Input
            value={form.bracelet}
            onChange={(e) => setField("bracelet", e.target.value)}
            placeholder="Tapered bracelet"
            className="border-black/10 bg-white"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-zinc-700">Hands style</label>
          <Input
            value={form.hands}
            onChange={(e) => setField("hands", e.target.value)}
            placeholder="Slim baton"
            className="border-black/10 bg-white"
          />
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <label className="text-sm text-zinc-700">Movement</label>
          <Input
            value={form.movement}
            onChange={(e) => setField("movement", e.target.value)}
            placeholder="Automatic, quartz, or specify a movement"
            className="border-black/10 bg-white"
          />
        </div>
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
  );
}