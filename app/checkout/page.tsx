"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/app/context/CartContext"
import { useAuth } from "@/app/context/auth-context"
import { useRouter } from "next/navigation"
import { CreditCard, Truck, Shield } from "lucide-react"
import Link from "next/link"

type Address = {
  id: string
  label?: string | null
  first_name?: string | null
  last_name?: string | null
  company?: string | null
  gst?: string | null
  phone?: string | null
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  country?: string | null
  notes?: string | null
  is_default?: boolean | null
}

export default function CheckoutPage() {
  const { state, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Address book
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressMode, setAddressMode] = useState<"new" | "saved">("new")
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [saveThisAddress, setSaveThisAddress] = useState<boolean>(true)

  // Safe access to cart state with defaults
  const items = state?.items || []
  const totalPrice = Number(state?.total || 0)
  const totalItems = Number(state?.itemCount || 0)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (mounted && !user) router.push("/login?redirect=/checkout")
  }, [user, router, mounted])

  useEffect(() => {
    if (mounted && items.length === 0) router.push("/cart")
  }, [items.length, router, mounted])

  // Load saved addresses (non-blocking; ignore errors if API not present yet)
  useEffect(() => {
    const run = async () => {
      try {
        const r = await fetch("/api/me/addresses", { cache: "no-store" })
        if (!r.ok) return
        const j = await r.json()
        const list = Array.isArray(j.addresses) ? (j.addresses as Address[]) : []
        setAddresses(list)
        const def = list.find(a => a.is_default) || list[0]
        if (def?.id) {
          setSelectedAddressId(def.id)
          setAddressMode("saved")
        }
      } catch {
        // silently ignore
      }
    }
    run()
  }, [])

  // Totals
  const taxAmount = useMemo(() => Math.round(totalPrice * 0.18), [totalPrice])
  const finalTotal = useMemo(() => totalPrice + taxAmount, [totalPrice, taxAmount])

  function formatAddressPreview(a?: Address | null) {
    if (!a) return "—"
    const parts = [
      [a.first_name, a.last_name].filter(Boolean).join(" "),
      a.company,
      a.line1,
      a.line2,
      [a.city, a.state, a.pincode].filter(Boolean).join(", "),
      a.country,
      a.phone ? `Phone: ${a.phone}` : null,
    ].filter(Boolean)
    return parts.join(" • ")
  }

  async function postOrder(payload: any) {
    // Try modern endpoint first; fallback to legacy path if present in your repo
    let res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.status === 404 || res.status === 405) {
      res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }
    return res
  }

  async function handleSubmitOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)

    if (!acceptedTerms) {
      setErrorMsg("Please accept the terms and conditions.")
      return
    }
    if (!user) {
      setErrorMsg("You must be logged in to place an order.")
      router.push("/login?redirect=/checkout")
      return
    }
    if (!Array.isArray(items) || items.length === 0) {
      setErrorMsg("Your cart is empty.")
      router.push("/cart")
      return
    }

    setIsSubmitting(true)
    try {
      const fd = new FormData(e.currentTarget)

      // Collect customer basics
      const firstName = String(fd.get("firstName") || "")
      const lastName = String(fd.get("lastName") || "")
      const company = String(fd.get("company") || "")
      const gst = String(fd.get("gst") || "")
      const phone = String(fd.get("phone") || "")
      const notes = String(fd.get("notes") || "")

      // Build shipping address from either saved address or new form fields
      let shipping_address: any
      if (addressMode === "saved" && selectedAddressId) {
        const a = addresses.find(x => x.id === selectedAddressId)
        shipping_address = a ? {
          firstName: a.first_name ?? "",
          lastName: a.last_name ?? "",
          company: a.company ?? "",
          gst: a.gst ?? "",
          phone: a.phone ?? "",
          address: a.line1 ?? "",
          address2: a.line2 ?? "",
          city: a.city ?? "",
          state: a.state ?? "",
          pincode: a.pincode ?? "",
          country: a.country ?? "India",
          notes: a.notes ?? "",
        } : null
      } else {
        shipping_address = {
          firstName,
          lastName,
          company,
          gst,
          phone,
          address: String(fd.get("address") || ""),
          address2: String(fd.get("address2") || ""),
          city: String(fd.get("city") || ""),
          state: String(fd.get("state") || ""),
          pincode: String(fd.get("pincode") || ""),
          country: String(fd.get("country") || "India"),
          notes,
        }
      }

      // Build line items from your cart context (raw products)
      const products = items.map((it: any) => ({
        id: it.id ?? null,
        name: it.name,
        brand: it.brand ?? null,
        code: it.code ?? null,
        pack: it.pack ?? null,
        quantity: Number(it.quantity ?? it.qty ?? 1),
        price: Number(it.price ?? 0),
        line_total: Number(it.price ?? 0) * Number(it.quantity ?? it.qty ?? 1),
      }))

      // Normalized items for backend/UI compatibility
      const normalizedItems = products.map((p: any) => ({
        sku: p.code ?? String(p.id ?? ""),
        name: p.name,
        qty: Number(p.quantity ?? 1),
      }))

      const totals = {
        subtotal: totalPrice,
        tax: taxAmount,
        shipping: 0,
        discount: 0,
        grand_total: finalTotal,
      }

      // Optional: save new address
      if (addressMode === "new" && saveThisAddress) {
        try {
          const body: Partial<Address> = {
            label: company ? `${company} (${shipping_address.city || ""})` : `${firstName} ${lastName}`,
            first_name: shipping_address.firstName,
            last_name: shipping_address.lastName,
            company: shipping_address.company,
            gst: shipping_address.gst || null,
            phone: shipping_address.phone,
            line1: shipping_address.address,
            line2: shipping_address.address2 || null,
            city: shipping_address.city,
            state: shipping_address.state,
            pincode: shipping_address.pincode,
            country: shipping_address.country || "India",
            notes: shipping_address.notes || null,
            is_default: addresses.length === 0, // first one becomes default
          }
          await fetch("/api/me/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }).catch(() => {})
        } catch {
          // non-blocking; continue order anyway
        }
      }

      const payload = {
        source: "checkout",
        paymentMethod,
        customer: {
          first_name: firstName,
          last_name: lastName,
          email: user?.email ?? null,
          phone,
          company_name: company,
          gst: gst || null,
        },
        shipping_address,
        totals,
        // Send BOTH for maximum compatibility
        products,         // original detail-rich array
        items: normalizedItems, // normalized for UI
      }

      const res = await postOrder(payload)
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json?.error || `Order failed (${res.status})`)
      }

      clearCart()
      router.push(`/order-success?order=${encodeURIComponent(json.orderId ?? "")}`)
    } catch (err: any) {
      console.error("checkout error:", err)
      setErrorMsg(err?.message || "Something went wrong placing your order.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="mb-4">You need to be logged in to access checkout.</p>
          <Link href="/login?redirect=/checkout">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="mb-4">Add some products to your cart before checkout.</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const selectedSaved = addressMode === "saved" ? addresses.find(a => a.id === selectedAddressId) : undefined

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Wrap ALL content in one form so we can read fields + submit */}
        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address Mode Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={addressMode}
                    onValueChange={(v: "new" | "saved") => setAddressMode(v)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="new" id="addr_new" />
                      <span>Enter new address</span>
                    </label>
                    <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="saved" id="addr_saved" />
                      <span>Use saved address</span>
                    </label>
                  </RadioGroup>

                  {addressMode === "saved" ? (
                    <div className="space-y-3">
                      {addresses.length === 0 ? (
                        <div className="text-sm text-slate-600">No saved addresses yet.</div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="savedAddress">Select address</Label>
                          <select
                            id="savedAddress"
                            className="w-full border rounded-md px-3 py-2"
                            value={selectedAddressId}
                            onChange={(e) => setSelectedAddressId(e.target.value)}
                          >
                            {addresses.map((a) => (
                              <option key={a.id} value={a.id}>
                                {(a.label || a.company || `${a.first_name || ""} ${a.last_name || ""}`).trim()} — {formatAddressPreview(a)}
                              </option>
                            ))}
                          </select>
                          {selectedSaved && (
                            <div className="text-xs text-slate-600">
                              {formatAddressPreview(selectedSaved)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* Shipping Information (enabled only when entering new) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" required disabled={addressMode === "saved"} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" required disabled={addressMode === "saved"} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <Input id="company" name="company" required disabled={addressMode === "saved"} />
                    </div>
                    <div>
                      <Label htmlFor="gst">GST (optional)</Label>
                      <Input id="gst" name="gst" placeholder="e.g., 22AAAAA0000A1Z5" disabled={addressMode === "saved"} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" name="address" required disabled={addressMode === "saved"} />
                  </div>
                  <div>
                    <Label htmlFor="address2">Address 2 (optional)</Label>
                    <Input id="address2" name="address2" disabled={addressMode === "saved"} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" required disabled={addressMode === "saved"} />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" name="state" required disabled={addressMode === "saved"} />
                    </div>
                    <div>
                      <Label htmlFor="pincode">PIN Code</Label>
                      <Input id="pincode" name="pincode" required disabled={addressMode === "saved"} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" name="country" defaultValue="India" disabled={addressMode === "saved"} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" required disabled={addressMode === "saved"} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Special Instructions</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Any special handling requirements, delivery instructions, or additional notes..."
                      rows={4}
                      disabled={addressMode === "saved"}
                    />
                  </div>

                  {addressMode === "new" && (
                    <div className="flex items-center gap-2 pt-2">
                      <Checkbox
                        id="saveAddress"
                        checked={saveThisAddress}
                        onCheckedChange={(v) => setSaveThisAddress(Boolean(v))}
                      />
                      <Label htmlFor="saveAddress" className="text-sm">Save this address to my Address Book</Label>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} name="paymentMethod">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="flex-1">
                        <div className="font-medium">Bank Transfer / NEFT</div>
                        <div className="text-sm text-gray-600">Payment details will be sent on mail after order confirmation</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="credit_terms" id="credit_terms" />
                      <Label htmlFor="credit_terms" className="flex-1">
                        <div className="font-medium">Credit Terms</div>
                        <div className="text-sm text-gray-600">Net 30 days payment terms(only on special approval)</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="cheque" id="cheque" />
                      <Label htmlFor="cheque" className="flex-1">
                        <div className="font-medium">Cheque Payment</div>
                        <div className="text-sm text-gray-600">Post-dated cheque on delivery(only on special approval)</div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-blue-900">Payment Security</div>
                        <div className="text-blue-700">
                          Payment will only be made after we confirm your order and provide final pricing for shipping. 
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline" target="_blank">
                        Terms and Conditions
                      </Link>{" "}
                      and understand that order will be accepted after confirmation.
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item: any) => (
                      <div key={item.id ?? item.code ?? item.name} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-gray-600">
                            Code: {item.code ?? "—"} • Qty: {Number(item.quantity ?? item.qty ?? 1)}
                          </div>
                        </div>
                        <div className="font-medium">
                          ₹{(Number(item.price ?? 0) * Number(item.quantity ?? item.qty ?? 1)).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (18%)</span>
                      <span>₹{taxAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{finalTotal.toLocaleString()}</span>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Final pricing subject to confirmation</p>
                    <p>• Payment only after order approval</p>
                    <p>• Shipping as applicable </p>
                  </div>

                  {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

                  <Button type="submit" className="w-full" size="lg" disabled={!acceptedTerms || isSubmitting}>
                    {isSubmitting ? "Processing Order..." : "Place Order"}
                  </Button>

                  <div className="text-center">
                    <Link href="/cart" className="text-sm text-blue-600 hover:underline">
                      ← Back to Cart
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
