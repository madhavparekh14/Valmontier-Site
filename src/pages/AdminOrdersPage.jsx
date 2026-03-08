import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status] || "bg-zinc-100 text-zinc-700 border-zinc-200"}`}>
      {status}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(mockOrders);
  const [selectedId, setSelectedId] = useState(mockOrders[0]?.id ?? "");
  const [filter, setFilter] = useState("All");

  const filteredOrders = useMemo(() => {
    if (filter === "All") return orders;
    return orders.filter((o) => o.supplier.status === filter || o.status === filter);
  }, [orders, filter]);

  const selectedOrder =
    filteredOrders.find((o) => o.id === selectedId) ||
    orders.find((o) => o.id === selectedId) ||
    filteredOrders[0];

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-500">Valmontier Admin</div>
            <h1 className="text-3xl font-semibold">Orders</h1>
          </div>

          <Button asChild variant="secondary" className="border-black/10 bg-black/5 text-zinc-900">
            <Link to="/">Back to site</Link>
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {["All", "Paid", "Ready to Fulfill", "Ordered from Supplier", "Fulfilled"].map((x) => (
            <button
              key={x}
              type="button"
              onClick={() => setFilter(x)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                filter === x
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
                    onClick={() => setSelectedId(order.id)}
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
      </div>
    </div>
  );
}