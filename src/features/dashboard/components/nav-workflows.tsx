'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  // SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export function NavWorkflows({
  workflows,
}: {
  workflows: {
    name: string;
    url: string;
    icon: LucideIcon;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  // Find which workflow contains the active path
  const getActiveWorkflow = useCallback(() => {
    return (
      workflows.find((w) => w.url === pathname || w.items?.some((item) => item.url === pathname))
        ?.name || null
    );
  }, [workflows, pathname]);

  // Always start null (closed) on the server to prevent aria-controls hydration mismatch.
  // The useEffect below sets the correct open item after client hydration.
  const [openWorkflow, setOpenWorkflow] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update open workflow when pathname changes (client-only)
  useEffect(() => {
    const activeWorkflow = getActiveWorkflow();
    setOpenWorkflow(activeWorkflow);
  }, [getActiveWorkflow]);

  const content = (
    <SidebarGroup>
      <SidebarMenu>
        {workflows.map((workflow) => {
          const hasSubItems = !!(workflow.items && workflow.items.length > 0);
          const workflowBase = `/${workflow.url.split('/').filter(Boolean)[0] || ''}`;
          const isActive =
            workflow.url === pathname ||
            workflow.items?.some((item) => item.url === pathname) ||
            (workflowBase !== '/' && pathname.startsWith(`${workflowBase}/`));

          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={workflow.name}>
                <SidebarMenuButton asChild tooltip={workflow.name} isActive={isActive}>
                  <a href={workflow.url}>
                    {workflow.icon && <workflow.icon />}
                    <span>{workflow.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={workflow.name}
              asChild
              open={openWorkflow === workflow.name}
              onOpenChange={(isOpen) => {
                setOpenWorkflow(isOpen ? workflow.name : null);
              }}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={workflow.name} isActive={isActive}>
                    {workflow.icon && <workflow.icon />}
                    <span>{workflow.name}</span>
                    {workflow.items && workflow.items.length > 0 && (
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {workflow.items && workflow.items.length > 0 && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {workflow.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={subItem.url === pathname}>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );

  if (!mounted) {
    return (
      <SidebarGroup>
        <SidebarMenu>
          {workflows.map((workflow) => (
            <SidebarMenuItem key={workflow.name}>
              <SidebarMenuButton tooltip={workflow.name}>
                {workflow.icon && <workflow.icon />}
                <span>{workflow.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return content;
}
