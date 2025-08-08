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
import himediaData from "@/lib/himedia_products_grouped";
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
  // — Auth —
  const [auth, setAuth] = useState<{ role: string; loading: boolean }>({ role: "", loading: true });
  useEffect(() => {
    import("@/app/context/auth-context").then((mod) => {
      const { role, loading } = mod.useAuth();
      setAuth({ role, loading });
    });
  }, []);
  if (!auth.loading && auth.role !== "admin") return <AccessDenied />;

  // — State & Refs —
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [transport, setTransport] = useState(0);
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

  // — Flatten all catalogs into one array once —
  const allProducts = useMemo<FlatProduct[]>(() => {
    const all: FlatProduct[] = [];

    // Borosil
    if (Array.isArray(borosilProducts)) {
      borosilProducts.forEach((g: any) => {
        const category = g.category || g.product || "";
        const base = category ? `${category} – ${g.product}` : g.product || "";
        ;(g.variants || []).forEach((v: any) => {
          const size = v.capacity_ml ? `${v.capacity_ml}ml` : v["Pack Size"] || v.size || "";
          const name = size ? `${base} (${size})` : base;
          all.push({
            productName: name,
            code: v.code || "",
            brand: "Borosil",
            packSize: size,
            price: parseFloat(v.price) || 0,
            hsnCode: v["HSN Code"] || "",
          });
        });
      });
    }

    // Rankem
    if (Array.isArray(rankemProducts)) {
  rankemProducts.forEach((g: any) => {
    ;(g.variants || []).forEach((v: any) => {
      // 1) description (the actual name)
      const desc =
        typeof v.Description === "string" && v.Description.trim()
          ? v.Description.trim()
          : g.title || g.product || "";

      // 2) look for every possible “pack size” key they might’ve used
      const size =
        v["Pack Size"] ||
        v["Pack\nSize"] ||
        v.Packing ||
        v.size ||
        "";

      all.push({
        productName: desc,                         // just the name
        code: v["Cat No"] || v["Product Code"] || "",
        brand: "Rankem",
        packSize: size,                            // now correct
        price: parseFloat(v["List Price\n2025(INR)"] || v.Price) || 0,
        hsnCode: v["HSN Code"] || "",
          });
        });
      });
    }

    // Qualigens
    if (Array.isArray(qualigensProducts)) {
      qualigensProducts.forEach((p: any) => {
        const desc = p["Product Name"] || p.name || "";
        const size = p["Pack Size"] || p.size || "";
        const name = size ? `${desc} (${size})` : desc;
        all.push({
          productName: name,
          code: p["Product Code"] || p.code || "",
          brand: "Qualigens",
          packSize: size,
          price: parseFloat(p.Price) || 0,
          hsnCode: p["HSN Code"] || "",
        });
      });
    }

    // Whatman
    if (Array.isArray(whatmanData.variants)) {
  whatmanData.variants.forEach((v: any) => {
    // 1) fallback name/title for the product
    const desc = whatmanData.title || whatmanData.name || "";

  // 2) try every key they might’ve used for pack-size
  const size =
    v["Pack Size"] ??
    v["pack size"] ??
    v["Pack\nSize"] ??
    v.packing ??
    v["Packing"] ??
    v.size ??
    "";

  // 3) full display name: “Title – 25 pk”
  const name = [desc, size].filter(Boolean).join(" – ");

  // 4) code might live under Code, code, or Product Code
  const code = v.Code || v.code || v["Product Code"] || "";

  all.push({
    productName: name,
    code,
    brand: "Whatman",
    packSize: size,
    price: parseFloat(v.Price || v.price) || 0,
    hsnCode: "",
        });
      });
    }

    // HiMedia
    if (Array.isArray(himediaData)) {
      himediaData.forEach((g: any) => {
        ;(g.variants || []).forEach((v: any) => {
          const desc = g.product || g.title || "";
          const size = v.packing || v["Pack Size"] || v.size || "";
          const name = size ? `${desc} (${size})` : desc;
          all.push({
            productName: name,
            code: v.code || v["Product Code"] || "",
            brand: "HiMedia",
            packSize: size,
            price: parseFloat(v.rate || v.price) || 0,
            hsnCode: v.hsn || v["HSN Code"] || "",
          });
        });
      });
    }

    // Bulk Commercial
    if (Array.isArray(bulkProducts)) {
      bulkProducts.forEach((p: any) => {
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
    }

    return all;
  }, []);

  // — Close dropdown when clicking outside —
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFiltered([]);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // — Search handler —
  const handleSearch = (q: string) => {
    setForm((f) => ({ ...f, productName: q }));
    if (!q) return setFiltered([]);
    const lower = q.toLowerCase();
    setFiltered(
      allProducts.filter((p) =>
        `${p.productName} ${p.code} ${p.packSize}`.toLowerCase().includes(lower)
      )
    );
  };

  // — When user selects one result —
  const handleSelect = (p: FlatProduct) => {
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
  };

  // — Add item to quotation —
  const handleAdd = () => {
    if (!form.productName || !form.quantity || !form.price) return;
    const match = allProducts.find((x) => x.code === form.productCode);
    const hsn = match?.hsnCode || "";
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        productCode: form.productCode,
        productName: form.productName,
        brand: form.brand,
        packSize: form.packSize,
        quantity: +form.quantity,
        price: +form.price,
        discount: +form.discount,
        gst: +form.gst,
        hsnCode: hsn,
      },
    ]);
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

  // — Remove item —
  const removeItem = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

  // — Totals —
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity * (1 - i.discount / 100), 0);
  const gstTotal = items.reduce((s, i) => s + i.price * i.quantity * (1 - i.discount / 100) * (i.gst / 100), 0);
  const total = subtotal + gstTotal + transport;

  // — Download DOCX —
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
    const res = await fetch("/api/generate-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
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
          <CardHeader><CardTitle>Add Product to Quotation</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-7 gap-4 relative">
            {/* Search */}
            <div className="md:col-span-3">
              <Label>Search Product</Label>
              <Input value={form.productName} onChange={(e) => handleSearch(e.target.value)} />
              {filtered.length > 0 && (
                <div className="absolute z-10 bg-white shadow border mt-1 w-full max-h-64 overflow-y-auto text-sm">
                  {filtered.slice(0,50).map((p, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        // Point 3: append code into the displayed productName
                        setForm({
                          productName: `${p.productName} [${p.code}]`,
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
                      <span className="font-medium">{p.productName}</span>
                     <span className="text-xs text-muted-foreground">[Size: {p.packSize}] • [Code: {p.code}]</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm(f => ({ ...f, brand: e.target.value }))} /></div>
            <div><Label>Pack Size</Label><Input value={form.packSize} readOnly /></div>
            <div><Label>Qty</Label><Input type="number" value={form.quantity} onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))} /></div>
            <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} /></div>
            <div><Label>Discount %</Label><Input type="number" value={form.discount} onChange={(e) => setForm(f => ({ ...f, discount: e.target.value }))} /></div>
            <div><Label>GST %</Label><Input type="number" value={form.gst} onChange={(e) => setForm(f => ({ ...f, gst: e.target.value }))} /></div>
            <div className="md:col-span-7 text-right"><Button onClick={handleAdd}>Add</Button></div>
          </CardContent>
        </Card>

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
                    <th>Product</th><th>Brand</th><th>Pack Size</th><th>Qty</th><th>Price</th><th>Disc%</th><th>GST%</th><th>HSN</th><th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="border-b">
                      <td>{i.productName}</td>
                      <td className="text-center">{i.brand}</td>
                      <td className="text-center">{i.packSize}</td>
                      <td className="text-center">{i.quantity}</td>
                      <td className="text-center">₹{i.price.toFixed(2)}</td>
                      <td className="text-center">{i.discount}%</td>
                      <td className="text-center">{i.gst}%</td>
                      <td className="text-center">{i.hsnCode || "—"}</td>
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
