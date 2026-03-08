import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function BespokeForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();

    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/bespoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setStatus("Request submitted. We will contact you soon.");
      setForm({ name: "", email: "", message: "" });

    } catch (err) {
      setStatus("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={submitForm} className="space-y-4 max-w-md">

      <input
        name="name"
        placeholder="Your name"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full border border-black/10 rounded-md px-3 py-2"
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        className="w-full border border-black/10 rounded-md px-3 py-2"
      />

      <textarea
        name="message"
        placeholder="Describe your bespoke watch"
        value={form.message}
        onChange={handleChange}
        required
        rows={4}
        className="w-full border border-black/10 rounded-md px-3 py-2"
      />

      <Button
        type="submit"
        disabled={loading}
        className="bg-black text-white hover:bg-zinc-800"
      >
        {loading ? "Sending..." : "Submit Request"}
      </Button>

      {status && (
        <div className="text-sm text-zinc-600">
          {status}
        </div>
      )}

    </form>
  );
}