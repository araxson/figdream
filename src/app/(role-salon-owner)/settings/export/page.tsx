import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileDown, Calendar, Users, DollarSign, Package, Database, Download } from "lucide-react"

export default async function ExportDataPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userRole } = await supabase
    .from("user_roles")
    .select("*, salons (*)")
    .eq("user_id", user.id)
    .eq("role", "salon_owner")
    .single()

  if (!userRole) redirect("/error-403")

  // Get export history
  const { data: exportHistory } = await supabase
    .from("data_exports")
    .select("*")
    .eq("salon_id", userRole.salon_id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export Data</h1>
        <p className="text-muted-foreground">Download your salon data for backup or analysis</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Export</CardTitle>
              <CardDescription>Download commonly requested data sets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium">Appointments</p>
                      <p className="text-xs text-muted-foreground">All appointment records</p>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium">Customers</p>
                      <p className="text-xs text-muted-foreground">Customer database</p>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium">Financial Reports</p>
                      <p className="text-xs text-muted-foreground">Revenue and payments</p>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium">Services & Pricing</p>
                      <p className="text-xs text-muted-foreground">Service catalog</p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Export</CardTitle>
              <CardDescription>Select specific data to export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-date" className="text-xs">Start Date</Label>
                    <Input 
                      id="start-date" 
                      type="date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date" className="text-xs">End Date</Label>
                    <Input 
                      id="end-date" 
                      type="date"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Data to Include</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-appointments" defaultChecked />
                    <Label htmlFor="export-appointments" className="font-normal">
                      Appointments
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-customers" defaultChecked />
                    <Label htmlFor="export-customers" className="font-normal">
                      Customers
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-staff" />
                    <Label htmlFor="export-staff" className="font-normal">
                      Staff Members
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-services" />
                    <Label htmlFor="export-services" className="font-normal">
                      Services
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-payments" />
                    <Label htmlFor="export-payments" className="font-normal">
                      Payments & Transactions
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-reviews" />
                    <Label htmlFor="export-reviews" className="font-normal">
                      Reviews & Ratings
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-loyalty" />
                    <Label htmlFor="export-loyalty" className="font-normal">
                      Loyalty Points
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-marketing" />
                    <Label htmlFor="export-marketing" className="font-normal">
                      Marketing Campaigns
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="export-format">Export Format</Label>
                <Select defaultValue="csv">
                  <SelectTrigger id="export-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">
                <FileDown className="h-4 w-4 mr-2" />
                Generate Export
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>Recently generated exports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exportHistory?.map((export_) => (
                  <div key={export_.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">{export_.export_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(export_.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">No recent exports</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full Backup</CardTitle>
              <CardDescription>Download all salon data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <Database className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Complete Data Backup</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Includes all salon data, settings, and history
                </p>
              </div>
              
              <Button className="w-full">
                <Database className="h-4 w-4 mr-2" />
                Create Full Backup
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Export</CardTitle>
              <CardDescription>GDPR and data compliance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate reports for data protection compliance and customer data requests.
              </p>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Customer Data Request
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Data Processing Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Privacy Audit Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}