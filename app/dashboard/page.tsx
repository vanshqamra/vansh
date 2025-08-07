"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Package, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { useAuth } from "@/app/context/auth-context"
import { useCart } from "@/app/context/CartContext"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"

export default function Dashboard() {
  const { user } = useAuth()
  const { state } = useCart()
  const supabase = createSupabaseBrowserClient()
  const [mounted, setMounted] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) return

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (!error && data) {
        setRole(data.role)
      }
    }

    fetchRole()
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  const cartItems = state?.items || []
  const cartTotal = state?.total || 0
  const cartItemCount = state?.itemCount || 0

  const recentOrders = [
    { id: "ORD-001", date: "2024-01-15", status: "Delivered", total: 15750, items: 3 },
    { id: "ORD-002", date: "2024-01-10", status: "Processing", total: 8900, items: 2 },
    { id: "ORD-003", date: "2024-01-05", status: "Shipped", total: 22300, items: 5 },
  ]

  const stats = [
    { title: "Total Orders", value: "12", icon: Package, description: "All time orders" },
    { title: "Cart Items", value: cartItemCount.toString(), icon: ShoppingCart, description: "Items in current cart" },
    { title: "Cart Value", value: `₹${cartTotal.toLocaleString()}`, icon: TrendingUp, description: "Current cart total" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email?.split("@")[0] || "User"}!</p>
        </div>

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
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <CardDescription>Your latest order history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                      <p className="text-sm text-gray-500">{order.items} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{order.total.toLocaleString()}</p>
                      <Badge
                        variant={
                          order.status === "Delivered"
                            ? "default"
                            : order.status === "Processing"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {order.status === "Delivered" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {order.status === "Processing" && <Clock className="h-3 w-3 mr-1" />}
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
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
                  {cartItems.slice(0, 3).map((item) => (
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

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" asChild>
                <Link href="/products/bulk-chemicals">Browse Products</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/history">Order History</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/upload">Upload Quote</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Tools */}
        {role === "admin" && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Admin Tools</CardTitle>
              <CardDescription>Only visible to admins</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="destructive" asChild>
                <Link href="/dashboard/admin">Client Approvals</Link>
              </Button>
              <Button variant="destructive" asChild>
                <Link href="/admin/restock">Restock Panel</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
