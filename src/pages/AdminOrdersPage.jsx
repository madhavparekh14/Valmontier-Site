import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Package, ScrollText, Mail, Sparkles, Truck } from "lucide-react";

const mockOrders = [
  {
    id: "VAL-1001",
    createdAt: "2026-03-02 14:22",
    customerName: "John Doe",
    email: "john@example.com",
    model: "Valmontier Aviator",
    total: 499.99,
    status: "Paid",
    shippingMethod: "Purolator Ground",
    shippingCost: 18.95,
    strap: "Black Leather",
    dialColor: "White Roman",
    handColor: "Blue",
    address: {
      line1: "123 King St W",
      city: "Toronto",
      province: "ON",
      postalCode: "M5V2T6",
      country: "CA",
    },
    supplier: {
      product: "AliExpress Santos-style case set",
      variant: "White dial / black strap",
      cost: 129.5,
      status: "Ready to Fulfill",
    },
  },
  {
    id: "VAL-1002",
    createdAt: "2026-03-02 15:47",
    customerName: "Sarah Lee",
    email: "sarah@example.com",
    model: "Grand Valmontier",
    total: 529.99,
    status: "Paid",
    shippingMethod: "Purolator Express",
    shippingCost: 27.5,
    strap: "Steel Bracelet",
    dialColor: "Sky Blue",
    handColor: "Steel",
    address: {
      line1: "55 Main St",
      city: "Vancouver",
      province: "BC",
      postalCode: "V6B1A1",
      country: "CA",
    },
    supplier: {
      product: "AliExpress GS-style build",
      variant: "Blue dial / bracelet",
      cost: 148.2,
      status: "Ordered from Supplier",
    },
  },
];

