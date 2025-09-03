'use client'
import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Input,
  Label,
  Badge,
} from "@/components/ui"
import { toast } from "sonner"
import {
  FileText,
  Download,
  Upload,
  Settings,
  Calendar,
  Grid,
  List,
  Mail,
  MessageSquare,
  Printer,
  RefreshCw,
  Search,
  Bookmark,
  Clock
} from "lucide-react"
interface AppMenubarProps {
  currentView?: 'calendar' | 'list' | 'grid'
  onViewChange?: (view: 'calendar' | 'list' | 'grid') => void
  showArchived?: boolean
  onShowArchivedChange?: (show: boolean) => void
  theme?: 'light' | 'dark' | 'system'
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void
}
export function AppMenubar({
  currentView = 'list',
  onViewChange,
  showArchived = false,
  onShowArchivedChange,
  theme: _theme = 'system',
  onThemeChange: _onThemeChange
}: AppMenubarProps) {
  const router = useRouter()
  const [isNewServiceOpen, setIsNewServiceOpen] = React.useState(false)
  const [isNewStaffOpen, setIsNewStaffOpen] = React.useState(false)
  const [serviceName, setServiceName] = React.useState('')
  const [staffName, setStaffName] = React.useState('')
  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault()
            setIsNewServiceOpen(true)
            break
          case 's':
            e.preventDefault()
            setIsNewStaffOpen(true)
            break
          case 'p':
            e.preventDefault()
            handlePrint()
            break
          case 'k':
            e.preventDefault()
            // Trigger command palette
            document.dispatchEvent(new KeyboardEvent('keydown', { 
              key: 'k', 
              metaKey: true, 
              bubbles: true 
            }))
            break
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  const handleNewService = async () => {
    if (!serviceName.trim()) {
      toast.error('Please enter a service name')
      return
    }
    try {
      // In a real app, this would save to the database
      toast.success(`Service "${serviceName}" created successfully!`)
      setServiceName('')
      setIsNewServiceOpen(false)
      // Optionally navigate to the service editing page
      router.push('/salon/services')
    } catch (_error) {
      toast.error('Failed to create service')
    }
  }
  const handleNewStaff = async () => {
    if (!staffName.trim()) {
      toast.error('Please enter a staff member name')
      return
    }
    try {
      // In a real app, this would save to the database
      toast.success(`Staff member "${staffName}" added successfully!`)
      setStaffName('')
      setIsNewStaffOpen(false)
      router.push('/salon/staff')
    } catch (_error) {
      toast.error('Failed to add staff member')
    }
  }
  const handleExport = (type: 'services' | 'staff' | 'appointments' | 'customers') => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: `Exporting ${type}...`,
        success: `${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully!`,
        error: `Failed to export ${type}`,
      }
    )
  }
  const handleImportData = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.csv,.xlsx,.json'
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        toast.promise(
          new Promise(resolve => setTimeout(resolve, 3000)),
          {
            loading: `Importing data from ${file.name}...`,
            success: 'Data imported successfully!',
            error: 'Failed to import data',
          }
        )
      }
    }
    fileInput.click()
  }
  const handlePrint = () => {
    window.print()
    toast.success('Print dialog opened')
  }
  const handleBulkAction = (action: string) => {
    toast.info(`${action} functionality coming soon!`)
  }
  const recentItems = [
    { name: 'Appointment #1234', href: '/salon/appointments/1234', time: '2 min ago' },
    { name: 'Staff Schedule Update', href: '/salon/staff/schedule', time: '5 min ago' },
    { name: 'Service Price Update', href: '/salon/services', time: '10 min ago' },
  ]
  const bookmarkedPages = [
    { name: 'Today\'s Dashboard', href: '/salon', icon: Calendar },
    { name: 'Analytics Overview', href: '/salon/analytics', icon: FileText },
    { name: 'Customer Management', href: '/salon/customers', icon: Search },
  ]
  return (
    <>
      <Menubar className="border-none">
        <MenubarMenu>
          <MenubarTrigger className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            File
          </MenubarTrigger>
          <MenubarContent>
            <Dialog open={isNewServiceOpen} onOpenChange={setIsNewServiceOpen}>
              <DialogTrigger asChild>
                <MenubarItem>
                  New Service <MenubarShortcut>⌘N</MenubarShortcut>
                </MenubarItem>
              </DialogTrigger>
            </Dialog>
            <Dialog open={isNewStaffOpen} onOpenChange={setIsNewStaffOpen}>
              <DialogTrigger asChild>
                <MenubarItem>
                  New Staff Member <MenubarShortcut>⌘S</MenubarShortcut>
                </MenubarItem>
              </DialogTrigger>
            </Dialog>
            <MenubarItem asChild>
              <Link href="/salon/appointments/new">
                New Appointment
              </Link>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>
                <Download className="mr-2 h-4 w-4" />
                Export
              </MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => handleExport('services')}>
                  Export Services
                </MenubarItem>
                <MenubarItem onClick={() => handleExport('staff')}>
                  Export Staff List
                </MenubarItem>
                <MenubarItem onClick={() => handleExport('appointments')}>
                  Export Appointments
                </MenubarItem>
                <MenubarItem onClick={() => handleExport('customers')}>
                  Export Customers
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarItem onClick={handleImportData}>
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>
                <Clock className="mr-2 h-4 w-4" />
                Recent
              </MenubarSubTrigger>
              <MenubarSubContent className="w-64">
                {recentItems.map((item, index) => (
                  <MenubarItem key={index} asChild>
                    <Link href={item.href} className="flex justify-between">
                      <span>{item.name}</span>
                      <Badge variant="outline">
                        {item.time}
                      </Badge>
                    </Link>
                  </MenubarItem>
                ))}
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled>
              Undo <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled>
              Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => handleBulkAction('Bulk Edit Services')}>
              Bulk Edit Services
            </MenubarItem>
            <MenubarItem onClick={() => handleBulkAction('Bulk Update Prices')}>
              Bulk Update Prices
            </MenubarItem>
            <MenubarItem onClick={() => handleBulkAction('Bulk Staff Schedule Update')}>
              Bulk Staff Schedule
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            View
          </MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value={currentView} onValueChange={onViewChange}>
              <MenubarRadioItem value="calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar View
              </MenubarRadioItem>
              <MenubarRadioItem value="list">
                <List className="mr-2 h-4 w-4" />
                List View
              </MenubarRadioItem>
              <MenubarRadioItem value="grid">
                <Grid className="mr-2 h-4 w-4" />
                Grid View
              </MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSeparator />
            <MenubarCheckboxItem
              checked={showArchived}
              onCheckedChange={onShowArchivedChange}
            >
              Show Archived Items
            </MenubarCheckboxItem>
            <MenubarItem asChild>
              <Link href="/salon/settings/display">
                <Settings className="mr-2 h-4 w-4" />
                Display Settings
              </Link>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Tools
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem asChild>
              <Link href="/salon/marketing/sms">
                <MessageSquare className="mr-2 h-4 w-4" />
                Bulk SMS
              </Link>
            </MenubarItem>
            <MenubarItem asChild>
              <Link href="/salon/marketing/email">
                <Mail className="mr-2 h-4 w-4" />
                Email Campaign
              </Link>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => handleBulkAction('Sync Calendar')}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Calendar
            </MenubarItem>
            <MenubarItem onClick={() => handleBulkAction('Backup Data')}>
              Backup Data
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem asChild>
              <Link href="/salon/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Bookmarks
          </MenubarTrigger>
          <MenubarContent>
            {bookmarkedPages.map((page, index) => (
              <MenubarItem key={index} asChild>
                <Link href={page.href} className="flex items-center">
                  <page.icon className="mr-2 h-4 w-4" />
                  {page.name}
                </Link>
              </MenubarItem>
            ))}
            <MenubarSeparator />
            <MenubarItem disabled>
              <Bookmark className="mr-2 h-4 w-4" />
              Bookmark Current Page
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      {/* New Service Dialog */}
      <Dialog open={isNewServiceOpen} onOpenChange={setIsNewServiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Service</DialogTitle>
            <DialogDescription>
              Add a new service to your salon offerings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Service Name</Label>
              <Input
                id="service-name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Enter service name..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewServiceOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleNewService}>Create Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* New Staff Dialog */}
      <Dialog open={isNewStaffOpen} onOpenChange={setIsNewStaffOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Add a new team member to your salon.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Full Name</Label>
              <Input
                id="staff-name"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="Enter staff member name..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewStaffOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleNewStaff}>Add Staff Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}