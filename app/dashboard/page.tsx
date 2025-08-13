"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Package, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { useAuth } from "@/app/context/auth-context"
import { useCart } from "@/app/context/CartContext"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"

type OrderRow = {
  id: string
  created_at: string
  status: "pending" | "confirmed" | "fulfilled" | "cancelled"
  grand_total: number | null
}

export default function Dashboard() {
  const { user } = useAuth()
  const { state } = useCart()
  const supabase = createSupabaseBrowserClient()

  const [mounted, setMounted] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [ordersCount, setOrdersCount] = useState<number>(0)

  const cartItems = state?.items || []
  const cartTotal = state?.total || 0
  const cartItemCount = state?.itemCount || 0

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user?.id
      if (!uid) return

      // role
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", uid).single()
      setRole(prof?.role ?? null)

      // REAL recent orders for this user
      const { data: ord } = await supabase
        .from("orders")
        .select("id, created_at, status, grand_total", { count: "exact", head: false })
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(5)
      setOrders(ord || [])

      // total orders count (for stat card)
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", uid)
      setOrdersCount(count ?? 0)
    })()
  }, [mounted, supabase])

  const stats = useMemo(() => ([
    { title: "Total Orders", value: String(ordersCount), icon: Package, description: "All time orders" },
    { title: "Cart Items", value: String(cartItemCount), icon: ShoppingCart, description: "Items in current cart" },
    { title: "Cart Value", value: `₹${cartTotal.toLocaleString()}`, icon: TrendingUp, description: "Current cart total" },
  ]), [ordersCount, cartItemCount, cartTotal])

  const displayStatus = (s: OrderRow["status"]) => (s === "pending" ? "pending for approval" : s)

  if (!mounted) return <div className="p-8">Loading…</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email?.split("@")[0] || "User"}!</p>
        </div>

        {/* If admin, nudge them to the admin dashboard instead */}
        {role === "admin" && (
          <Card className="mb-8">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">You are an admin. Go to the admin dashboard.</p>
                <Button asChild variant="destructive" size="sm">
                  <Link href="/dashboard/admin">Open Admin Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* REAL Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <CardDescription>Your latest order history</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-sm text-muted-foreground">No orders yet.</div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{Number(order.grand_total || 0).toLocaleString()}</p>
                        <Badge
                          variant={
                            order.status === "fulfilled"
                              ? "default"
                              : order.status === "pending"
                              ? "secondary"
                              : order.status === "confirmed"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {order.status === "fulfilled" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {order.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {displayStatus(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                <Link href="/dashboard/history">View All Orders</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Current Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Current Cart
              </CardTitle>
              <CardDescription>Items in your shopping cart</CardDescription>
            </CardHeader>
            <CardContent>
              {cartItems.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">+{cartItems.length - 3} more items</p>
                  )}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-lg">₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="space-y-2">
                      <Button className="w-full" asChild>
                        <Link href="/cart">View Cart</Link>
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <Link href="/checkout">Checkout</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <Button asChild>
                    <Link href="/products/bulk-chemicals">Start Shopping</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RFQ section removed as requested */}
      </div>
    </div>
  )
}
