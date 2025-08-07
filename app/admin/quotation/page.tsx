"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/app/context/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AccessDenied } from "@/components/access-denied"
import { Download, Send } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Header } from "@/components/header"
import { getAllProducts, ProductEntry } from "@/lib/get-all-products"

interface QuotationItem {
  id: number
  productCode: string
  productName: string
  brand: string
  packSize: string
  quantity: number
  price: number
  discount: number
  hsnCode?: string
  casNo?: string
  custom: boolean
}

export default function QuotationBuilder() {
  const { role, loading } = useAuth()
  if (!loading && role !== "admin") {
    return <AccessDenied />
  }

  const [items, setItems] = useState<QuotationItem[]>([])
  const [gst, setGst] = useState(0)
  const [transport, setTransport] = useState(0)
  const [form, setForm] = useState({
    productName: "",
    productCode: "",
    brand: "",
    packSize: "",
    quantity: "",
    price: "",
    discount: "",
  })
  const [filtered, setFiltered] = useState<ProductEntry[]>([])
  const allProducts = useMemo(() => getAllProducts(), [])

  const handleAdd = () => {
    if (!form.productName || !form.quantity || !form.price) return

    const matchedProduct = allProducts.find((p) => p.code === form.productCode)
    const newItem: QuotationItem = {
      id: Date.now(),
      productCode: form.productCode,
      productName: form.productName,
      brand: form.brand,
      packSize: form.packSize,
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
      discount: parseFloat(form.discount || "0"),
      hsnCode: matchedProduct?.hsnCode,
      casNo: matchedProduct?.casNo,
      custom: true,
    }
    setItems([...items, newItem])
    setForm({
      productName: "",
      productCode: "",
      brand: "",
      packSize: "",
      quantity: "",
      price: "",
      discount: "",
    })
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity * (1 - item.discount / 100),
    0
  )
  const gstAmount = subtotal * (gst / 100)
  const totalAmount = subtotal + gstAmount + transport

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Chemical Corporation, India", 14, 15)
    doc.setFontSize(10)
    doc.text("GST - 03ADEPK1618H1Z1", 14, 22)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 22)

    autoTable(doc, {
      startY: 28,
      head: [["Product", "Brand", "Pack", "Qty", "Price", "Disc%", "HSN", "CAS", "Total"]],
      body: items.map((item) => [
        `${item.productName} (${item.productCode})`,
        item.brand,
        item.packSize,
        item.quantity,
        `₹${item.price.toFixed(2)}`,
        `${item.discount}%`,
        item.hsnCode || "-",
        item.casNo || "-",
        `₹${(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}`,
      ]),
    })

    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10)
    doc.text(`GST (${gst}%): ₹${gstAmount.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 16)
    doc.text(`Transport: ₹${transport.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 22)
    doc.setFontSize(12)
    doc.text(`Total: ₹${totalAmount.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 30)

    doc.setFontSize(10)
    doc.text("\n\nAuthorized Signatory", 150, doc.lastAutoTable.finalY + 45)

    doc.save("quotation.pdf")
  }

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
                  const query = e.target.value.toLowerCase()
                  const results = allProducts.filter((p) =>
                    `${p.productName} ${p.code} ${p.packSize}`.toLowerCase().includes(query)
                  )
                  setForm({ ...form, productName: query })
                  setFiltered(results)
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
                          packSize: product.packSize,
                          quantity: "",
                          price: product.price ? product.price.toString() : "",
                          discount: "",
                        })
                        setFiltered([])
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
              <Label>Price</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <Label>Discount %</Label>
              <Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
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
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th>Brand</th>
                    <th>Pack</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Disc%</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.productName} ({item.productCode})</td>
                      <td className="text-center">{item.brand}</td>
                      <td className="text-center">{item.packSize}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-center">₹{item.price.toFixed(2)}</td>
                      <td className="text-center">{item.discount}%</td>
                      <td className="text-center">₹{(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}</td>
                      <td className="text-center">
                        <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-end items-end">
                <div>
                  <Label>GST (%)</Label>
                  <Input
                    type="number"
                    className="w-32"
                    value={gst}
                    onChange={(e) => setGst(parseFloat(e.target.value || "0"))}
                  />
                </div>
                <div>
                  <Label>Transport (₹)</Label>
                  <Input
                    type="number"
                    className="w-32"
                    value={transport}
                    onChange={(e) => setTransport(parseFloat(e.target.value || "0"))}
                  />
                </div>
              </div>

              <div className="text-right font-medium mt-4 text-sm">
                <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                <p>GST ({gst}%): ₹{gstAmount.toFixed(2)}</p>
                <p>Transport: ₹{transport.toFixed(2)}</p>
                <p className="text-lg font-semibold mt-2">Total: ₹{totalAmount.toFixed(2)}</p>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={exportPDF}>
                  <Download className="mr-2 h-4 w-4" /> Export as PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
