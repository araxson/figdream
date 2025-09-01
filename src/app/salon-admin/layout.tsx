import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { CommandTrigger } from '@/components/features/command-trigger'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"

export default async function SalonOwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login/salon-owner")
  }

  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (!userRole || (userRole.role !== "salon_owner" && userRole.role !== "salon_owner")) {
    redirect("/403")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <SidebarProvider>
      <AppSidebar user={user} profile={profile} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 px-3">
              <span className="font-semibold">Salon Admin</span>
            </div>
            <Menubar className="ml-4">
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    New Service <MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    New Staff Member <MenubarShortcut>⌘S</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarSub>
                    <MenubarSubTrigger>Export</MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem>Export Services</MenubarItem>
                      <MenubarItem>Export Staff List</MenubarItem>
                      <MenubarItem>Export Appointments</MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                  <MenubarSeparator />
                  <MenubarItem>
                    Print <MenubarShortcut>⌘P</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Bulk Edit Services</MenubarItem>
                  <MenubarItem>Bulk Update Prices</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Calendar View</MenubarItem>
                  <MenubarItem>List View</MenubarItem>
                  <MenubarItem>Grid View</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Show Archived</MenubarItem>
                  <MenubarItem>Show Inactive Staff</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Tools</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Bulk SMS</MenubarItem>
                  <MenubarItem>Email Campaign</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Import Data</MenubarItem>
                  <MenubarItem>Sync Calendar</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Settings</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
          <CommandTrigger userRole="salon_owner" />
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}