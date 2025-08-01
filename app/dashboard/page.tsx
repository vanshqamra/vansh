"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/app/context/CartContext"
import { ShoppingCart, Package, Clock, TrendingUp, FileText, Upload } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { state } = useCart()

  const stats = [
    {
      title: "Cart Items",
      value: state.itemCount || 0,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Cart Value",
      value: `₹${(state.total || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Orders",
      value: "2",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Orders",
      value: "15",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  const recentOrders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      items: 5,
      total: 12500,
      status: "Confirmed",
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      items: 3,
      total: 8750,
      status: "Delivered",
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      items: 8,
      total: 15200,
      status: "Processing",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's your account overview.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Current Cart
                </CardTitle>
              </CardHeader>
              <CardContent>
                {state.items && state.items.length > 0 ? (
                  <div className="space-y-4">
                    {state.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-600">
                            {item.brand} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                    ))}
                    {state.items.length > 3 && (
                      <p className="text-sm text-gray-600">+{state.items.length - 3} more items</p>
                    )}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{state.total.toLocaleString()}</span>
                      </div>
                      <Button asChild className="w-full mt-4">
                        <Link href="/cart">View Cart</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Your cart is empty</p>
                    <Button asChild>
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{order.id}</h4>
                        <p className="text-sm text-gray-600">
                          {order.date} • {order.items} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.total.toLocaleString()}</p>
                        <Badge
                          variant={
                            order.status === "Delivered"
                              ? "default"
                              : order.status === "Confirmed"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/dashboard/history">View All Orders</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                  <Link href="/dashboard/upload">
                    <Upload className="h-6 w-6 mb-2" />
                    Upload Quote Request
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                  <Link href="/dashboard/quote-cart">
                    <FileText className="h-6 w-6 mb-2" />
                    Quote Cart
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                  <Link href="/products/qualigens">
                    <Package className="h-6 w-6 mb-2" />
                    Browse Qualigens
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
