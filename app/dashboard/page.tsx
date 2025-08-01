"use client"

import { useAuth } from "@/app/context/auth-context"
import { useCart } from "@/app/context/CartContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ShoppingCart,
  Package,
  Upload,
  History,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Building,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const recentOrders = [
  {
    id: "ORD-2024-001",
    date: "2024-01-15",
    status: "Delivered",
    total: "₹15,450",
    items: 3,
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-10",
    status: "Processing",
    total: "₹8,920",
    items: 2,
  },
  {
    id: "ORD-2024-003",
    date: "2024-01-05",
    status: "Shipped",
    total: "₹22,100",
    items: 5,
  },
]

const quickStats = [
  {
    title: "Total Orders",
    value: "24",
    change: "+12%",
    icon: Package,
    color: "text-blue-600",
  },
  {
    title: "Cart Items",
    value: "0",
    change: "0 items",
    icon: ShoppingCart,
    color: "text-green-600",
  },
  {
    title: "Pending Quotes",
    value: "3",
    change: "2 new",
    icon: Clock,
    color: "text-orange-600",
  },
  {
    title: "This Month",
    value: "₹45,670",
    change: "+8%",
    icon: TrendingUp,
    color: "text-purple-600",
  },
]

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { totalItems } = useCart()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Update cart items in stats
  quickStats[1].value = totalItems.toString()
  quickStats[1].change = `${totalItems} items`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user.email?.split("@")[0]}!</h1>
          <p className="text-slate-600">Manage your orders, track shipments, and explore our latest products.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-slate-100 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts to help you get things done faster</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button asChild className="h-auto p-4 justify-start">
                    <Link href="/products">
                      <ShoppingCart className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Browse Products</div>
                        <div className="text-xs opacity-70">Explore our catalog</div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4 justify-start bg-transparent">
                    <Link href="/dashboard/upload">
                      <Upload className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Upload Requirements</div>
                        <div className="text-xs opacity-70">Get custom quotes</div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4 justify-start bg-transparent">
                    <Link href="/dashboard/history">
                      <History className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Order History</div>
                        <div className="text-xs opacity-70">View past orders</div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4 justify-start bg-transparent">
                    <Link href="/cart">
                      <Package className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">View Cart</div>
                        <div className="text-xs opacity-70">{totalItems} items</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Your latest order activity</CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/history">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <Package className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{order.id}</p>
                          <p className="text-sm text-slate-500">
                            {order.date} • {order.items} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">{order.total}</p>
                        <Badge
                          variant={
                            order.status === "Delivered"
                              ? "default"
                              : order.status === "Processing"
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-slate-500">Email Address</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Research Lab</p>
                    <p className="text-xs text-slate-500">Organization</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-600">Verified Account</p>
                    <p className="text-xs text-slate-500">Account Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Progress */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>This Month's Progress</CardTitle>
                <CardDescription>Your ordering activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Orders Completed</span>
                    <span>8/10</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Budget Used</span>
                    <span>₹45,670/₹60,000</span>
                  </div>
                  <Progress value={76} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">
                  Our technical support team is here to help with product selection and technical queries.
                </p>
                <div className="space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/about">View FAQ</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
