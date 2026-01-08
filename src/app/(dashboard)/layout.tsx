import type { Metadata } from 'next';
import { ThemeModeToggle } from '@/components/shared/theme-toggle';
import { NotificationBell } from '@/components/ui/notification-bell';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/features/dashboard/components/app-sidebar';

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'Manage your campaigns, track leads, and monitor performance metrics from your Samatva CRM dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex h-full flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          </div>
          <div className="flex items-center gap-3 px-4">
            <ThemeModeToggle />
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-2">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
