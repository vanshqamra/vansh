"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AccessDenied } from "@/components/access-denied";
import { Header } from "@/components/header";

// Brand data imports
import borosilProducts from "@/lib/borosil_products_absolute_final.json";
import rankemProducts from "@/lib/rankem_products.json";
import qualigensProducts from "@/lib/qualigens-products.json";
import whatmanData from "@/lib/whatman_products.json";
import himediaData from "@/lib/himedia_products_grouped"; // ← remove .ts
import { commercialChemicals as bulkProducts } from "@/lib/data";

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

interface FlatProduct {
  productName: string;
  code: string;
  brand: string;
  packSize: string;
  price: number;
  hsnCode?: string;
}

export default function QuotationBuilder() {
  // Auth (client-side import)
  const [auth, setAuth] = useState<{ role: string; loading: boolean }>({ role: "", loading: true });
  useEffect(() => {
    import("@/app/context/auth-context").then((mod) => {
      const { role, loading } = mod.useAuth();
      setAuth({ role, loading });
    });
  }, []);
  if (!auth.loading && auth.role !== "admin") return <AccessDenied />;

  // State
  const [items, setItems] = useState<QuotationItem[]>([]);
  // Transport: allow empty field in UI; derive number for math
  const [transportStr, setTransportStr] = useState<string>(""); // "" on purpose
  const transport = Number(transportStr) || 0;

  const [form, setForm] = useState({
    productName: "",
    productCode: "",
    brand: "",
    packSize: "",
    quantity: "",
    price: "",
    discount: "",
    gst: "",
  });
  const [filtered, setFiltered] = useState<FlatProduct[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build allProducts inlined with fixes for Borosil and Rankem
  const allProducts = useMemo<FlatProduct[]>(() => {
    const all: FlatProduct[] = [];

    // Borosil
    Array.isArray(borosilProducts) &&
      borosilProducts.forEach((g: any) =>
        Array.isArray(g.variants) &&
        g.variants.forEach((v: any) => {
          const size = v.capacity_ml ? `${v.capacity_ml}ml` : v["Pack Size"] || v.size || "";
          const base = g.category || g.product || "";
          const name = size ? `${base} – ${g.product} (${size})` : `${base} – ${g.product}`;
          all.push({
            productName: name,
            code: v.code || "",
            brand: "Borosil",
            packSize: size,
            price: parseFloat(v.price) || 0,
            hsnCode: v["HSN Code"] || "",
          });
        })
      );

    // Rankem
    Array.isArray(rankemProducts) &&
      rankemProducts.forEach((g: any) =>
        Array.isArray(g.variants) &&
        g.variants.forEach((v: any) => {
          const desc =
            typeof v.Description === "string" && v.Description.trim()
              ? v.Description.trim()
              : g.title || g.product || "Rankem Product";
          const size =
            v["Pack Size"] || v["Pack\nSize"] || v.Packing || v.size || "";
          all.push({
            productName: size ? `${desc} (${size})` : desc,
            code: v["Cat No"] || v["Product Code"] || "",
            brand: "Rankem",
            packSize: size,
            price: parseFloat(v["List Price\n2025(INR)"] || v.Price) || 0,
            hsnCode: v["HSN Code"] || "",
          });
        })
      );

    // Qualigens
    Array.isArray(qualigensProducts) &&
      (qualigensProducts as any[]).forEach((p: any) => {
        const desc = p["Product Name"] || "";
        const size = p["Pack Size"] || "";
        all.push({
          productName: size ? `${desc} (${size})` : desc,
          code: p["Product Code"] || "",
          brand: "Qualigens",
          packSize: size,
          price: parseFloat(p.Price) || 0,
          hsnCode: p["HSN Code"] || "",
        });
      });

    // Whatman
    Array.isArray((whatmanData as any).variants) &&
      (whatmanData as any).variants.forEach((v: any) => {
        const desc = (v.name || v.title || (whatmanData as any).title || "").trim();
        const size = v["Pack Size"] || v.size || "";
        const name = size ? `${desc} (${size})` : desc;
        all.push({
          productName: name,
          code: v.Code || v.code || "",
          brand: "Whatman",
          packSize: size,
          price: parseFloat(v.Price?.toString() || "") || 0,
          hsnCode: "",
        });
      });

    // HiMedia
    Array.isArray(himediaData) &&
      (himediaData as any[]).forEach((g: any) => {
        (g.variants || []).forEach((v: any) => {
          const desc = g.product || g.title || "";
          const size = v.packing || v["Pack Size"] || v.size || "";
          const name = size ? `${desc} (${size})` : desc;
          all.push({
            productName: name,
            code: v["Product Code"] || v.code || "",
            brand: "HiMedia",
            packSize: size,
            price: parseFloat(v.price || v.rate) || 0,
            hsnCode: v.hsn || v["HSN Code"] || "",
          });
        });
      });

    // Bulk Commercial
    Array.isArray(bulkProducts) &&
      (bulkProducts as any[]).forEach((p: any) => {
        const desc = p.name || p["Product Name"] || "";
        const size = p.size || p["Pack Size"] || "";
        const name = size ? `${desc} (${size})` : desc;
        all.push({
          productName: name,
          code: p.code || p["Product Code"] || "",
          brand: "Bulk Chemical",
          packSize: size,
          price: parseFloat(p.price) || 0,
          hsnCode: p["HSN Code"] || "",
        });
      });

    return all;
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(el)) {
        setFiltered([]);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Add item
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
      quantity: parseInt(form.quantity, 10),
      price: parseFloat(form.price),
      discount: parseFloat(form.discount || "0"),
      gst: parseFloat(form.gst || "0"),
      hsnCode: hsn,
    };
    setItems((prev) => [...prev, newItem]);
    setForm({
      productName: "",
      productCode: "",
      brand: "",
      packSize: "",
      quantity: "",
      price: "",
      discount: "",
      gst: "",
    });
  };

  // Remove item
  const removeItem = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

  // Totals
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity * (1 - i.discount / 100), 0);
  const gstTotal = items.reduce(
    (sum, i) => sum + i.price * i.quantity * (1 - i.discount / 100) * (i.gst / 100),
    0
  );
  const grandTotal = subtotal + gstTotal + transport;

  // Download DOCX
  const downloadQuotation = async () => {
    const products = items.map((i, idx) => ({
      sr: idx + 1,
      description: i.productName,
      hsn: i.hsnCode || "",
      qty: i.quantity,
      price: i.price,
      discount: i.discount,
      gst: i.gst,
      total: i.price * i.quantity * (1 - i.discount / 100) * (1 + i.gst / 100),
    }));

    const payload = {
      client: "Client Name",
      clientEmail: "",
      date: new Date().toLocaleDateString(),
      products,
      transport,                                  // numeric value (0 if blank)
      transportDisplay: transport > 0 ? `₹${transport.toFixed(2)}` : "", // pretty
      subtotal,
      gstTotal,
      grandTotal,
    };

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
    link.click();
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8" ref={containerRef}>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Chemical Corporation, Ludhiana</h1>
          <p className="text-gray-500">Quotation Builder</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Product to Quotation</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-8 gap-4 relative">
            {/* Search */}
            <div className="md:col-span-3">
              <Label>Search Product</Label>
              <Input
                value={form.productName}
                onChange={(e) => {
                  const q = e.target.value.toLowerCase();
                  setForm((f) => ({ ...f, productName: e.target.value }));
                  setFiltered(
                    allProducts.filter((p) =>
                      `${p.productName} ${p.code} ${p.packSize}`.toLowerCase().includes(q)
                    )
                  );
                }}
              />
              {form.productName && filtered.length > 0 && (
                <div className="absolute z-10 bg-white shadow border mt-1 w-full max-h-64 overflow-y-auto text-sm">
                  {filtered.slice(0, 50).map((p, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        setForm({
                          productName: p.productName,
                          productCode: p.code,
                          brand: p.brand,
                          packSize: p.packSize,
                          quantity: "",
                          price: p.price.toString(),
                          discount: "",
                          gst: "",
                        })
                      }
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
              <Label>Qty</Label>
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

            <div>
              <Label>Discount %</Label>
              <Input
                type="number"
                value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
              />
            </div>

            <div>
              <Label>GST %</Label>
              <Input
                type="number"
                value={form.gst}
                onChange={(e) => setForm((f) => ({ ...f, gst: e.target.value }))}
              />
            </div>

            {/* Transport input (editable, can be blank) */}
            <div>
              <Label htmlFor="transport">Transport</Label>
              <Input
                id="transport"
                type="number"
                value={transportStr}
                onChange={(e) => setTransportStr(e.target.value)} // allow ""
                placeholder="e.g. 250"
              />
            </div>

            <div className="md:col-span-8 text-right">
              <Button onClick={handleAdd}>Add</Button>
            </div>
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Quotation Preview</CardTitle>
              <Button variant="outline" onClick={downloadQuotation}>
                Download DOCX
              </Button>
            </CardHeader>
            <CardContent className="bg-white p-4">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="border-b">
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Disc%</th>
                    <th>GST%</th>
                    <th>HSN</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="border-b">
                      <td>
                        {i.productName} {i.productCode ? `(${i.productCode})` : ""}
                      </td>
                      <td className="text-center">{i.brand}</td>
                      <td className="text-center">{i.quantity}</td>
                      <td className="text-center">₹{i.price.toFixed(2)}</td>
                      <td className="text-center">{i.discount}%</td>
                      <td className="text-center">{i.gst}%</td>
                      <td className="text-center">{i.hsnCode || "-"}</td>
                      <td className="text-center">
                        ₹
                        {(
                          i.price *
                          i.quantity *
                          (1 - i.discount / 100) *
                          (1 + i.gst / 100)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right mt-4 text-sm">
                <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                <p>GST Total: ₹{gstTotal.toFixed(2)}</p>
                <p>Transport: {transportStr === "" ? "—" : `₹${transport.toFixed(2)}`}</p>
                <p className="mt-2 font-semibold">Grand Total: ₹{grandTotal.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
