'use client';

import type * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context';
import { dashboardData } from '../lib/dashboard-data';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { SidebarLogo } from './sidebar-logo';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={dashboardData.navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