function StatusPill({ status }) {
  const styles = {
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Fulfilled: "bg-sky-50 text-sky-700 border-sky-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
    "Ready to Fulfill": "bg-zinc-100 text-zinc-700 border-zinc-200",
    "Ordered from Supplier": "bg-violet-50 text-violet-700 border-violet-200",
    new: "bg-sky-50 text-sky-700 border-sky-200",
    quoted: "bg-amber-50 text-amber-700 border-amber-200",
    closed: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status] || "bg-zinc-100 text-zinc-700 border-zinc-200"}`}>
      {status}
    </span>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-sky-500 bg-sky-50 text-sky-700"
          : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

export default function AdminOrdersPage() {
  const [tab, setTab] = useState("orders");

  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrderId, setSelectedOrderId] = useState(mockOrders[0]?.id ?? "");
  const [orderFilter, setOrderFilter] = useState("All");

  const [bespokeRequests, setBespokeRequests] = useState([]);
  const [bespokeLoading, setBespokeLoading] = useState(true);
  const [bespokeError, setBespokeError] = useState("");
  const [selectedBespokeId, setSelectedBespokeId] = useState(null);
  const [showArchivedBespoke, setShowArchivedBespoke] = useState(false);
  const [labelLoading, setLabelLoading] = useState(false);
  const [labelResult, setLabelResult] = useState(null);

  useEffect(() => {
    async function loadBespoke() {
      try {
        setBespokeLoading(true);
        setBespokeError("");

        const endpoint = showArchivedBespoke
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
        setBespokeRequests(rows);
        setSelectedBespokeId(rows[0]?.id ?? null);
      } catch (err) {
        setBespokeError(err.message || "Failed to load bespoke requests");
      } finally {
        setBespokeLoading(false);
      }
    }

    loadBespoke();
  }, [showArchivedBespoke]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === "All") return orders;
    return orders.filter((o) => o.supplier.status === orderFilter || o.status === orderFilter);
  }, [orders, orderFilter]);

  const selectedOrder =
    filteredOrders.find((o) => o.id === selectedOrderId) ||
    orders.find((o) => o.id === selectedOrderId) ||
    filteredOrders[0];

  const selectedBespoke =
    bespokeRequests.find((r) => r.id === selectedBespokeId) ||
    bespokeRequests[0] ||
    null;
  const handleGenerateLabel = async () => {
  if (!selectedOrder) return;

  try {
    setLabelLoading(true);
    setLabelResult(null);

    const res = await fetch("/api/admin/create-shipment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: selectedOrder.id,
        serviceId:
          selectedOrder.shippingMethod === "Purolator Express"
            ? "PurolatorExpress"
            : "PurolatorGround",
        customerName: selectedOrder.customerName,
        email: selectedOrder.email,
        phone: selectedOrder.phone || "0000000000",
        model: selectedOrder.model,
        address: selectedOrder.address,
      }),
    });

    const text = await res.text();

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Non-JSON response: ${text.slice(0, 200)}`);
    }

    if (!res.ok) {
      throw new Error(data?.detail || data?.error || "Failed to create shipment");
    }

    setLabelResult(data);
  } catch (err) {
    alert(err.message || "Failed to generate shipping label");
  } finally {
    setLabelLoading(false);
  }
};

  const handleArchiveBespoke = async (id) => {
    try {
      const res = await fetch("/api/admin/archive-bespoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const text = await res.text();

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Non-JSON response: ${text.slice(0, 120)}`);
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to archive request");
      }

      const remaining = bespokeRequests.filter((r) => r.id !== id);
      setBespokeRequests(remaining);
      setSelectedBespokeId(remaining[0]?.id ?? null);
    } catch (err) {
      alert(err.message || "Failed to archive request");
      console.error("Archive bespoke failed:", err);
    }
  };

  const updateSupplierStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              supplier: {
                ...o.supplier,
                status: newStatus,
              },
            }
          : o
      )
    );
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-zinc-500">Valmontier Admin</div>
            <h1 className="text-3xl font-semibold">Operations Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Review paid orders, track fulfillment, and manage bespoke requests.
            </p>
          </div>

          <Button asChild variant="secondary" className="border-black/10 bg-black/5 text-zinc-900">
            <Link to="/">Back to site</Link>
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <TabButton
            active={tab === "orders"}
            onClick={() => setTab("orders")}
            icon={<Package className="h-4 w-4" />}
          >
            Orders
          </TabButton>

          <TabButton
            active={tab === "bespoke"}
            onClick={() => setTab("bespoke")}
            icon={<Sparkles className="h-4 w-4" />}
          >
            Bespoke Requests
          </TabButton>

          <TabButton
            active={tab === "labels"}
            onClick={() => setTab("labels")}
            icon={<Truck className="h-4 w-4" />}
          >
            Shipping Labels
          </TabButton>
        </div>

        {tab === "orders" ? (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {["All", "Paid", "Ready to Fulfill", "Ordered from Supplier", "Fulfilled"].map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => setOrderFilter(x)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    orderFilter === x
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {x}
                </button>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-black/10 bg-zinc-50">
                <CardHeader>
                  <CardTitle>Order queue</CardTitle>
                  <CardDescription className="text-zinc-600">
                    Review paid orders and move them through fulfillment.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {filteredOrders.map((order) => {
                    const active = selectedOrder?.id === order.id;

                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-sky-500 bg-sky-50"
                            : "border-black/10 bg-white hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-zinc-900">{order.id}</div>
                            <div className="mt-1 text-sm text-zinc-700">
                              {order.customerName} · {order.model}
                            </div>
                            <div className="mt-1 text-xs text-zinc-500">{order.createdAt}</div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <StatusPill status={order.status} />
                            <StatusPill status={order.supplier.status} />
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-zinc-600">{order.shippingMethod}</span>
                          <span className="font-medium text-zinc-900">${order.total.toFixed(2)}</span>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="border-black/10 bg-zinc-50">
                <CardHeader>
                  <CardTitle>Order details</CardTitle>
                  <CardDescription className="text-zinc-600">
                    Review customer configuration and supplier mapping.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  {selectedOrder ? (
                    <>
                      <div>
                        <div className="text-lg font-semibold text-zinc-900">{selectedOrder.id}</div>
                        <div className="text-sm text-zinc-600">
                          {selectedOrder.customerName} · {selectedOrder.email}
                        </div>
                      </div>

                      <Separator className="bg-black/10" />

                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Model</span>
                          <span>{selectedOrder.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Dial</span>
                          <span>{selectedOrder.dialColor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Hands</span>
                          <span>{selectedOrder.handColor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Strap</span>
                          <span>{selectedOrder.strap}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Shipping</span>
                          <span>
                            {selectedOrder.shippingMethod} · ${selectedOrder.shippingCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Total</span>
                          <span className="font-medium">${selectedOrder.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <Separator className="bg-black/10" />

                      <div>
                        <div className="mb-2 text-sm font-medium text-zinc-900">Ship to</div>
                        <div className="text-sm text-zinc-600">
                          <div>{selectedOrder.address.line1}</div>
                          <div>
                            {selectedOrder.address.city}, {selectedOrder.address.province}{" "}
                            {selectedOrder.address.postalCode}
                          </div>
                          <div>{selectedOrder.address.country}</div>
                        </div>
                      </div>

                      <Separator className="bg-black/10" />

                      <div>
                        <div className="mb-2 text-sm font-medium text-zinc-900">Supplier mapping</div>
                        <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Supplier product</span>
                            <span className="max-w-[220px] text-right">{selectedOrder.supplier.product}</span>
                          </div>
                          <div className="mt-2 flex justify-between">
                            <span className="text-zinc-500">Variant</span>
                            <span className="max-w-[220px] text-right">{selectedOrder.supplier.variant}</span>
                          </div>
                          <div className="mt-2 flex justify-between">
                            <span className="text-zinc-500">Supplier cost</span>
                            <span>${selectedOrder.supplier.cost.toFixed(2)}</span>
                          </div>
                          <div className="mt-2 flex justify-between">
                            <span className="text-zinc-500">Status</span>
                            <StatusPill status={selectedOrder.supplier.status} />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button
                          type="button"
                          className="bg-sky-600 text-white hover:bg-sky-500"
                          onClick={() => updateSupplierStatus(selectedOrder.id, "Ordered from Supplier")}
                        >
                          Mark as ordered
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          className="border-black/10 bg-black/5 text-zinc-900"
                          onClick={() => updateSupplierStatus(selectedOrder.id, "Fulfilled")}
                        >
                          Mark as fulfilled
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-zinc-600">No order selected.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : tab === "bespoke" ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-black/10 bg-zinc-50">
              <CardHeader>
                <CardTitle>Bespoke request queue</CardTitle>
                <CardDescription className="text-zinc-600">
                  Review custom build inquiries and respond with pricing or feasibility.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="mb-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowArchivedBespoke(false)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      !showArchivedBespoke
                        ? "border-sky-500 bg-sky-50 text-sky-700"
                        : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    Active
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowArchivedBespoke(true)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      showArchivedBespoke
                        ? "border-sky-500 bg-sky-50 text-sky-700"
                        : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    Archived
                  </button>
                </div>

                {bespokeLoading ? (
                  <div className="text-sm text-zinc-600">Loading bespoke requests...</div>
                ) : bespokeError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {bespokeError}
                  </div>
                ) : bespokeRequests.length === 0 ? (
                  <div className="text-sm text-zinc-600">
                    {showArchivedBespoke ? "No archived bespoke requests." : "No bespoke requests yet."}
                  </div>
                ) : (
                  bespokeRequests.map((req) => {
                    const active = selectedBespoke?.id === req.id;

                    return (
                      <button
                        key={req.id}
                        type="button"
                        onClick={() => setSelectedBespokeId(req.id)}
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
                            {req.budget ? <Badge className="border border-black/10 bg-black/5 text-zinc-900">{req.budget}</Badge> : null}
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
                {selectedBespoke ? (
                  <>
                    <div>
                      <div className="text-lg font-semibold text-zinc-900">{selectedBespoke.name}</div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Mail className="h-4 w-4" />
                        {selectedBespoke.email}
                      </div>
                    </div>

                    <Separator className="bg-black/10" />

                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Inspired brand</span>
                        <span>{selectedBespoke.style_brand || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Inspired build</span>
                        <span>{selectedBespoke.style_build || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Budget</span>
                        <span>{selectedBespoke.budget || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Case size</span>
                        <span>{selectedBespoke.case_size || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Case finish</span>
                        <span>{selectedBespoke.case_finish || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Bracelet / strap</span>
                        <span>{selectedBespoke.bracelet || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Hands</span>
                        <span>{selectedBespoke.hands || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Movement</span>
                        <span>{selectedBespoke.movement || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Submitted</span>
                        <span>
                          {selectedBespoke.created_at
                            ? new Date(selectedBespoke.created_at).toLocaleString()
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
                        {selectedBespoke.message || "No notes submitted."}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Request status</span>
                        <StatusPill status={selectedBespoke.status || "new"} />
                      </div>
                    </div>

                    {!showArchivedBespoke ? (
                      <Button
                        type="button"
                        variant="secondary"
                        className="border-black/10 bg-black/5 text-zinc-900"
                        onClick={() => handleArchiveBespoke(selectedBespoke.id)}
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
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-black/10 bg-zinc-50">
              <CardHeader>
                <CardTitle>Ready for labels</CardTitle>
                <CardDescription className="text-zinc-600">
                  Prepare shipments and generate carrier labels for completed orders.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {orders.map((order) => {
                  const active = selectedOrder?.id === order.id;

                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-sky-500 bg-sky-50"
                          : "border-black/10 bg-white hover:bg-zinc-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-zinc-900">{order.id}</div>
                          <div className="mt-1 text-sm text-zinc-700">
                            {order.customerName} · {order.model}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500">
                            {order.address.city}, {order.address.province}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <StatusPill status={order.status} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-black/10 bg-zinc-50">
              <CardHeader>
                <CardTitle>Label generation</CardTitle>
                <CardDescription className="text-zinc-600">
                  Review shipment details before generating a shipping label.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {selectedOrder ? (
                  <>
                    <div>
                      <div className="text-lg font-semibold text-zinc-900">{selectedOrder.id}</div>
                      <div className="text-sm text-zinc-600">
                        {selectedOrder.customerName} · {selectedOrder.email}
                      </div>
                    </div>

                    <Separator className="bg-black/10" />

                    <div>
                      <div className="mb-2 text-sm font-medium text-zinc-900">Ship to</div>
                      <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-zinc-700">
                        <div>{selectedOrder.address.line1}</div>
                        <div>
                          {selectedOrder.address.city}, {selectedOrder.address.province}{" "}
                          {selectedOrder.address.postalCode}
                        </div>
                        <div>{selectedOrder.address.country}</div>
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Shipping service</span>
                        <span>{selectedOrder.shippingMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Shipping paid</span>
                        <span>${selectedOrder.shippingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Order status</span>
                        <span>{selectedOrder.status}</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="bg-sky-600 text-white hover:bg-sky-500"
                      onClick={handleGenerateLabel}
                      disabled={labelLoading}
                    >
                      {labelLoading ? "Generating..." : "Generate shipping label"}
                    </Button>
                    {labelResult ? (
                      <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Shipment PIN</span>
                          <span>{labelResult.shipmentPin}</span>
                        </div>
                        <div className="mt-2 flex justify-between">
                          <span className="text-zinc-500">Tracking number</span>
                          <span>{labelResult.trackingNumber}</span>
                        </div>

                        {labelResult.label?.base64 ? (
                          <a
                            className="mt-4 inline-flex rounded-lg border border-black/10 bg-black/5 px-4 py-2 text-sm text-zinc-900 hover:bg-black/10"
                            href={`data:${labelResult.label.mimeType};base64,${labelResult.label.base64}`}
                            download={`${selectedOrder.id}-label.pdf`}
                          >
                            Download label
                          </a>
                        ) : (
                          <div className="mt-3 text-xs text-zinc-500">
                            Shipment created, but no label document was returned.
                          </div>
                        )}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="text-sm text-zinc-600">No order selected.</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}