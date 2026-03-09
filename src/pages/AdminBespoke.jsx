import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Mail, ScrollText, Sparkles } from "lucide-react";

function StatusPill({ status }) {
  const styles = {
    new: "bg-sky-50 text-sky-700 border-sky-200",
    quoted: "bg-amber-50 text-amber-700 border-amber-200",
    closed: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-zinc-100 text-zinc-700 border-zinc-200"
      }`}
    >
      {status || "new"}
    </span>
  );
}

export default function AdminBespoke() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const endpoint = showArchived
          ? "/api/admin/bespoke?archived=1"
          : "/api/admin/bespoke";

        const res = await fetch(endpoint);
        const text = await res.text();

        let data;
        try {
          data = text ? JSON.parse(text) : [];
        } catch {
          throw new Error(`Non-JSON response: ${text.slice(0, 120)}`);
        }

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load bespoke requests");
        }

        const rows = Array.isArray(data) ? data : [];
        setRequests(rows);
        setSelectedId(rows[0]?.id ?? null);
      } catch (err) {
        setError(err.message || "Failed to load bespoke requests");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [showArchived]);

  const selectedRequest =
    requests.find((r) => r.id === selectedId) || requests[0] || null;

  const handleArchive = async (id) => {
    if (!window.confirm("Archive this bespoke request?")) return;

    const res = await fetch("/api/admin/archive-bespoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      alert("Failed to archive request");
      return;
    }

    const remaining = requests.filter((r) => r.id !== id);
    setRequests(remaining);
    setSelectedId(remaining[0]?.id ?? null);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-zinc-500">Valmontier Admin</div>
            <h1 className="text-3xl font-semibold">Bespoke Requests</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Review, quote, and archive custom watch inquiries.
            </p>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="secondary" className="border-black/10 bg-black/5 text-zinc-900">
              <Link to="/admin/orders">Orders Dashboard</Link>
            </Button>
            <Button asChild variant="secondary" className="border-black/10 bg-black/5 text-zinc-900">
              <Link to="/">Back to site</Link>
            </Button>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setShowArchived(false)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              !showArchived
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Active
          </button>

          <button
            type="button"
            onClick={() => setShowArchived(true)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              showArchived
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Archived
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-black/10 bg-zinc-50">
            <CardHeader>
              <CardTitle>Request queue</CardTitle>
              <CardDescription className="text-zinc-600">
                {showArchived
                  ? "Archived bespoke requests."
                  : "Active bespoke requests awaiting review."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {loading ? (
                <div className="text-sm text-zinc-600">Loading bespoke requests...</div>
              ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              ) : requests.length === 0 ? (
                <div className="text-sm text-zinc-600">
                  {showArchived ? "No archived requests." : "No bespoke requests yet."}
                </div>
              ) : (
                requests.map((req) => {
                  const active = selectedRequest?.id === req.id;

                  return (
                    <button
                      key={req.id}
                      type="button"
                      onClick={() => setSelectedId(req.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-sky-500 bg-sky-50"
                          : "border-black/10 bg-white hover:bg-zinc-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-zinc-900">{req.name}</div>
                          <div className="mt-1 text-sm text-zinc-700">
                            {req.style_brand || "No brand"} · {req.style_build || "No model"}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500">{req.email}</div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <StatusPill status={req.status || "new"} />
                          {req.budget ? (
                            <Badge className="border border-black/10 bg-black/5 text-zinc-900">
                              {req.budget}
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-zinc-600">
                          {req.case_size || "No size"} · {req.movement || "No movement"}
                        </span>
                        <span className="text-zinc-500">
                          {req.created_at ? new Date(req.created_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-black/10 bg-zinc-50">
            <CardHeader>
              <CardTitle>Request details</CardTitle>
              <CardDescription className="text-zinc-600">
                Full bespoke intake details for quoting and follow-up.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {selectedRequest ? (
                <>
                  <div>
                    <div className="text-lg font-semibold text-zinc-900">{selectedRequest.name}</div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Mail className="h-4 w-4" />
                      {selectedRequest.email}
                    </div>
                  </div>

                  <Separator className="bg-black/10" />

                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Inspired brand</span>
                      <span>{selectedRequest.style_brand || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Inspired build</span>
                      <span>{selectedRequest.style_build || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Budget</span>
                      <span>{selectedRequest.budget || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Case size</span>
                      <span>{selectedRequest.case_size || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Case finish</span>
                      <span>{selectedRequest.case_finish || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Bracelet / strap</span>
                      <span>{selectedRequest.bracelet || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Hands</span>
                      <span>{selectedRequest.hands || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Movement</span>
                      <span>{selectedRequest.movement || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Submitted</span>
                      <span>
                        {selectedRequest.created_at
                          ? new Date(selectedRequest.created_at).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <Separator className="bg-black/10" />

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-900">
                      <ScrollText className="h-4 w-4 text-sky-600" />
                      Design notes
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm leading-relaxed text-zinc-700">
                      {selectedRequest.message || "No notes submitted."}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Request status</span>
                      <StatusPill status={selectedRequest.status || "new"} />
                    </div>
                  </div>

                  {!showArchived ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="border-black/10 bg-black/5 text-zinc-900"
                      onClick={() => handleArchive(selectedRequest.id)}
                    >
                      Archive request
                    </Button>
                  ) : null}
                </>
              ) : (
                <div className="text-sm text-zinc-600">No bespoke request selected.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}