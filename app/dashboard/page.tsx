"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/app/context/auth-context"
import { useCart } from "@/app/context/CartContext"
import { useRouter } from "next/navigation"
import { ShoppingCart, Package, Clock, TrendingUp, User, Mail, Phone, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const { state } = useCart()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !user) {
      router.push("/login")
    }
  }, [user, router, mounted])

  if (!mounted || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const cartItems = state?.items || []
  const cartTotal = state?.total || 0
  const cartItemCount = state?.itemCount || 0

  // Mock data for demonstration
  const recentOrders = [
    {
      id: "CC001234",
      date: "2024-01-15",
      status: "Delivered",
      total: 15750,
      items: 8,
    },
    {
      id: "CC001235",
      date: "2024-01-10",
      status: "Processing",
      total: 8900,
      items: 5,
    },
    {
      id: "CC001236",
      date: "2024-01-05",
      status: "Confirmed",
      total: 12300,
      items: 6,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800"
      case "Processing":
        return "bg-blue-100 text-blue-800"
      case "Confirmed":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.email?.split("@")[0]}!</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cart Items</p>
                  <p className="text-2xl font-bold text-gray-900">{cartItemCount}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cart Value</p>
                  <p className="text-2xl font-bold text-gray-900">₹{cartTotal.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{recentOrders.length}</p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recentOrders.filter((order) => order.status !== "Delivered").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Cart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Current Cart
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {cartItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            {item.brand} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {cartItems.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">... and {cartItems.length - 3} more items</p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-lg font-bold">Total: ₹{cartTotal.toLocaleString()}</div>
                      <Button asChild>
                        <Link href="/cart">
                          View Cart
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Your cart is empty</p>
                    <Button asChild>
                      <Link href="/products/bulk-chemicals">Browse Products</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Member since {new Date(user.created_at || "").toLocaleDateString()}</span>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/dashboard/upload">
                    <Package className="mr-2 h-4 w-4" />
                    Upload Quote Request
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/dashboard/history">
                    <Clock className="mr-2 h-4 w-4" />
                    Order History
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/contact">
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Orders */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString()} • {order.items} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard/history">
                  View All Orders
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
