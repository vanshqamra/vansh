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
  quantity: number;
  price: number;
  discount: number;
  gst: number;
  hsnCode?: string;
  custom: boolean;
}

const QuotationBuilder = () => {
  const [auth, setAuth] = useState<{ role: string; loading: boolean }>({ role: "", loading: true });
  useEffect(() => {
    import("@/app/context/auth-context").then((mod) => {
      const { role, loading } = mod.useAuth();
      setAuth({ role, loading });
    });
  }, []);

  if (!auth.loading && auth.role !== "admin") return <AccessDenied />;

  const [items, setItems] = useState<QuotationItem[]>([]);
  const [transport, setTransport] = useState(0);
  const [form, setForm] = useState({ productName: "", productCode: "", brand: "", quantity: "", price: "", discount: "", gst: "" });
  const [filtered, setFiltered] = useState<ProductEntry[]>([]);
  const allProducts = useMemo(() => getAllProducts(),[])
  const pdfRef = useRef(null);

  const handleAdd = () => {
    if (!form.productName || !form.quantity || !form.price) return;
    const matchedProduct = allProducts.find((p) => p.code === form.productCode);
    let hsnValue = matchedProduct?.hsnCode || "";
    const newItem: QuotationItem = {
      id: Date.now(),
      productCode: form.productCode,
      productName: form.productName,
      brand: form.brand,
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
      discount: parseFloat(form.discount || "0"),
      gst: parseFloat(form.gst || "0"),
      hsnCode: hsnValue,
      custom: true,
    };
    setItems([...items, newItem]);
    setForm({ productName: "", productCode: "", brand: "", quantity: "", price: "", discount: "", gst: "" });
  };

  const removeItem = (id: number) => setItems(items.filter((item) => item.id !== id));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity * (1 - item.discount / 100), 0);
  const gstAmount = items.reduce((sum, item) => sum + item.price * item.quantity * (1 - item.discount / 100) * (item.gst / 100), 0);
  const totalAmount = subtotal + gstAmount + transport;

  const downloadQuotation = async () => {
    const response = await fetch("/api/generate-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: "Client Name",
        date: new Date().toLocaleDateString(),
        sr: items.map((item, index) => ({
          sr: index + 1,
          name: item.productName,
          hsn: item.hsnCode || "",
          qty: item.quantity,
          price: item.price,
          gst: item.gst,
          discount: item.discount,
          total: item.price * item.quantity * (1 - item.discount / 100) * (1 + item.gst / 100),
        })),
        transport,
        total: totalAmount,
      }),
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Product to Quotation</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative md:col-span-3">
              <Label>Search Product</Label>
              <Input
                value={form.productName}
                onChange={(e) => {
                  const query = e.target.value.toLowerCase();
                  const results = allProducts.filter((p) => `${p.productName} ${p.code}`.toLowerCase().includes(query));
                  setForm({ ...form, productName: query });
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
                          productCode: product.code,
                          brand: product.brand,
                          quantity: "",
                          price: product.price ? product.price.toString() : "",
                          discount: "",
                          gst: "",
                        });
                        setFiltered([]);
                      }}
                    >
                      <span className="font-medium">{product.productName}</span>{" "}
                      <span className="text-xs text-muted-foreground">[Code: {product.code}]</span>
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
              <Label>Quantity</Label>
              <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <Label>Discount %</Label>
              <Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
            </div>
            <div>
              <Label>GST %</Label>
              <Input type="number" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} />
            </div>
            <div className="md:col-span-6 text-right">
              <Button onClick={handleAdd}>Add</Button>
            </div>
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quotation Preview</CardTitle>
              <div className="text-right">
                <Button variant="outline" onClick={downloadQuotation}>Download DOCX</Button>
              </div>
            </CardHeader>
            <CardContent ref={pdfRef} className="bg-white p-4">
              <p className="text-sm text-muted-foreground mb-4">Chemical Corporation, India — GST: 03ADEPK1618H1Z1</p>
              <table className="w-full text-sm border">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
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
                  {items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.productName} ({item.productCode})</td>
                      <td className="text-center">{item.brand}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-center">₹{item.price.toFixed(2)}</td>
                      <td className="text-center">{item.discount}%</td>
                      <td className="text-center">{item.gst}%</td>
                      <td className="text-center">{item.hsnCode || "-"}</td>
                      <td className="text-center">₹{(item.price * item.quantity * (1 - item.discount / 100) * (1 + item.gst / 100)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right font-medium mt-4 text-sm">
                <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                <p>GST Total: ₹{gstAmount.toFixed(2)}</p>
                <p>Transport: ₹{transport.toFixed(2)}</p>
                <p className="text-lg font-semibold mt-2">Total: ₹{totalAmount.toFixed(2)}</p>
                <p className="mt-8 text-sm">Authorized Signatory</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default QuotationBuilder;
