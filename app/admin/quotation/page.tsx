"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AccessDenied } from "@/components/access-denied";
import { Header } from "@/components/header";
import { getAllProducts, ProductEntry } from "@/lib/get-all-products";

interface QuotationItem {
  id: number;
  productCode: string;
  productName: string;
  brand: string;
  packSize: string;
  quantity: number;
  price: number;
  discount: number;
  gst: number;
  hsnCode?: string;
}

export default function QuotationBuilder() {
  // auth
  const [auth, setAuth] = useState<{ role: string; loading: boolean }>({ role: "", loading: true });
  useEffect(() => {
    import("@/app/context/auth-context").then((mod) => {
      const { role, loading } = mod.useAuth();
      setAuth({ role, loading });
    });
  }, []);
  if (!auth.loading && auth.role !== "admin") return <AccessDenied />;

  // state
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [transport, setTransport] = useState(0);
  const [form, setForm] = useState({
    productName: "", productCode: "", brand: "", packSize: "",
    quantity: "", price: "", discount: "", gst: "",
  });
  const [filtered, setFiltered] = useState<ProductEntry[]>([]);
  const allProducts = useMemo(() => getAllProducts(), []);

  // debug
  useEffect(() => {
    console.log(
      "Loaded products for quotation:",
      allProducts.length,
      Array.from(new Set(allProducts.map((p) => p.brand)))
    );
  }, [allProducts]);

  // add item
  const handleAdd = () => {
    if (!form.productName || !form.quantity || !form.price) return;
    const matched = allProducts.find((p) => p.code === form.productCode);
    const hsn = matched?.hsnCode || "";
    const newItem: QuotationItem = {
      id: Date.now(),
      productCode: form.productCode,
      productName: form.productName,
      brand: form.brand,
      packSize: form.packSize,
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
      discount: parseFloat(form.discount || "0"),
      gst: parseFloat(form.gst || "0"),
      hsnCode: hsn,
    };
    setItems([...items, newItem]);
    setForm({ productName: "", productCode: "", brand: "", packSize: "", quantity: "", price: "", discount: "", gst: "" });
  };

  // calculations
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity * (1 - i.discount / 100), 0);
  const gstTotal = items.reduce((sum, i) => sum + i.price * i.quantity * (1 - i.discount / 100) * (i.gst / 100), 0);
  const total = subtotal + gstTotal + transport;

  // DOWNLOAD: now sending `products` key
  const downloadQuotation = async () => {
    const payload = {
      client: "Client Name",
      date: new Date().toLocaleDateString(),
      products: items.map((i, idx) => ({
        sr: idx + 1,
        description: i.productName,
        hsn: i.hsnCode || "",
        qty: i.quantity,
        price: i.price,
        discount: i.discount,
        gst: i.gst,
        total: i.price * i.quantity * (1 - i.discount / 100) * (1 + i.gst / 100),
      })),
      transport,
      total,
    };
    console.log("Generating DOCX with data:", payload);
    const res = await fetch("/api/generate-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Quotation.docx";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Chemical Corporation, Ludhiana</h1>
          <p className="text-gray-500">Quotation Builder</p>
        </div>

        {/* Form */}
        <Card className="mb-6">
          <CardHeader><CardTitle>Add Product to Quotation</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-4 relative">
            {/* Search */}
            <div className="md:col-span-3">
              <Label>Search Product</Label>
              <Input
                value={form.productName}
                onChange={(e) => {
                  const q = e.target.value.toLowerCase();
                  setForm({ ...form, productName: e.target.value });
                  setFiltered(allProducts.filter((p) =>
                    `${p.productName} ${p.code} ${p.packSize}`.toLowerCase().includes(q)
                  ));
                }}
              />
              {form.productName && filtered.length > 0 && (
                <div className="absolute z-10 bg-white shadow border mt-1 w-full max-h-64 overflow-y-auto text-sm">
                  {filtered.slice(0, 50).map((p, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setForm({
                          productName: p.productName,
                          productCode: p.code,
                          brand: p.brand,
                          packSize: p.packSize,
                          quantity: "",
                          price: p.price.toString(),
                          discount: "",
                          gst: "",
                        });
                        setFiltered([]);
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

            {/* Other fields */}
            <div><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
            <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div><Label>Discount %</Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></div>
            <div><Label>GST %</Label><Input type="number" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} /></div>
            <div className="md:col-span-6 text-right"><Button onClick={handleAdd}>Add</Button></div>
          </CardContent>
        </Card>

        {/* Preview & Download */}
        {items.length > 0 && (
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Quotation Preview</CardTitle>
              <Button variant="outline" onClick={downloadQuotation}>Download DOCX</Button>
            </CardHeader>
            <CardContent className="bg-white p-4">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="border-b">
                    <th>Product</th><th>Brand</th><th>Qty</th><th>Price</th>
                    <th>Disc%</th><th>GST%</th><th>HSN</th><th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="border-b">
                      <td>{i.productName} ({i.productCode})</td>
                      <td className="text-center">{i.brand}</td>
                      <td className="text-center">{i.quantity}</td>
                      <td className="text-center">₹{i.price.toFixed(2)}</td>
                      <td className="text-center">{i.discount}%</td>
                      <td className="text-center">{i.gst}%</td>
                      <td className="text-center">{i.hsnCode || "-"}</td>
                      <td className="text-center">
                        ₹{(i.price * i.quantity * (1 - i.discount/100) * (1 + i.gst/100)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right mt-4 text-sm">
                <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                <p>GST Total: ₹{gstTotal.toFixed(2)}</p>
                <p>Transport: ₹{transport.toFixed(2)}</p>
                <p className="mt-2 font-semibold">Total: ₹{total.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
