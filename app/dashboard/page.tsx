"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/app/context/CartContext"
import { useAuth } from "@/app/context/auth-context"
import { ShoppingCart, Package, TrendingUp, Clock, Plus, FileText, Upload, History } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { state } = useCart()
  const { user } = useAuth()

  const stats = [
    {
      title: "Cart Items",
      value: state.itemCount.toString(),
      icon: ShoppingCart,
      description: "Items in your current cart",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Cart Value",
      value: `₹${state.total.toLocaleString()}`,
      icon: TrendingUp,
      description: "Total value of cart items",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Orders",
      value: "2",
      icon: Clock,
      description: "Orders awaiting confirmation",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completed Orders",
      value: "15",
      icon: Package,
      description: "Successfully delivered orders",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const quickActions = [
    {
      title: "Browse Products",
      description: "Explore our chemical catalog",
      href: "/products",
      icon: Plus,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Upload Quote",
      description: "Upload your requirement list",
      href: "/dashboard/upload",
      icon: Upload,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Order History",
      description: "View past orders and quotes",
      href: "/dashboard/history",
      icon: History,
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Generate Quote",
      description: "Create quote from cart",
      href: "/dashboard/quote-cart",
      icon: FileText,
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split("@")[0] || "User"}!
          </h1>
          <p className="text-gray-600">Manage your orders, quotes, and chemical requirements</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <Button
                      key={action.title}
                      asChild
                      variant="outline"
                      className="h-auto p-4 justify-start bg-transparent"
                    >
                      <Link href={action.href}>
                        <div className={`p-2 rounded-lg mr-3 ${action.color}`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{action.title}</p>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Cart */}
            {state.items.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Current Cart
                    <Badge variant="secondary">{state.itemCount} items</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {state.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium line-clamp-1">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.brand} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          {item.price === 0 ? "POR" : `₹${(item.price * item.quantity).toLocaleString()}`}
                        </p>
                      </div>
                    ))}
                    {state.items.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">+{state.items.length - 3} more items</p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button asChild className="flex-1">
                        <Link href="/cart">View Cart</Link>
                      </Button>
                      <Button asChild variant="outline" className="flex-1 bg-transparent">
                        <Link href="/payments">Checkout</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Order #ORD-2024-001</p>
                      <p className="text-xs text-gray-500">Confirmed - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Quote Request Submitted</p>
                      <p className="text-xs text-gray-500">Pending review - 1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Cart Updated</p>
                      <p className="text-xs text-gray-500">Added 3 items - 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Order #ORD-2024-002</p>
                      <p className="text-xs text-gray-500">Delivered - 1 week ago</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/dashboard/history">View All Activity</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Our team is here to help with your chemical requirements.</p>
                  <div className="space-y-2">
                    <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                      <Link href="/contact">
                        <FileText className="h-4 w-4 mr-2" />
                        Contact Support
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                      <Link href="tel:+919876543210">
                        <Clock className="h-4 w-4 mr-2" />
                        Call: +91 98765 43210
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
