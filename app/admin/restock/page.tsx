"use client";

import { useState, useMemo, useEffect } from "react";
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
    discount: "",
    gst: "",
  });
  const [filtered, setFiltered] = useState<ProductEntry[]>([]);
  const allProducts = useMemo(() => getAllProducts(), []);

  useEffect(() => {
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
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
    };
    setItems([...items, newItem]);
    setForm({ productName: "", code: "", brand: "", packSize: "", quantity: "", price: "", discount: "", gst: "" });
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const exportCSV = () => {
    const headers = ["Product", "Code", "Brand", "Pack Size", "Qty", "Price", "Total"];
    const rows = items.map((i) => [i.productName, i.code, i.brand, i.packSize, i.quantity, i.price, i.price * i.quantity]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "restock.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Chemical Corporation, Ludhiana</h1>
          <p className="text-gray-500">Restock Dashboard</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Product to Restock</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-3">
              <Label>Search Product</Label>
              <Input
                value={form.productName}
                onChange={(e) => {
                  const query = e.target.value.toLowerCase();
                  const results = allProducts.filter((p) =>
                    `${p.productName} ${p.code} ${p.packSize}`.toLowerCase().includes(query)
                  );
                  setForm({ ...form, productName: e.target.value });
                  setFiltered(results);
                }}
              />
              {form.productName && filtered.length > 0 && (
                <div className="absolute z-10 bg-white shadow border mt-1 w-full max-h-64 overflow-y-auto text-sm">
                  {filtered.slice(0, 50).map((product, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setForm({
                          productName: product.productName,
                          code: product.code,
                          brand: product.brand,
                          packSize: product.packSize,
                          quantity: "",
                          price: product.price.toString(),
                          discount: "",
                          gst: "",
                        });
                        setFiltered([]);
                      }}
                    >
                      <span className="font-medium">{product.productName}</span>{" "}
                      <span className="text-xs text-muted-foreground">
                        [Code: {product.code}] • [Size: {product.packSize}]
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>Brand</Label>
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
            <div>
              <Label>Pack Size</Label>
              <Input value={form.packSize} onChange={(e) => setForm({ ...form, packSize: e.target.value })} />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div>
              <Label>Price</nLabel>
