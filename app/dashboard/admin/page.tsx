"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  email: string
  role: "user" | "admin" | "vendor"
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data: usersData, error } = await supabase.from("profiles").select("id, email, role")

    if (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch user data.",
        variant: "destructive",
      })
    } else {
      setUsers(usersData as UserProfile[])
    }
    setLoading(false)
  }

  const updateUserRole = async (userId: string, newRole: UserProfile["role"]) => {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

    if (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: `Failed to update role for user ${userId}.`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `User role updated to ${newRole}.`,
        variant: "default",
      })
      fetchUsers() // Re-fetch users to update the UI
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Admin Panel</h1>
        <Card>
          <CardHeader>
            <CardTitle>Loading Users...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while we fetch user data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Admin Panel</h1>

      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id.substring(0, 8)}...</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(newRole: UserProfile["role"]) => updateUserRole(user.id, newRole)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
