"use client"
import { useState } from "react"
import { FileText, Plus, Send, Copy, Edit, Trash2 } from "lucide-react"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// DatePicker needs to be implemented or use Calendar with Popover
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
interface InvoiceTemplate {
  id: string
  name: string
  description: string
  items: InvoiceItem[]
  totalAmount: number
}
interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}
interface ManualInvoice {
  salonId: string
  salonName: string
  email: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  dueDate: Date | undefined
  notes: string
}
export function InvoiceManager() {
  const [_selectedTemplate, _setSelectedTemplate] = useState<string>("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [manualInvoice, setManualInvoice] = useState<ManualInvoice>({
    salonId: "",
    salonName: "",
    email: "",
    items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0,
    dueDate: undefined,
    notes: ""
  })
  const templates: InvoiceTemplate[] = [
    {
      id: "1",
      name: "Monthly Subscription",
      description: "Standard monthly subscription invoice",
      items: [
        { description: "Professional Plan - Monthly", quantity: 1, unitPrice: 299, total: 299 }
      ],
      totalAmount: 299
    },
    {
      id: "2",
      name: "Annual Subscription",
      description: "Annual subscription with discount",
      items: [
        { description: "Professional Plan - Annual", quantity: 1, unitPrice: 2990, total: 2990 }
      ],
      totalAmount: 2990
    },
    {
      id: "3",
      name: "Enterprise Package",
      description: "Enterprise features and support",
      items: [
        { description: "Enterprise Plan", quantity: 1, unitPrice: 999, total: 999 },
        { description: "Priority Support", quantity: 1, unitPrice: 299, total: 299 },
        { description: "Custom Integration", quantity: 1, unitPrice: 500, total: 500 }
      ],
      totalAmount: 1798
    }
  ]
  const addInvoiceItem = () => {
    setManualInvoice({
      ...manualInvoice,
      items: [...manualInvoice.items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]
    })
  }
  const removeInvoiceItem = (index: number) => {
    const newItems = manualInvoice.items.filter((_, i) => i !== index)
    setManualInvoice({ ...manualInvoice, items: newItems })
  }
  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...manualInvoice.items]
    newItems[index] = { ...newItems[index], [field]: value }
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
    }
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.1 // 10% tax
    setManualInvoice({
      ...manualInvoice,
      items: newItems,
      subtotal,
      tax,
      total: subtotal + tax
    })
  }
  const handleCreateInvoice = () => {
    // Handle invoice creation
    setIsCreateDialogOpen(false)
  }
  const handleBulkGeneration = () => {
    // Handle bulk invoice generation
    setIsBulkDialogOpen(false)
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoice Manager</h1>
          <p className="text-muted-foreground">Create and manage invoices</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Bulk Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Invoice Generation</DialogTitle>
                <DialogDescription>
                  Generate invoices for multiple salons at once
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Invoice Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select invoice type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Subscriptions</SelectItem>
                      <SelectItem value="annual">Annual Subscriptions</SelectItem>
                      <SelectItem value="overdue">Overdue Reminders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Salon Tier</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Billing Period</Label>
                  {/* TODO: Implement date picker for billing period */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Pick a date</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This will generate <span className="font-semibold">234 invoices</span> totaling{" "}
                      <span className="font-semibold">$45,678</span>
                    </p>
                  </CardContent>
                </Card>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkGeneration}>
                  Generate Invoices
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Manual Invoice</DialogTitle>
                <DialogDescription>
                  Create a custom invoice for a salon
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Salon Name</Label>
                    <Input
                      value={manualInvoice.salonName}
                      onChange={(e) => setManualInvoice({ ...manualInvoice, salonName: e.target.value })}
                      placeholder="Enter salon name"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={manualInvoice.email}
                      onChange={(e) => setManualInvoice({ ...manualInvoice, email: e.target.value })}
                      placeholder="billing@salon.com"
                    />
                  </div>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !manualInvoice.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {manualInvoice.dueDate ? (
                          format(manualInvoice.dueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={manualInvoice.dueDate}
                        onSelect={(date) => setManualInvoice({ ...manualInvoice, dueDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Invoice Items</Label>
                  <div className="space-y-2 mt-2">
                    {manualInvoice.items.map((item, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                          />
                        </div>
                        <div className="w-20">
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="w-32">
                          <Input
                            type="number"
                            placeholder="Unit Price"
                            value={item.unitPrice}
                            onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="w-32">
                          <Input
                            type="number"
                            value={item.total}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeInvoiceItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addInvoiceItem}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">${manualInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span className="font-medium">${manualInvoice.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${manualInvoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={manualInvoice.notes}
                    onChange={(e) => setManualInvoice({ ...manualInvoice, notes: e.target.value })}
                    placeholder="Additional notes or terms"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateInvoice}>
                  <Send className="h-4 w-4 mr-2" />
                  Create & Send
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Invoice Templates</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Templates</CardTitle>
              <CardDescription>Pre-configured invoice templates for common scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">${template.totalAmount}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {template.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{item.description}</span>
                              <span className="font-medium">${item.total}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" className="flex-1">
                          <FileText className="h-3 w-3 mr-1" />
                          Use
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
              <CardDescription>Invoices awaiting approval before sending</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Salon</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">INV-2024-001</TableCell>
                    <TableCell>Beauty Salon Pro</TableCell>
                    <TableCell>$1,299</TableCell>
                    <TableCell>2024-06-15</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pending Review</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Review</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Invoices</CardTitle>
              <CardDescription>Automatically generated recurring invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Salon</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Next Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Monthly</TableCell>
                    <TableCell>Elite Beauty Studio</TableCell>
                    <TableCell>$299/mo</TableCell>
                    <TableCell>2024-07-01</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Pause</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}