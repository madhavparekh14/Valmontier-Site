import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function BespokeForm({ options, modelName = "Valmontier Aviator" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState({ type: "idle", text: "" });

  const payload = useMemo(() => {
    return {
      name,
      email,
      phone,
      message,
      model: modelName,
      dialColor: options?.dialColor || "",
      handColor: options?.handColor || "",
      strap: options?.strap || "",
    };
  }, [name, email, phone, message, modelName, options]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", text: "Submitting..." });

    try {
      const res = await fetch("/api/bespoke", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Request failed");
      }

      setStatus({ type: "ok", text: "Request received. We will reply by email." });
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setStatus({ type: "err", text: "Something went wrong. Please try again." });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm text-zinc-700">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-zinc-700">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm text-zinc-700">Phone (optional)</label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="grid gap-2">
        <label className="text-sm text-zinc-700">What do you want?</label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} />
      </div>

      <div className="text-xs text-zinc-600">
        Submitting with: {payload.model} · Dial: {payload.dialColor || "-"} · Hands: {payload.handColor || "-"} · Strap:{" "}
        {payload.strap || "-"}
      </div>

      <Button type="submit" disabled={status.type === "loading"} className="bg-sky-600 text-white hover:bg-sky-500">
        {status.type === "loading" ? "Submitting..." : "Submit bespoke request"}
      </Button>

      {status.type !== "idle" ? (
        <div
          className={
            status.type === "ok"
              ? "text-sm text-emerald-700"
              : status.type === "err"
              ? "text-sm text-red-600"
              : "text-sm text-zinc-700"
          }
        >
          {status.text}
        </div>
      ) : null}
    </form>
  );
}