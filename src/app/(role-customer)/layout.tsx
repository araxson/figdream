import { redirect } from 'next/navigation';
import { createClient } from '@/lib/database/supabase/server';
import { getCustomerByUserId } from '@/lib/data-access/customers';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui';
import { CustomerSidebar } from '@/components/customer';
import { CommandTrigger } from '@/components/shared/command-trigger';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/customer');
  }

  const customer = await getCustomerByUserId(user.id);
  
  if (!customer) {
    // User exists but no customer profile
    redirect('/register/customer');
  }

  return (
    <SidebarProvider>
      <CustomerSidebar user={user} customer={customer} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 px-3">
              <span className="font-semibold">Customer Dashboard</span>
            </div>
          </div>
          <CommandTrigger userRole="customer" />
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}