import { redirect } from 'next/navigation';
import { createClient } from '@/lib/database/supabase/server';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SuperAdminSidebar } from './components/app-sidebar';
import { CommandTrigger } from '@/components/features/command-trigger';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/super-admin');
  }

  // Check if user is super admin
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!userRole || userRole.role !== 'super_admin') {
    redirect('/403');
  }

  return (
    <SidebarProvider>
      <SuperAdminSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 px-3">
              <span className="font-semibold">Platform Management</span>
            </div>
          </div>
          <CommandTrigger userRole="super_admin" />
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}