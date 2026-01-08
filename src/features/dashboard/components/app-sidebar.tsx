'use client';

import type * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { dashboardData } from '../lib/dashboard-data';
import { NavMain } from './nav-main';
import { NavSecondary } from './nav-secondary';
import { NavUser } from './nav-user';
import { NavWorkflows } from './nav-workflows';
import { SidebarLogo } from './sidebar-logo';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={dashboardData.navMain} />
        <NavWorkflows workflows={dashboardData.workflows} />
        <NavSecondary items={dashboardData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={dashboardData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
