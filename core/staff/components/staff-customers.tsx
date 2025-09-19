"use client"

import { MessageSquare, Heart, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"

interface FavoriteCustomer {
  id: string
  name: string
  visits: number
  lastVisit: string
}

interface StaffCustomersProps {
  favoriteCustomers: FavoriteCustomer[]
}

export function StaffCustomers({ favoriteCustomers }: StaffCustomersProps) {
  return (
    <div className="space-y-4">
      {/* Top Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>Most frequent visitors</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Visits</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {favoriteCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {customer.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{customer.visits}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(customer.lastVisit), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {favoriteCustomers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No customer data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Preferences</CardTitle>
          <CardDescription>Common requests and notes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Heart className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Favorite Services</p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">Haircut</Badge>
                  <Badge variant="outline" className="text-xs">Color</Badge>
                  <Badge variant="outline" className="text-xs">Styling</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Preferred Times</p>
                <p className="text-xs text-muted-foreground">Weekday mornings, Saturday afternoons</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Common Notes</p>
                <p className="text-xs text-muted-foreground">
                  Prefers minimal conversation, sensitive scalp, always requests same products
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}