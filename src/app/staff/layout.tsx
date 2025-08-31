import { redirect } from 'next/navigation';
import { createClient } from '@/lib/database/supabase/server';
import { getStaffByUserId } from '@/lib/data-access/staff';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { StaffSidebar } from './components/app-sidebar';
import { CommandTrigger } from '@/components/features/command-trigger';

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/staff');
  }

  const staff = await getStaffByUserId(user.id);
  
  if (!staff) {
    // User exists but no staff profile
    redirect('/register/staff');
  }

  return (
    <SidebarProvider>
      <StaffSidebar user={user} staff={staff} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 px-3">
              <span className="font-semibold">Staff Dashboard</span>
            </div>
          </div>
          <CommandTrigger userRole="staff" />
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}