"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AccessDenied } from "@/components/access-denied";
import { Header } from "@/components/header";
import { getAllProducts, ProductEntry } from "@/lib/get-all-products";

interface RestockItem {
  id: number;
  productName: string;
  code: string;
  brand: string;
  packSize: string;
  quantity: number;
  price: number;
}

export default function RestockPage() {
  const { role, loading } = useAuth();
  if (!loading && role !== "admin") {
    return <AccessDenied />;
  }

  const [items, setItems] = useState<RestockItem[]>([]);
  const [form, setForm] = useState({
    productName: "",
    code: "",
    brand: "",
    packSize: "",
    quantity: "",
    price: "",
  });
  const [filtered, setFiltered] = useState<ProductEntry[]>([]);
  const allProducts = useMemo(() => getAllProducts(), []);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside (like quotations page)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFiltered([]);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    // Quick sanity log, like you had
    console.log(
      "Loaded products:",
      allProducts.length,
      Array.from(new Set(allProducts.map((p) => p.brand)))
    );
  }, [allProducts]);

  const handleAdd = () => {
    if (!form.productName || !form.quantity || !form.price) return;
    const newItem: RestockItem = {
      id: Date.now(),
      productName: form.productName,
      code: form.code,
      brand: form.brand,
      packSize: form.packSize,
      quantity: parseInt(form.quantity, 10),
      price: parseFloat(form.price),
    };
    setItems((prev) => [...prev, newItem]);
    setForm({
      productName: "",
      code: "",
      brand: "",
      packSize: "",
      quantity: "",
      price: "",
    });
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const exportCSV = () => {
    const headers = ["Product", "Code", "Brand", "Pack Size", "Qty", "Price", "Total"];
    const rows = items.map((i) => [
      i.productName,
      i.code,
      i.brand,
      i.packSize,
      i.quantity.toString(),
      i.price.toFixed(2),
      (i.price * i.quantity).toFixed(2),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "restock.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8" ref={containerRef}>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Chemical Corporation, Ludhiana</h1>
          <p className="text-gray-500">Restock Dashboard</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Product to Restock</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-4 relative">
            {/* Search */}
            <div className="relative md:col-span-3">
              <Label>Search Product</Label>
              <Input
                value={form.productName}
                onChange={(e) => {
                  const q = e.target.value;
                  const lower = q.toLowerCase();
                  setForm((f) => ({ ...f, productName: q }));
                  if (!q) {
                    setFiltered([]);
                    return;
                  }
                  setFiltered(
                    allProducts.filter((p) =>
                      `${p.productName} ${p.code} ${p.packSize}`.toLowerCase().includes(lower)
                    )
                  );
                }}
              />
              {filtered.length > 0 && (
                <div className="absolute z-10 bg-white shadow border mt-1 w-full max-h-64 overflow-y-auto text-sm">
                  {filtered.slice(0, 50).map((p, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setForm({
                          productName: `${p.productName} [${p.code}]`,
                          code: p.code,
                          brand: p.brand,
                          packSize: p.packSize,
                          quantity: "",
                          price: p.price ? String(p.price) : "",
                        });
                        setFiltered([]); // ✅ close dropdown
                      }}
                    >
                      <span className="font-medium">{p.productName}</span>{" "}
                      <span className="text-xs text-muted-foreground">
                        [Code: {p.code}] • [Size: {p.packSize}]
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Brand</Label>
              <Input
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
              />
            </div>

            <div>
              <Label>Pack Size</Label>
              <Input
                value={form.packSize}
                onChange={(e) => setForm((f) => ({ ...f, packSize: e.target.value }))}
              />
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
            </div>

            <div>
              <Label>Price</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>

            <div className="md:col-span-6 text-right">
              <Button onClick={handleAdd}>Add</Button>
            </div>
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Restock List</CardTitle>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th>Code</th>
                    <th>Brand</th>
                    <th>Pack Size</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="border-b">
                      <td>{i.productName}</td>
                      <td>{i.code}</td>
                      <td>{i.brand}</td>
                      <td>{i.packSize}</td>
                      <td>{i.quantity}</td>
                      <td>₹{i.price.toFixed(2)}</td>
                      <td>₹{(i.quantity * i.price).toFixed(2)}</td>
                      <td>
                        <Button variant="destructive" size="sm" onClick={() => removeItem(i.id)}>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
